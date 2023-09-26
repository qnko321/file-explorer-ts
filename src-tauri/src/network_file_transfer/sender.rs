use tokio::io::{AsyncWriteExt, WriteHalf};
use tokio::net::TcpStream;
use tokio::spawn;
use tokio::sync::mpsc;
use tokio::task::JoinHandle;
use crate::network_file_transfer::client::Packet;
use tokio::sync::broadcast;

pub(crate) fn start_sender(writer_half: WriteHalf<TcpStream>, mut s_packet_receiver: mpsc::UnboundedReceiver<Packet>, mut disconnect_receiver: broadcast::Receiver<()>) -> JoinHandle<()> {
    spawn(async move {
        let mut writer_half = writer_half;
        loop {
            tokio::select! {
                should_break = async {
                    let packet = match s_packet_receiver.recv().await {
                        None => {
                            return true;
                        }
                        Some(packet) => packet
                    };
        
                    let send_bytes = packet.to_bytes();
                    writer_half.write_all(&send_bytes.len().to_le_bytes()).await.unwrap();
                    writer_half.write_all(&send_bytes).await.unwrap();
                    false
                } => {
                    if should_break {
                        break;
                    }
                },
                _ = async {
                    disconnect_receiver.recv().await;
                } => {
                    break;
                }
            }
        }
    })
}
