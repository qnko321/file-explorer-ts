use jammdb::{DB, Data, Error};

#[tauri::command]
pub(crate) fn add_favourite() -> Result<(), String>{
    let db = DB::open("my-database.db").unwrap();

    let tx = db.tx(true).unwrap();
    let names_bucket = tx.create_bucket("names").unwrap();
    names_bucket.put("Kanan", "Jarrus").unwrap();
    names_bucket.put("Qnko", "Canko").unwrap();

    tx.commit().unwrap();
    Ok(())
} 