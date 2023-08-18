use std::ffi::OsString;
use std::os::windows::prelude::OsStringExt;

#[tauri::command]
pub(crate) fn get_drive_letters() -> Vec<String> {
    unsafe { get_drives() }
}

#[cfg(windows)]
unsafe fn get_drives() -> Vec<String> {
    let mut drives = vec![];
    let drives_bitmask = unsafe { winapi::um::fileapi::GetLogicalDrives() };
    for i in 0..26 {
        if drives_bitmask & (1 << i) != 0 {
            let drive_letter = (65 + i) as u16; // ASCII 'A' is 65
            let drive_path: OsString =
                OsStringExt::from_wide(&[drive_letter, ':' as u16, '\\' as u16]);
            let path = drive_path.to_string_lossy().to_string();
            drives.push(path);
        }
    }

    drives
}

#[cfg(unix)]
unsafe fn get_drives() -> Vec<String> {
    vec!["/"]
}
