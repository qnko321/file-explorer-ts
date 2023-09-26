import { invoke } from "@tauri-apps/api";
import { emit } from "@tauri-apps/api/event";

interface ConnectionSettingsMenuProps {
    display: boolean,
    close: () => void,
    address: string,
}

const ConnectionSettingsMenu: React.FC<ConnectionSettingsMenuProps> = ({display, close, address}) => {
    const disconnect = () => {
        console.log("disconnect");
        
        invoke('disconnect')
        .then(_ => {
            close();
        })
        .catch(error => {
            emit("display-error", {
                error,
            })
        });
    }

    return (
        <>
            {display && (
                <div className="connect-menu">
                <div className="background">
                    <div className="content">
                        <h2 className="title">Transfer Files</h2>
                        <div className="form">
                            <h4 className="label">Connected to: {address}</h4>
                            <div className="separator"/>
                            <button className="connect-button interactive" onClick={disconnect}>Disconnect</button>
                            <div className="separator"/>
                            <button className="cancel-button" onClick={close}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </>
    )
}

export default ConnectionSettingsMenu;