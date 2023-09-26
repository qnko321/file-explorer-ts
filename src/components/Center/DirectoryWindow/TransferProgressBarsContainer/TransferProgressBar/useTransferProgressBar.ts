import { useEffect, useState } from "react";
import {listen} from '@tauri-apps/api/event';

const useTransferProgressBar = (eventName: string, destroy: () => void) => {
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        const unlisten_progress_event = listen(eventName, (event: any) => {
            const progress = event.payload[0];
            const reachedEnd = event.payload[1];
            
            if (!reachedEnd) {
                setProgress(progress);
            } else {
                destroy();
            }
        });

        return () => {
            unlisten_progress_event.then(f => f());
        }
    }, []);

    return {
        progress,
    }
}

export default useTransferProgressBar;