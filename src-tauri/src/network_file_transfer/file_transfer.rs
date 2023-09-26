#![allow(dead_code)]

use std::fs::File;
use std::hash::Hasher;
use std::io::{Read, self, SeekFrom, Seek};
use std::os::windows::fs::FileExt;
use std::path::Path;
use std::time::Duration;
use std::sync::Arc;
use aes_gcm::AesGcm;
use aes_gcm::aead::consts::U12;
use aes_gcm::aes::Aes256;
use flate2::Compression;
use flate2::write::GzEncoder;
use log::error;
use serde::{Serialize, Deserialize};
use sha256::try_digest;
use t1ha::T1haHasher;
use tauri::{AppHandle, Manager};
use tokio::spawn;
use tokio::sync::{mpsc, Mutex};
use tokio::time::{Instant, sleep};
use uuid::Uuid;
use walkdir::WalkDir;
use crate::directory::SelectedEntry;
use crate::network_file_transfer::client::{MAX_FILE_READ_LENGTH, Packet};
use crate::network_file_transfer::packet_type::PacketType;
use super::client::CONNECTION_DATA;
use miniz_oxide::deflate::compress_to_vec;
use miniz_oxide::inflate::decompress_to_vec;
use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Nonce, Key // Or `Aes128Gcm`
};
use std::io::Write;

#[tauri::command]
pub(crate) async fn send_folder(app: AppHandle, path: String) {
    let walk_dir = WalkDir::new(path).max_depth(1);

    for entry in walk_dir {
        let entry = entry.unwrap();
        if entry.file_type().is_file() {
            send_file(app.clone(), entry.path().to_str().unwrap().to_string(), entry.file_name().to_str().unwrap().to_string()).await;
        }
    }
}

