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
