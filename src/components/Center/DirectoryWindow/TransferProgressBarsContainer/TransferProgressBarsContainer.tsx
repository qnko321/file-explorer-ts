import { useEffect, useState } from "react";
import TransferProgressBar from "./TransferProgressBar/TransferProgressBar";
import { listen } from "@tauri-apps/api/event";

const TransferProgressBars: React.FC = () => {
    const [progressBars, setProgressBars] = useState([]);

    useEffect(() => {
        const unlisten_file_transfer_start_event = listen('file_transfer_start', (event: any) => {
            const name = event.payload.name;
            const path = event.payload.path;
            const uuid = event.payload.uuid.join('');
            
            setProgressBars(prevState => [...prevState, <TransferProgressBar key={uuid} uuid={`${uuid}`} fileName={name} eventName={`transfer_progress_${uuid}`} destroy={() => destoryProgressBar(prevState.length)}/>]);
        });

        return () => {
            unlisten_file_transfer_start_event.then(f => f());
        }
    }, []);

    const destoryProgressBar = (index: number) => {
        setProgressBars(prevState => {
            const oldBars = [...prevState];
            const newBars = oldBars.filter((_, barIndex) => barIndex != index);
            return newBars;
        })
    }

    return (
        <div className="transfer-progress-bars">
            {progressBars}
        </div>
    )
}

export default TransferProgressBars;