#[tauri::command]
pub(crate) async fn send_folder_all(app: AppHandle, path: String) {
    for entry in WalkDir::new(path) {
        let entry = entry.unwrap();
        if entry.file_type().is_file() {
            send_file(app.clone(), entry.path().to_str().unwrap().to_string(), entry.file_name().to_str().unwrap().to_string()).await;
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct FileTransferProgress {
    file_name: String,
    progress: u8,
}

impl FileTransferProgress {
    fn new(file_name: String, progress: u8) -> Self {
        Self {
            file_name,
            progress,
        }
    }
}


#[derive(Serialize, Deserialize, Clone, Debug)]
struct FileTransferStart {
    path: String,
    name: String,
    uuid: Vec<u8>,
}

impl FileTransferStart {
    fn new(path: String, name: String, uuid: Vec<u8>) -> Self {
        Self {
            path,
            name,
            uuid
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct Error<'a> {
    error: &'a str,
    title: &'a str,
}

#[tauri::command]
pub(crate) async fn send_file(app: AppHandle, path: String, name: String) {
    spawn(async move {
        let s_packet_sender = match CONNECTION_DATA.lock().await.get_s_packet_sender() {
            Some(sender) => sender,
            None => {
                app.emit_all("display-error", Error { error: "Failed to send file because the client is not connected to a server!", title: "" }).unwrap();
                return;
            },
        };
    
        let mut file = match File::open(path.clone()) {
            Ok(file) => file,
            Err(error) => {
                app.emit_all("display-error", Error { error: format!("Failed to open file: {}", error).as_str(), title: "" }).unwrap();
                return;
            }
        };
        let file_len = file.seek(SeekFrom::End(0)).unwrap();
    
        let is_bar_ready = Arc::new(Mutex::new(false));

        let uuid_bytes = send_new_file_packet(&file, path.clone(), name.clone(), &s_packet_sender);
        let uuid_con_string: String = uuid_bytes.iter().map(|&byte| format!("{}", byte)).collect();

        let bar_ready_event_name = format!("bar_is_ready_{}", uuid_con_string);
        let is_bar_ready_clone = is_bar_ready.clone();
        let (ready_sender, mut ready_receiver) = mpsc::unbounded_channel();
        spawn(async move {
            ready_receiver.recv().await.unwrap();
            *is_bar_ready_clone.lock().await = true;
        });
        app.listen_global(bar_ready_event_name,  move |_| {
            ready_sender.send(()).unwrap();
        });
        emit_file_transfer_start(app.clone(), path.clone(), name.clone(), uuid_bytes.clone());
        let progress_event_name = format!("transfer_progress_{}", uuid_con_string);
    
        let key = CONNECTION_DATA.lock().await.get_aes_key().unwrap();
        let key = Key::<Aes256Gcm>::from_slice(&key);
        let cipher = Aes256Gcm::new(&key);
    
        let mut offset = 0;
        loop {
            let old_offset = offset;
            let (reached_end, compressed_bytes) = read_and_compress_file_chunk(&file, &mut offset).unwrap();
            
            let (cipher_data, nonce_bytes) = encrypt_bytes(&compressed_bytes, &cipher);
    
            send_file_chunk_packet(&uuid_bytes, old_offset, cipher_data, nonce_bytes, &s_packet_sender);        
    
            if reached_end {
                update_progress(app.clone(), is_bar_ready.clone(), progress_event_name.clone(), offset, file_len, true).await;
                break;
            }
    
            offset += MAX_FILE_READ_LENGTH as u64;
            update_progress(app.clone(), is_bar_ready.clone(), progress_event_name.clone(), offset, file_len, false).await;
        }
    
        let mut file_end_packet = Packet::new(PacketType::FileEnd);
        file_end_packet.write_vector::<u8>(uuid_bytes);
        s_packet_sender.send(file_end_packet).unwrap();
    });
}

fn emit_file_transfer_start(app: AppHandle, path: String, name: String, uuid_bytes: Vec<u8>) {
    let payload = FileTransferStart::new(path, name, uuid_bytes);
    app.emit_all("file_transfer_start", payload).unwrap();
}

async fn update_progress(app: AppHandle, is_bar_ready: Arc<Mutex<bool>>, event_name: String, offset: u64, file_len: u64, reached_end: bool) {
    let progress = (offset as f64 / file_len as f64) * 100f64;
    if reached_end {
        // wait for listener to be ready.
        if *is_bar_ready.lock().await {
            app.emit_all(&event_name, (progress, reached_end)).unwrap();
        } else {
            spawn(async move {
                loop {
                    sleep(Duration::from_millis(200)).await;
                    if *is_bar_ready.lock().await {
                        app.emit_all(&event_name, (progress, reached_end)).unwrap();
                        break;
                    }
                }
            });
        }
    } else {
        app.emit_all(&event_name, (progress, reached_end)).unwrap();
    }
}

const MAX_COMPRESSION_SIZE: usize = 50_000;

fn read_and_compress_file_chunk(file: &File, offset: &mut u64) -> Result<(bool, Vec<u8>), io::Error> { // reached end, compressed bytes
    let mut read_buffer = vec![0; MAX_FILE_READ_LENGTH];
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    let mut reached_end = false;

    loop {
        let read_len = file.seek_read(&mut read_buffer, *offset)?;

        if read_len == 0 {
            reached_end = true;
            break;
        }

        let read_bytes = &read_buffer[0..read_len];
        encoder.write_all(read_bytes).unwrap();
        encoder.flush().unwrap();

        if read_len < MAX_FILE_READ_LENGTH {
            reached_end = true;
            break;
        }

        if encoder.get_ref().len() > MAX_COMPRESSION_SIZE {
            break;
        }

        *offset += MAX_FILE_READ_LENGTH as u64;
    }

    let compressed_bytes = encoder.finish().unwrap();
    
    Ok((reached_end, compressed_bytes))
}

fn encrypt_bytes(bytes: &[u8], cipher: &AesGcm<Aes256, U12>) -> (Vec<u8>, Vec<u8>) {
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let cipher_data = cipher.encrypt(&nonce, bytes).unwrap();
    let nonce_bytes = unsafe {nonce.align_to::<u8>().1}.to_vec();
    (cipher_data, nonce_bytes)
}

fn send_file_chunk_packet(uuid_bytes: &[u8], offset: u64, cipher_data: Vec<u8>, nonce_bytes: Vec<u8>, s_packet_sender: &mpsc::UnboundedSender<Packet>) {
    let mut file_chunk_packet = Packet::new(PacketType::FileChunk);
    file_chunk_packet.write_vector(uuid_bytes.to_vec());
    file_chunk_packet.write(offset);
    file_chunk_packet.write_vector(nonce_bytes);
    file_chunk_packet.write_vector(cipher_data);
    s_packet_sender.send(file_chunk_packet).unwrap();
}

fn send_new_file_packet(file: &File, path: String, name: String, s_packet_sender: &mpsc::UnboundedSender<Packet>) -> Vec<u8>{
    let mut new_file_packet = Packet::new(PacketType::NewFile);
    new_file_packet.write(path);
    new_file_packet.write(name);
    write_checksum_to_packet(&mut new_file_packet, &file);
    let uuid_bytes = write_uuid_to_packet(&mut new_file_packet);
    s_packet_sender.send(new_file_packet).unwrap();
    uuid_bytes
}

fn write_checksum_to_packet(packet: &mut Packet, file: &File) {
    let checksum = hash_file_t1ha(&file, 65_536);
    packet.write(checksum);
}

fn write_uuid_to_packet(packet: &mut Packet) -> Vec<u8> {
    let uuid = Uuid::new_v4();
    let uuid_bytes = uuid.as_bytes();
    packet.write_vector(uuid_bytes.to_vec());
    uuid_bytes.to_vec()
}

fn read_from_file(file: &File, file_buffer: &mut Vec<u8>, offset: u64) -> Result<usize, ()> {
    match file.seek_read(file_buffer, offset) {
        Ok(len) => Ok(len),
        Err(error) => {
            error!("Failed to read from file: {}", error);
            return Err(());
        }
    }
}

#[tauri::command] 
pub(crate) async fn transfer_selected(app: AppHandle, entries: Vec<SelectedEntry>) {
    for entry in entries {
        let path = Path::new(&entry.path);
        let os_name = path.file_name().unwrap();
        let name = os_name.to_string_lossy().to_string();
        if entry.is_dir {
            send_folder_all(app.clone(), entry.path).await;
        } else {
            send_file(app.clone(), entry.path, name).await;
        }
    }
}

fn hash_file_t1ha(file: &File, read_size: usize) -> u64 {
    let mut hasher = T1haHasher::with_seed(0);

    let mut offset: u64 = 0;
    loop {
        let mut checksum_buffer = vec![0; read_size];
        let read_bytes = file.seek_read(&mut checksum_buffer, offset).unwrap();
        hasher.write(&checksum_buffer);
        if read_bytes < read_size {
            break;
        }
        offset += read_size as u64;
    }
    hasher.finish()
}