import { useEffect, useState } from "react";
import ConnectMenu from "./ConnectMenu";
import TransferMenu from "./TransferMenu";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api";

const TopMenuButton: React.FC = () => {
    const [displayTransferMenu, setDisplayTransferMenu] = useState<boolean>(false);
    
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [displayConnectMenu, setDisplayConnectMenu] = useState<boolean>(false);

    useEffect(() => {
        invoke("is_connected", {}).then(is_connected => {
            setIsConnected(is_connected as boolean);  
        });

        const unlisten_disconnected = listen("disconnected", (event) => {
            console.log(event);
            
            console.log("disconnected from file transfer server");
            setIsConnected(false);
        });

        return () => {
            unlisten_disconnected.then(f => f());
        }
    }, []);

    const openConnectMenu = () => {
        setDisplayConnectMenu(true);
    }

    const closeConnectMenu = () => {
        setDisplayConnectMenu(false);
    }

    const openTransferMenu = () => {
        setDisplayTransferMenu(true);
    }

    const closeTransferMenu = () => {
        setDisplayTransferMenu(false);
    }

    const connectedSuccessfully = () => {
        setIsConnected(true);
    }

    return (
        <div>
            <div className="top-menu-button" onClick={isConnected ? () => {openTransferMenu()} : () => {openConnectMenu()}}>
                <h4 className="title">{isConnected ? "Transfer Files" : "Connect"}</h4>
            </div>
            <ConnectMenu display={displayConnectMenu} close={closeConnectMenu} connected={connectedSuccessfully}/>
            <TransferMenu display={displayTransferMenu} close={closeTransferMenu}/>
        </div>
    )
}

export default TopMenuButton;