import { invoke } from "@tauri-apps/api";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { BounceLoader } from "react-spinners";

interface ConnectMenuProps {
    display: boolean,
    close: () => void,
    connected: () => void,
    storeAddress: (address: string) => void,
}

const override: CSSProperties = {
    display: "block",
    margin: "auto",
    borderColor: "red",
};

const ConnectMenu: React.FC<ConnectMenuProps> = ({display, close, connected, storeAddress}) => {
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
                console.log(`${ipAddress}:${port}`);
                
                storeAddress(`${ipAddress}:${port}`);
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
                                <div className="loading">
                                    <BounceLoader
                                        color={"#21b66a"}
                                        loading={true}
                                        cssOverride={override}
                                        size={100}
                                        aria-label="Loading Spinner"
                                        data-testid="loader"
                                    />
                                    <h2>Connecting...</h2>
                                </div>
                            ) : (
                                error !== "" ? (
                                    <div className="error">{error}</div>
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
                            <button className="cancel-button" disabled={isConnecting} onClick={closeMe}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ConnectMenu