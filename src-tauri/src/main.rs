// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod directory;
mod drives;
mod file;
mod logger;
mod network_file_transfer;
mod db;

use crate::directory::__cmd__create_new_folder;
use crate::directory::__cmd__delete_entries;
use crate::directory::__cmd__expand_directory;
use crate::directory::__cmd__get_directory_content;
use crate::directory::create_new_folder;
use crate::directory::delete_entries;
use crate::directory::expand_directory;
use crate::directory::get_directory_content;
use crate::drives::__cmd__get_drive_letters;
use crate::drives::get_drive_letters;
use crate::file::__cmd__create_new_file;
use crate::file::__cmd__open_file;
use crate::file::create_new_file;
use crate::file::open_file;
use crate::file::__cmd__rename_entry;
use crate::file::rename_entry;
use crate::network_file_transfer::client::__cmd__connect;
use crate::network_file_transfer::client::connect;
use crate::network_file_transfer::client::__cmd__is_connected;
use crate::network_file_transfer::client::is_connected;
use crate::network_file_transfer::client::__cmd__disconnect;
use crate::network_file_transfer::client::disconnect;
use fslock::LockFile;
use logger::setup_logger;
use network_file_transfer::file_transfer::__cmd__send_file;
use network_file_transfer::file_transfer::send_file;
use network_file_transfer::file_transfer::__cmd__send_folder;
use network_file_transfer::file_transfer::send_folder;
use network_file_transfer::file_transfer::__cmd__send_folder_all;
use network_file_transfer::file_transfer::send_folder_all;
use network_file_transfer::file_transfer::__cmd__transfer_selected;
use network_file_transfer::file_transfer::transfer_selected;
use db::__cmd__add_favourite;
use db::add_favourite;
use std::process::Command;
use std::net::UdpSocket;
use std::process::Stdio;
use std::sync::Once;
use tauri::CustomMenuItem;
use tauri::Manager;
use tauri::SystemTrayEvent;
use tauri::SystemTrayMenu;
use tauri::SystemTrayMenuItem;

fn main() {
    let binding = std::env::current_exe().unwrap();
    let exe_parrent_path = binding.parent().unwrap().to_str().unwrap();
    let mut lockfile = LockFile::open(&format!("{}\\DONT_DELETE", exe_parrent_path)).unwrap();
    let lock_result = lockfile.try_lock().unwrap();
    match lock_result {
        false => {
            let listener = UdpSocket::bind("127.0.0.1:0").unwrap();
            listener.send_to(&[1], "127.0.0.1:1902").unwrap();
            return;
        }
        _ => {}
    }

    setup_logger().expect("Failed to start logger");

    let start_udp_listener = Once::new();

    let system_tray = create_system_tray();

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app: &tauri::AppHandle, event| match event {
            SystemTrayEvent::DoubleClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "quit" => {
                        app.exit(0);
                        // std::process::exit(0);
                    }
                    "show" => {
                        let window = app.get_window("main").unwrap();
                        window.show().unwrap();
                    }
                    "hide" => {
                        let window = app.get_window("main").unwrap();
                        window.hide().unwrap();
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            expand_directory,
            get_directory_content,
            get_drive_letters,
            open_file,
            create_new_folder,
            delete_entries,
            create_new_file,
            open_powershell,
            connect,
            send_file,
            send_folder,
            send_folder_all,
            is_connected,
            transfer_selected,
            disconnect,
            rename_entry,
        ])
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri app")
        .run(move |app_handle, event| {
            let app_handle_clone = app_handle.clone();
            start_udp_listener.call_once(|| {
                std::thread::spawn(move || {
                    let listener = UdpSocket::bind("127.0.0.1:1902").unwrap();

                    let mut buffer = [0u8; 1];
                    loop {
                        listener.recv_from(&mut buffer).unwrap();
                        println!("{:?}", buffer);
                        app_handle_clone.get_window("main").unwrap().show().unwrap();
                    }
                });
            });
            match event {
                tauri::RunEvent::ExitRequested { api, .. } => {
                    api.prevent_exit();
                }
                tauri::RunEvent::Exit => {
                    app_handle.tray_handle().destroy();
                }
                _ => {}
            }
        });
}

fn create_system_tray() -> tauri::SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    tauri::SystemTray::new().with_menu(tray_menu)
}


#[tauri::command]
fn open_powershell(path: &str) -> Result<String, String>{
    let _ = Command::new("cmd")
        .args(&["/C", "start", "powershell"])
        .current_dir(path) // Set the starting directory for PowerShell
        .stdin(Stdio::null())  // Detach stdin
        .stdout(Stdio::null()) // Detach stdout
        .stderr(Stdio::null()) // Detach stderr
        .spawn() // Spawn a new process (non-blocking)
        .expect("Failed to start PowerShell");

    println!("PowerShell started!");
    
    Ok("".to_string())
}