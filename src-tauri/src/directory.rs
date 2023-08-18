use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};

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
}

#[tauri::command]
pub(crate) fn expand_directory(path: String) -> Result<Vec<Directory>, String> {
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
        content.push(Entry {
            is_dir: metadata.is_dir(),
            name: entry.file_name().to_str().unwrap().to_string(),
            path: entry.path().to_str().unwrap().to_string(),
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
pub(crate) fn delete_entries(entries: Vec<Entry>) -> Result<(), String> {
    for entry in entries {
        let path = entry.path;
        if !path.starts_with("F:\\testdeleting") {
            return Err(format!("CANT DELETE PATH: {}", path).into());
        }
        if entry.is_dir {
            match fs::remove_dir_all(path) {
                Ok(_) => {}
                Err(error) => return Err(format!("{error}").into()),
            };
        } else {
            match fs::remove_file(path) {
                Ok(_) => {}
                Err(error) => return Err(format!("{error}").into()),
            };
        }
    }

    Ok(())
}
