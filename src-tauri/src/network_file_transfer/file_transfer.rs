#![allow(dead_code)]

use std::fs::File;
use std::hash::Hasher;
use std::io::Read;
use std::os::windows::fs::FileExt;
use std::path::Path;
use log::error;
use sha256::try_digest;
use t1ha::T1haHasher;
use tokio::sync::mpsc;
use tokio::time::Instant;
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

#[tauri::command]
pub(crate) async fn send_folder(path: String) {
    let walk_dir = WalkDir::new(path).max_depth(1);

    for entry in walk_dir {
        let entry = entry.unwrap();
        if entry.file_type().is_file() {
            send_file(entry.path().to_str().unwrap().to_string(), entry.file_name().to_str().unwrap().to_string()).await;
        }
    }
}

#[tauri::command]
pub(crate) async fn send_folder_all(path: String) {
    for entry in WalkDir::new(path) {
        let entry = entry.unwrap();
        if entry.file_type().is_file() {
            send_file(entry.path().to_str().unwrap().to_string(), entry.file_name().to_str().unwrap().to_string()).await;
        }
    }
}

#[tauri::command]
pub(crate) async fn send_file(path: String, name: String) {
    let s_packet_sender = match CONNECTION_DATA.lock().await.get_s_packet_sender() {
        Some(sender) => sender,
        None => {
            error!("Failed to send file because the client is not connected to a server!");
            return;
        },
    };
    let file = match File::open(path.clone()) {
        Ok(file) => file,
        Err(error) => {
            error!("Failed to open file: {}", error);
            return;
        }
    };

    let checksum = hash_file_t1ha(&file, 65_536);
    let uuid = Uuid::new_v4();
    let uuid_bytes = uuid.as_bytes();

    let mut new_file_packet = Packet::new(PacketType::NewFile);
    new_file_packet.write(path.to_string());
    new_file_packet.write(name.to_string());
    new_file_packet.write(checksum);
    new_file_packet.write_vector(uuid_bytes.to_vec());

    s_packet_sender.send(new_file_packet).unwrap();

    let key = CONNECTION_DATA.lock().await.get_aes_key().unwrap();
    let key = Key::<Aes256Gcm>::from_slice(&key);
    let cipher = Aes256Gcm::new(&key);

    let mut file_buffer = vec![0u8; MAX_FILE_READ_LENGTH];
    let mut offset = 0;
    loop {
        let read_len = match file.seek_read(&mut file_buffer, offset) {
            Ok(len) => len,
            Err(error) => {
                error!("Failed to read from file: {}", error);
                return;
            }
        };

        if read_len == 0 {
            break;
        }

        let mut file_chunk_packet = Packet::new(PacketType::FileChunk);
        file_chunk_packet.write_vector(uuid_bytes.to_vec());
        file_chunk_packet.write(offset);

        let file_bytes = &file_buffer[0..read_len];

        let compressed_bytes: Vec<u8> = compress_to_vec(file_bytes, 7);

        
        let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
        let cipher_data = cipher.encrypt(&nonce, compressed_bytes.as_slice()).unwrap();
        let nonce_bytes = unsafe {nonce.align_to::<u8>().1};

        file_chunk_packet.write_vector(nonce_bytes.to_vec());
        file_chunk_packet.write_vector(cipher_data);

        s_packet_sender.send(file_chunk_packet).unwrap();

        if read_len < MAX_FILE_READ_LENGTH {
            break;
        }

        offset += MAX_FILE_READ_LENGTH as u64;
    }

    let mut file_end_packet = Packet::new(PacketType::FileEnd);
    file_end_packet.write_vector::<u8>(uuid_bytes.to_vec());
    s_packet_sender.send(file_end_packet).unwrap();
}

#[tauri::command] 
pub(crate) async fn transfer_selected(entries: Vec<SelectedEntry>) {
    for entry in entries {
        let path = Path::new(&entry.path);
        let os_name = path.file_name().unwrap();
        let name = os_name.to_string_lossy().to_string();
        if entry.is_dir {
            send_folder_all(entry.path).await;
        } else {
            send_file(entry.path, name).await;
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