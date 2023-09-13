use std::fs::File;
use std::os::windows::fs::FileExt;
use aes_gcm::aead::OsRng;
use aes_gcm::aead::rand_core::RngCore;
use lazy_static::lazy_static;
use log::{error, info};
use network_tcp_packet::packet::packet::TcpPacket;
use tauri::{AppHandle, Manager};
use tokio::io::{AsyncReadExt, AsyncWriteExt, ReadHalf, WriteHalf};
use tokio::net::TcpStream;
use tokio::spawn;
use tokio::sync::mpsc::UnboundedSender;
use tokio::sync::{mpsc, Mutex};
use uuid::{Uuid};
use x25519_dalek::{EphemeralSecret, PublicKey};
use std::collections::HashMap;
use std::path::Path;
use sha256::try_digest;
use crate::network_file_transfer::connection_data::ConnectionData;
use crate::network_file_transfer::packet_type::PacketType;
use crate::network_file_transfer::receiver::start_receiver;
use crate::network_file_transfer::sender::start_sender;

pub(crate) type Packet = TcpPacket<PacketType>;

pub(crate) const MAX_FILE_READ_LENGTH: usize = 50_000;

lazy_static! {
    static ref FILE_SENDERS: Mutex<HashMap<Uuid, mpsc::Sender<(u64, Vec<u8>)>>> = {
        Mutex::new(HashMap::new())
    };

    pub(crate) static ref CONNECTION_DATA: Mutex<ConnectionData> = Mutex::new(ConnectionData::new());
}

#[tauri::command]
pub(crate) async fn connect(app: AppHandle, ip_address: String, port: String) -> Result<(), String> {
    let address = format!("{}:{}", ip_address, port);
    let stream = match TcpStream::connect(address).await {
        Ok(stream) => stream,
        Err(error) => return Err(format!("{error}").into()),
    };

    let (reader_half, writer_half) = tokio::io::split(stream);

    let (
        r_packet_sender,
        mut r_packet_receiver
    ) = mpsc::unbounded_channel::<Packet>();

    let (
        s_packet_sender,
        s_packet_receiver
    ) = mpsc::unbounded_channel::<Packet>();

    start_receiver(reader_half, r_packet_sender);
    start_sender(writer_half, s_packet_receiver);

    send_my_public_key(s_packet_sender.clone()).await;

    spawn(async move {
        loop {
            let packet = match r_packet_receiver.recv().await {
                None => break,
                Some(packet) => packet
            };
    
            handle_packet(packet).await;
        }
        app.emit_all("disconnected", None::<()>).unwrap();
        CONNECTION_DATA.lock().await.disconnected();
    });

    CONNECTION_DATA.lock().await.connected(s_packet_sender);

    Ok(())
}

async fn send_my_public_key(s_packet_sender: mpsc::UnboundedSender<Packet>) {
    let my_secret = EphemeralSecret::random_from_rng(OsRng);
    let my_public = PublicKey::from(&my_secret);
    
    let mut packet_my_public = Packet::new(PacketType::PublicKey);
    packet_my_public.write_vector::<u8>(my_public.as_bytes().to_vec());
    
    s_packet_sender.send(packet_my_public).unwrap();
    CONNECTION_DATA.lock().await.set_secret(my_secret);
}

async fn handle_packet(mut packet: Packet) {
    match packet.get_type() {
        PacketType::NewFile => {
            let _path = packet.read_string();
            let name = packet.read_string();
            let checksum = packet.read_string();
            let uuid = Uuid::from_slice(&packet.read_vector::<u8>()).unwrap();

            let local_path = format!(".\\received\\{}", name);

            let (
                file_chunk_sender,
                mut file_chunk_receiver,
            ) = mpsc::channel::<(u64, Vec<u8>)>(10);

            FILE_SENDERS.lock().await.insert(uuid, file_chunk_sender);

            // write to file thread
            spawn(async move {
                let file = File::create(local_path.clone()).unwrap();

                loop {
                    let (offset, chunk) = match file_chunk_receiver.recv().await {
                        Some(data) => data,
                        None => {
                            let path2 = Path::new(&local_path);
                            let generated_checksum = try_digest(path2).unwrap();

                            if generated_checksum == checksum {
                                info!("Received a file successfully.");
                            } else {
                                error!("Received the full file, but its corrupted!");
                            }

                            break;
                        }
                    };

                    file.seek_write(&chunk, offset as u64).unwrap();
                }
            });
        }
        PacketType::FileChunk => {
            let uuid_bytes = packet.read_vector::<u8>();
            let uuid = Uuid::from_slice(&uuid_bytes).unwrap();

            let offset = packet.read::<u64>();
            let bytes = packet.read_vector::<u8>();

            FILE_SENDERS.lock().await.get(&uuid).unwrap().send((offset, bytes)).await.unwrap();
        }
        PacketType::FileEnd => {
            let uuid_bytes = packet.read_vector::<u8>();
            let uuid = Uuid::from_slice(&uuid_bytes).unwrap();

            FILE_SENDERS.lock().await.remove(&uuid).unwrap();
        }
        PacketType::PublicKey => {
            let others_public_bytes_vec = packet.read_vector::<u8>();

            let result: Result<[u8; 32], _> = others_public_bytes_vec.try_into();

            let others_public_bytes_arr: [u8; 32] = match result {
                Ok(array) => array,
                Err(_) => panic!("Vec<u8> must have a length of 32"),
            };

            let others_public = PublicKey::from(others_public_bytes_arr);
            let my_secret = CONNECTION_DATA.lock().await.get_my_secret().unwrap();
            let shared_secret = my_secret.diffie_hellman(&others_public);
            CONNECTION_DATA.lock().await.set_aes_key(shared_secret);
        }
    }
}

#[tauri::command]
pub(crate) async fn is_connected() -> bool {
    CONNECTION_DATA.lock().await.get_is_connected()
}