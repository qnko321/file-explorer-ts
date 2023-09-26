use std::{fs, time::SystemTime};
use std::path::Path;

use chrono::{DateTime, Utc, Local};
use serde::{Deserialize, Serialize};
use winapi::um::fileapi::SetFileAttributesA;

use crate::drives::get_drive_letters;

#[derive(Serialize, Debug)]
pub(crate) struct Directory {
    name: String,
    path: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct Entry {
    is_dir: bool,
    name: String,
    path: String,
    size: String,
    last_modified: String,
    created: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct DeleteEntry {
    is_dir: bool,
    path: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct SelectedEntry {
    pub(crate) is_dir: bool,
    pub(crate) path: String,
}

#[tauri::command]
pub(crate) fn expand_directory(path: String) -> Result<Vec<Directory>, String> {
    if path == "recycle-bin" {
        let mut directories = vec![];

        let drives = get_drive_letters();

        for drive in drives {
            let recycle_bin_path = format!("{}recycle_bin_cfe", drive);
            
            if !Path::new(&recycle_bin_path).exists() {
                continue;
            }

            let read_dir = match fs::read_dir(recycle_bin_path) {
                Ok(read_dir) => read_dir,
                Err(error) => return Err(format!("0 {error}")),
            };
        
            for entry in read_dir {
                let entry = match entry {
                    Ok(entry) => entry,
                    Err(error) => return Err(format!("1 {error}")),
                };
        
                let metadata = match entry.metadata() {
                    Ok(metadata) => metadata,
                    Err(error) => return Err(format!("2 {error}")),
                };
                
                if metadata.is_dir() {
                    directories.push(Directory {
                        name: entry.file_name().to_str().unwrap().to_string(),
                        path: entry.path().to_str().unwrap().to_string(),
                    });
                }
            }
        }

        return Ok(directories);
    }

    let mut directories = vec![];

    let read_dir = match fs::read_dir(path) {
        Ok(read_dir) => read_dir,
        Err(error) => return Err(format!("{error}")),
    };

    for entry in read_dir {
        let entry = match entry {
            Ok(entry) => entry,
            Err(error) => return Err(format!("{error}")),
        };

        let metadata = match entry.metadata() {
            Ok(metadata) => metadata,
            Err(error) => return Err(format!("{error}")),
        };
        
        if metadata.is_dir() {
            directories.push(Directory {
                name: entry.file_name().to_str().unwrap().to_string(),
                path: entry.path().to_str().unwrap().to_string(),
            });
        }
    }

    Ok(directories)
}

#[tauri::command]
pub(crate) fn get_directory_content(path: String) -> Result<Vec<Entry>, String> {
    if path == "recycle-bin" {
        if path == "recycle-bin" {
            let mut content = vec![];
    
            let drives = get_drive_letters();
    
            for drive in drives {
                let recycle_bin_path = format!("{}recycle_bin_cfe", drive);
                
                if !Path::new(&recycle_bin_path).exists() {
                    continue;
                }
    
                let read_dir = match fs::read_dir(recycle_bin_path) {
                    Ok(read_dir) => read_dir,
                    Err(error) => return Err(format!("0 {error}")),
                };
            
                for entry in read_dir {
                    let entry = entry.unwrap();
                    let metadata = entry.metadata().unwrap();

                    let is_dir = metadata.is_dir();
                    let name = entry.file_name().to_str().unwrap().to_string();
                    let path = entry.path().to_str().unwrap().to_string();
                    let size = format!("{} B", metadata.len());
                    let last_modified_datetime: DateTime<Local> = metadata.modified().unwrap().into();
                    let last_modified = last_modified_datetime.format("%d/%m/%Y %T").to_string();
                    let created_datetime: DateTime<Local> = metadata.created().unwrap().into();
                    let created = created_datetime.format("%d/%m/%Y %T").to_string();

                    content.push(Entry {
                        is_dir,
                        name,
                        path,
                        size,
                        last_modified,
                        created
                    });
                }
            }
    
            return Ok(content);
        }
    }
    let path_check = path.get(1..path.len()).unwrap();
    let is_drive = path_check == ":\\" || path_check == ":/";

    let mut content = vec![];

    let entries = match fs::read_dir(path) {
        Ok(entries) => entries,
        Err(error) => {
            return Err(format!("{error}").into());
        }
    };

    for entry in entries {
        let entry = entry.unwrap();
        let metadata = entry.metadata().unwrap();

        let is_dir = metadata.is_dir();
        let name = entry.file_name().to_str().unwrap().to_string();
        let path = entry.path().to_str().unwrap().to_string();
        if is_drive {
            let check_path = path.get(1..path.len()).unwrap();
            if check_path == ":/recycle_bin_cfe" || check_path == ":\\recycle_bin_cfe" {
                continue;
            }
        }
        let size = format!("{} B", metadata.len());
        let last_modified_datetime: DateTime<Local> = metadata.modified().unwrap().into();
        let last_modified = last_modified_datetime.format("%d/%m/%Y %T").to_string();
        let created_datetime: DateTime<Local> = metadata.created().unwrap().into();
        let created = created_datetime.format("%d/%m/%Y %T").to_string();

        content.push(Entry {
            is_dir,
            name,
            path,
            size,
            last_modified,
            created
        });
    }

    Ok(content)
}

#[tauri::command]
pub(crate) fn get_recycle_bin_content(path: String) -> Result<Vec<Entry>, String> {
    let drive_letters = get_drive_letters();

    println!("{:?}", drive_letters);

    let mut content = vec![];

    let entries = match fs::read_dir(path) {
        Ok(entries) => entries,
        Err(error) => {
            return Err(format!("{error}").into());
        }
    };

    for entry in entries {
        let entry = entry.unwrap();
        let metadata = entry.metadata().unwrap();

        let is_dir = metadata.is_dir();
        let name = entry.file_name().to_str().unwrap().to_string();
        let path = entry.path().to_str().unwrap().to_string();
        let size = format!("{} B", metadata.len());
        let last_modified_datetime: DateTime<Local> = metadata.modified().unwrap().into();
        let last_modified = last_modified_datetime.format("%d/%m/%Y %T").to_string();
        let created_datetime: DateTime<Local> = metadata.created().unwrap().into();
        let created = created_datetime.format("%d/%m/%Y %T").to_string();

        content.push(Entry {
            is_dir,
            name,
            path,
            size,
            last_modified,
            created
        });
    }

    Ok(content)
}

// TODO: DONT USE <Path>.exists() use try_exists
#[tauri::command]
pub(crate) fn create_new_folder(path: &str, name: &str) -> Result<(), String> {
    let folder_path_string = format!("{}\\{}", path, name);
    let folder_path = Path::new(&folder_path_string);

    if folder_path.exists() {
        return Err("This folder already exists!".into());
    }

    match fs::create_dir_all(folder_path_string) {
        Ok(_) => return Ok(()),
        Err(error) => return Err(format!("Folder creation failed: {}", error).into()),
    };
}

#[tauri::command]
pub(crate) fn delete_entries(entries: Vec<DeleteEntry>) -> Result<(), String> {
    for entry in entries {
        let path = entry.path;
        let drive_path = format!("{}:/", path.get(0..1).unwrap());
        let recycle_bin_path = format!("{}recycle_bin_cfe", drive_path);

        let sub_path = Path::new(path.get(3..path.len()).unwrap());

        let recycled_path_parent = format!("{}/{}", recycle_bin_path, sub_path.parent().unwrap().to_str().unwrap());
        let recycled_path = format!("{}/{}", recycle_bin_path, sub_path.to_str().unwrap());

        let recycle_bin_exists = Path::new(&recycle_bin_path).exists();

        fs::create_dir_all(&recycled_path_parent).unwrap();

        if !recycle_bin_exists {
            let result = hide_entry(recycle_bin_path);
            println!("hide result: {}", result);
        }

        return match fs::rename(path, recycled_path) {
            Ok(_) => Ok(()),
            Err(error) => Err(format!("rename error: {}", error).into())
        };
    }

    Ok(())
}

fn hide_entry(path: String) -> i32 {
    unsafe {
        SetFileAttributesA(path.as_ptr() as *const i8, 2)
    }
}