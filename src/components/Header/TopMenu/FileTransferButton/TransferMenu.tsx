import { invoke } from "@tauri-apps/api";
import { useState } from "react";

interface TransferMenuProps {
    display: boolean,
    close: () => void,
}

const TransferMenu: React.FC<TransferMenuProps> = ({display, close}) => {
    return (
        <>
            {display && (
                <div className="connect-menu">
                <div className="background">
                    <div className="content">
                        <h2 className="title">Transfer Files</h2>
                        <div className="form">
                            
                        </div>
                    </div>
                </div>
            </div>
            )}
        </>
    )
}

export default TransferMenu;