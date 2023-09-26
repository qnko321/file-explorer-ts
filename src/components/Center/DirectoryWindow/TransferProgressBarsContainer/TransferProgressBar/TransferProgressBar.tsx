import { useEffect } from "react";
import useTransferProgressBar from "./useTransferProgressBar";
import { emit } from "@tauri-apps/api/event";

interface TransferProgressBarProps {
    uuid: string,
    fileName: string,
    eventName: string,
    destroy: () => void,
}

const TransferProgressBar: React.FC<TransferProgressBarProps> = ({uuid, fileName, eventName, destroy}) => {
    const {
        progress,
    } = useTransferProgressBar(eventName, destroy);

    useEffect(() => {
        emit(`bar_is_ready_${uuid}`, {});
    }, []);

    return (
        <div className="transfer-progress-bar">
            <div className="file-name" title={fileName}>{fileName}</div>
            <div className="progress-bar-container">
                <div className="progress-bar" title={`${progress}%`} style={{
                    width: `${progress}%`,
                }}/>
            </div>
        </div>
    )
}

export default TransferProgressBar;