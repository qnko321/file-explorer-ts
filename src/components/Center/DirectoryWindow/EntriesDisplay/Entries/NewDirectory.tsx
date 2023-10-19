import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import ViewMode from "../ViewMode";

interface Props {
    viewMode: ViewMode,
    createNewFolder: (name: string) => void,
}

const NewDirectory: React.FC<Props> = ({viewMode, createNewFolder}) => {
    const [newName, setNewName] = useState<string>("");
    const newNameRef = useRef(newName);
    const inputRef = useRef();

    useEffect(() => {
        // inputRef.current.focus();
        const unlistenCloseContextMenu = listen("close-context-menu", (event) => {
            createNewFolder(newNameRef.current);
        });

        return () => {
            unlistenCloseContextMenu.then(f => f());
        }
    }, []);

    useEffect(() => {
        newNameRef.current = newName;
    }, [newName]);

    const handleNewNameChange = (e) => {
        setNewName(e.target.value);
    }

    const handleOnKeyDown = (e) => {
        if (e.key == "/" ||
        e.key == "\\" ||
        e.key == ":" ||
        e.key == "*" ||
        e.key == "?" ||
        e.key == "\"" ||
        e.key == "<" ||
        e.key == ">" ||
        e.key == "|") {
            e.preventDefault();
        }

        if (e.keyCode === 13) {
            createNewFolder(newNameRef.current);
        } 
    }

    if (viewMode === ViewMode.Details) {
        return (
            <tr
                className="not-selected"
                onClick={e => e.stopPropagation()}
            >
                <td><img src="./folder.svg"/></td>
                <td className="name">
                    <input 
                        ref={inputRef} 
                        className="new-name-input" 
                        type="text" 
                        value={newName} 
                        onChange={handleNewNameChange} 
                        onKeyDown={handleOnKeyDown}
                    />
                </td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        )
    } else if (viewMode === ViewMode.LargeIcons) {
        return (
            <div
                className="not-selected entry"
                onClick={e => e.stopPropagation()}
            >
                <img src={"./folder.svg"}/>
                <input 
                        ref={inputRef} 
                        className="new-name-input" 
                        type="text" 
                        value={newName} 
                        onChange={handleNewNameChange} 
                        onKeyDown={handleOnKeyDown}
                    />
            </div>
        )
    }

    return <>Not Implemented</>
}

export default NewDirectory;