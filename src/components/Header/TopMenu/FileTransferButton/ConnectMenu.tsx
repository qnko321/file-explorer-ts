import { invoke } from "@tauri-apps/api";
import { useEffect, useRef, useState } from "react";

interface ConnectMenuProps {
    display: boolean,
    close: () => void,
    connected: () => void,
}

const ConnectMenu: React.FC<ConnectMenuProps> = ({display, close, connected}) => {
    const [ipAddress, setIpAddress] = useState<string>('127.0.0.1');
    const ipAddressInputRef = useRef();
    const [port, setPort] = useState<string>('8082');
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const isConnectingRef = useRef(isConnecting);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        isConnectingRef.current = isConnecting;
    }, [isConnecting]);

    const handleConnectClick = (e) => {
        invoke('connect', {
            ipAddress: ipAddress,
            port: port,
        }).then(_ => {
            if (isConnectingRef.current) {
                connected();
                closeMe();
                setIsConnecting(false);
            }
        }).catch(error => {
            if (isConnectingRef.current) {
                console.error(error);
                setIsConnecting(false);
                setError(error);
            }
        });
        setIsConnecting(true);
    }

    const closeMe = () => {
        setIsConnecting(false);
        setError("");
        close();
    }

    const handleIpAddressChange = (e) => {
        setIpAddress(e.target.value);
    }

    const handlePortChange = (e) => {
        setPort(e.target.value);
    }

    return (
        <>
            {display && (
                <div className="connect-menu">
                    <div className="background">
                        <div className="content">
                            <h2 className="title">Connect to file Transfer Server</h2>
                            {isConnecting ? (
                                // show loading screen
                                <div>
                                    loading
                                </div>
                            ) : (
                                error !== "" ? (
                                    <div>{error}</div>
                                ) : (
                                    <div className="form">
                                        <div className="separator"/>
                                        <h4 className="label">Ip Address</h4>
                                        <input className="input" type="text" ref={ipAddressInputRef} value={ipAddress} onChange={handleIpAddressChange}/>
                                        <div className="separator"/>
                                        <h4 className="label">Port</h4>
                                        <input className="input" type="text" value={port} onChange={handlePortChange}/>
                                        <div className="separator"/>
                                        <button className="connect-button interactive" onClick={handleConnectClick}>Connect</button>
                                        <div className="separator"/>
                                    </div>
                                )
                            )}
                            <button className="cancel-button" onClick={closeMe}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ConnectMenu