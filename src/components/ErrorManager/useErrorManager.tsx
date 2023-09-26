import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import ErrorWindow from "./ErrorWindow/ErrorWindow";
import { v4 as uuidv4} from "uuid";

const useErrorManager = () => {
    const [errorWindows, setErrorWindows] = useState({});
    const [displayWindow, setDisplayWindow] = useState(undefined);

    useEffect(() => {
        const unlisten_display_error = listen('display-error', (event: any) => {
            const title = event.payload.title;
            const error = event.payload.error;

            displayError(title, error);
        });

        return () => {
            unlisten_display_error.then(f => f());
        }
    }, []);
    
    useEffect(() => {
        const keysArray = Object.keys(errorWindows);
        const newDisplayWindow = errorWindows[keysArray[keysArray.length - 1]];
        setDisplayWindow(newDisplayWindow);
    }, [errorWindows]);

    const displayError = (title: string, error: string) => {
        const uuid = uuidv4();
        setErrorWindows(prevState => {
            const window = <ErrorWindow title={title} error={error} close={() => closeErorWindow(uuid)}/>;
            const oldState = { ...prevState };
            oldState[uuid] = window;
            return oldState;
        });
    }

    const closeErorWindow = (uuid: string) => {
        setErrorWindows(prevState => {
            const updatedState = { ...prevState };
            delete updatedState[uuid];
            return updatedState;
        });
    }

    return {
        displayWindow
    };
}

export default useErrorManager;