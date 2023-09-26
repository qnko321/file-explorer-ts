use log::error;
use tokio::io::{AsyncReadExt, ReadHalf};
use tokio::net::TcpStream;
use tokio::spawn;
use tokio::sync::{mpsc, broadcast};
use tokio::task::JoinHandle;
use crate::network_file_transfer::client::Packet;
use crate::network_file_transfer::reader_controller::{ReaderController, ReaderState};

pub(crate) fn start_receiver(reader_half: ReadHalf<TcpStream>, r_packet_sender: mpsc::UnboundedSender<Packet>, mut disconnect_receiver: broadcast::Receiver<()>) -> JoinHandle<()> {
    spawn(async move {
        let mut reader_half = reader_half;
        let mut reader_controller = ReaderController::new();

        loop {
            tokio::select! {
                _ = async {
                    disconnect_receiver.recv().await;
                } => {
                    break;
                }
                should_break = async {
                    let mut buffer;
                    match reader_controller.get_state() {
                        ReaderState::Size => {
                            buffer = vec![0u8; reader_controller.get_next_size()];
                            let read_result = reader_half.read(&mut buffer).await;
                            match read_result {
                                Ok(0) => {
                                    error!("Server closed the connection");
                                    return true;
                                }
                                Ok(n) => {
                                    if n != 8 {
                                        panic!("Should have received size but the length of data received wasn't usize (8 bytes)");
                                    }

                                    let next_size = unsafe { std::ptr::read(buffer.as_ptr() as *const usize) };
                                    reader_controller.received_size(next_size);
                                }
                                Err(error) => {
                                    error!("Error reading from server: {}", error);
                                    return true;
                                }
                            }
                        }
                        ReaderState::Data => {
                            buffer = vec![0u8; reader_controller.get_next_size()];
                            let read_result = reader_half.read(&mut buffer).await;
                            match read_result {
                                Ok(0) => {
                                    error!("Server closed the connection");
                                    return true;
                                }
                                Ok(n) => {
                                    if n != buffer.len() {
                                        panic!("Should have received data with length {} but received data of size {}", buffer.len(), n);
                                    }

                                    let r_packet = Packet::from_bytes(&buffer);
                                    r_packet_sender.send(r_packet).unwrap();

                                    reader_controller.received_data();
                                }
                                Err(error) => {
                                    error!("Error reading from server: {}", error);
                                    return true;
                                }
                            }
                        }
                    }
                    false
                } => {
                    if should_break {
                        break;
                    }
                }
            }
        }
    })
}