import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import ExplorerEntry from "./ExplorerEntry/ExplorerEntry";
import { emit } from "@tauri-apps/api/event";
import ExplorerSeperator from "./ExplorerSeperator";


const Explorer: React.FC = () => {
    const [drives, setDrives] = useState<string[]>([]);

    useEffect(() => {
        invoke('get_drive_letters')
        .then(response => {
            setDrives(response as string[]);
        }).catch(error => {
            emit("display-error", {
                error
            });
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
            <ExplorerSeperator/>
            <ExplorerEntry name={"Recycle Bin"} path="recycle-bin" key={"recycle-bin"}/>
            </div>
        </div>
    )
}

export default Explorer