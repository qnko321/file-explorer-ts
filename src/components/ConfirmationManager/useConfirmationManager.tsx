import { emit, listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import ConfirmationWindow from "./ConfirmationrWindow/ConfirmationWindow";
import { v4 as uuidv4} from "uuid";

//  display-confirmation payload
//      title: string | undefined
//      message: string
//      ok: boolean
//      cancel: boolean
//      yes: boolean
//      no: boolean

const useConfirmationManager = () => {
    const [confirmationWindows, setConfirmationWindows] = useState<object>({});
    const [displayWindow, setDisplayWindow] = useState(undefined);

    useEffect(() => {
        const unlisten_display_error = listen('display-confirmation', (event: any) => {
            const uuid = event.payload.uuid;
            const title = event.payload.title;
            const message = event.payload.message;
            const ok = event.payload.ok;
            const cancel = event.payload.cancel;
            const yes = event.payload.yes;
            const no = event.payload.no;

            displayConfirmationLocal(uuid, title, message, ok, cancel, yes, no);
        });

        return () => {
            unlisten_display_error.then(f => f());
        }
    }, []);
    
    useEffect(() => {
        const keysArray = Object.keys(confirmationWindows);
        const newDisplayWindow = confirmationWindows[keysArray[keysArray.length - 1]];
        setDisplayWindow(newDisplayWindow);
    }, [confirmationWindows]);

    const displayConfirmationLocal = (uuid, title: string, message: string, ok: boolean, cancel: boolean, yes: boolean, no: boolean) => {
        const window_uuid = uuidv4();
        setConfirmationWindows(prevState => {
            const window = <ConfirmationWindow uuid={uuid} title={title} message={message} ok={ok} cancel={cancel} yes={yes} no={no} close={() => closeErorWindow(window_uuid)}/>;
            const oldState = { ...prevState };
            oldState[window_uuid] = window;
            return oldState;
        });
    }

    const closeErorWindow = (uuid: string) => {
        setConfirmationWindows(prevState => {
            const updatedState = { ...prevState };
            delete updatedState[uuid];
            return updatedState;
        });
    }

    return {
        displayWindow
    };
}

const displayConfirmation = (title: string, message: string, ok: boolean, cancel: boolean, yes: boolean, no: boolean) => {
    return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        
        let result;

        listen(`confirmation-${uuid}`, (event: any) => {
            console.log(event.payload.result);
            
            result = event.payload.result;
        });

        emit('display-confirmation', {
            uuid,
            title,
            message,
            ok,
            cancel,
            yes,
            no,
        });

        const id = setInterval(() => {
            if (result !== undefined) {
                resolve(result);
                clearInterval(id);
            }
        }, 300);
    });
}

export default displayConfirmation;

export {
    useConfirmationManager
};