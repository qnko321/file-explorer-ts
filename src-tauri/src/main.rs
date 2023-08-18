// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[macro_use]
extern crate lazy_static;

mod directory;
mod drives;
mod file;

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
use fslock::LockFile;
use notify::EventKind;
use notify::Watcher;
use serde::Deserialize;
use serde::Serialize;
use winapi::um::shellapi::ShellExecuteA;
use std::collections::HashMap;
use std::process::Command;
use std::net::UdpSocket;
use std::path::Path;
use std::process::Stdio;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::Once;
use tauri::CustomMenuItem;
use tauri::Manager;
use tauri::SystemTrayEvent;
use tauri::SystemTrayMenu;
use tauri::SystemTrayMenuItem;
use walkdir::DirEntry;
use winapi::um::shellapi::ShellExecuteW;
use winapi::um::winuser::SW_SHOWNORMAL;

const FILE_MAP_NAME: &str = "file-explorer-file-map";

#[derive(Serialize, Deserialize, Debug)]
struct FileMap {
    map: HashMap<String, String>,
}

fn is_hidden(entry: &DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|s| s.starts_with("."))
        .unwrap_or(false)
}

lazy_static! {
    static ref FILE_MAP: Arc<Mutex<HashMap<String, String>>> =
        Arc::new(Mutex::new(HashMap::<String, String>::new()));
}

fn main() {
    // let mut watcher =
    //     notify::recommended_watcher(|res: Result<notify::Event, notify::Error>| match res {
    //         Ok(event) => match event.kind {
    //             EventKind::Create(_) => println!("Create {:?}", event.paths),
    //             EventKind::Remove(_) => println!("Remove {:?}", event.paths),
    //             EventKind::Other => println!("Other: {:?}", event),
    //             _ => {}
    //         },
    //         Err(e) => println!("watch error: {:?}", e),
    //     })
    //     .unwrap();

    // watcher
    //     .watch(Path::new("/"), notify::RecursiveMode::Recursive)
    //     .unwrap();

    // let serialized = serde_json::to_string(&map).unwrap();

    // let path_str = &format!("{}{}", std::env::temp_dir().to_str().unwrap(), FILE_MAP_NAME);
    // let path = Path::new(path_str);

    // let exists = Path::try_exists(path).unwrap();

    // if exists {
    //     println!("exists");
    // } else {
    //     let mut file = File::create(path).unwrap();
    //     file.write_all(serialized.as_bytes()).unwrap();
    // }

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

    let start_udp_listener = Once::new();

    let system_tray = create_system_tray();

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
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