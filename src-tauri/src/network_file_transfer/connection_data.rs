use tokio::sync::mpsc;
use x25519_dalek::{EphemeralSecret, SharedSecret};

use super::client::Packet;

pub(crate) struct ConnectionData {
    is_connected: bool,
    s_packet_sender: Option<mpsc::UnboundedSender::<Packet>>,
    my_secret: Option<EphemeralSecret>,
    aes_key: Option<SharedSecret>,
}

impl ConnectionData {
    pub(crate) fn new() -> Self {
        Self {
            is_connected: false,
            s_packet_sender: None,
            my_secret: None,
            aes_key: None,
        }
    }

    pub(crate) fn connected(&mut self, s_packet_sender: mpsc::UnboundedSender::<Packet>) {
        self.is_connected = true;
        self.s_packet_sender = Some(s_packet_sender);
    }

    pub(crate) fn disconnected(&mut self) {
        self.is_connected = false;
        self.s_packet_sender = None;
    }

    pub(crate) fn get_s_packet_sender(&self) -> Option<mpsc::UnboundedSender::<Packet>> {
        self.s_packet_sender.clone()
    }

    pub(crate) fn get_is_connected(&self) -> bool {
        self.is_connected
    }

    pub(crate) fn set_secret(&mut self, secret: EphemeralSecret) {
        self.my_secret = Some(secret);
    }
    
    pub(crate) fn get_my_secret(&mut self) -> Option<EphemeralSecret> {
        self.my_secret.take()
    }

    pub(crate) fn set_aes_key(&mut self, key: SharedSecret) {
        self.aes_key = Some(key);
    }

    pub(crate) fn get_aes_key(&self) -> Option<[u8; 32]> {
        if self.aes_key.is_some() {
            return Some(self.aes_key.as_ref().unwrap().to_bytes());
        }
        None
    }
}