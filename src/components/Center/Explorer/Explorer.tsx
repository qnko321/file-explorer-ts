import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import ExplorerEntry from "./ExplorerEntry/ExplorerEntry";


const Explorer: React.FC = () => {
    const [drives, setDrives] = useState<string[]>([]);

    useEffect(() => {
        invoke('get_drive_letters')
        .then(response => {
            setDrives(response as string[]);
        });
    }, []);

    return (
        <div className="explorer">
            <div className="entries">
            {
                drives.map((drive, index) => (
                    <ExplorerEntry name={drive} path={drive} key={index}/>
                ))
            }
            </div>
        </div>
    )
}

export default Explorer