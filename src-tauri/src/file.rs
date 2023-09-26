use std::ffi::OsStr;
use std::fs;
use std::os::windows::prelude::OsStrExt;
use std::path::Path;
use std::ptr::null_mut;

use winapi::um::shellapi::ShellExecuteW;
use winapi::um::winuser::SW_SHOWNORMAL;

#[tauri::command]
pub(crate) fn create_new_file(path: &str, name: &str) -> Result<(), String> {
    let file_path_string = format!("{}\\{}", path, name);
    let file_path = Path::new(&file_path_string);
    if file_path.exists() {
        return Err("File with this name already exists!".into());
    } else {
        fs::File::create(file_path).unwrap();
        return Ok(());
    }
}

#[tauri::command]
pub(crate) fn open_file(path: &str) {
    let path: Vec<u16> = OsStr::new(path).encode_wide().chain(Some(0)).collect();
    let operation: Vec<u16> = OsStr::new("open").encode_wide().chain(Some(0)).collect();

    unsafe {
        ShellExecuteW(
            null_mut(),
            operation.as_ptr(),
            path.as_ptr(),
            null_mut(),
            null_mut(),
            SW_SHOWNORMAL,
        );
    }
}

#[tauri::command]
pub(crate) fn rename_entry(path: &str, new_name: &str) -> Result<(), String>{
    println!("{} {}", new_name, path);
    let old_name = {
        let path = Path::new(path);
        path.file_name().unwrap().to_string_lossy().to_string()
    };

    let new_path = replace_last(path, &old_name, new_name);

    match fs::rename(path, new_path) {
        Ok(_) => Ok(()),
        Err(error) => Err(format!("{error}").into())
    }
}

fn replace_last(input: &str, to_replace: &str, replacement: &str) -> String {
    let last_pos = input.rfind(to_replace).unwrap();
	let mut result = input.to_string();
	result.replace_range(last_pos..input.len(), replacement);
	result
}