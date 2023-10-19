import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import ViewMode from "../ViewMode";

interface Props {
    viewMode: ViewMode,
    createNewFile: (name: string) => void,
}

const NewFile: React.FC<Props> = ({viewMode, createNewFile}) => {
    const [newName, setNewName] = useState<string>("");
    const newNameRef = useRef(newName);
    const inputRef = useRef();

    useEffect(() => {
        //@ts-ignore
        inputRef.current.focus();
        const unlistenCloseContextMenu = listen("close-context-menu", (_) => {
            createNewFile(newNameRef.current);
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
            createNewFile(newNameRef.current);
        } 
    }    

    if (viewMode == ViewMode.Details) {
        return (
            <tr
                className="not-selected"
                onClick={e => e.stopPropagation()}
            >
                <td><img src="./file.svg"/></td>
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
    } else if (viewMode == ViewMode.LargeIcons) {
        return (
            <div 
                onClick={e => e.stopPropagation()}
                className="entry"
            >
                <img src={"./file.svg"}/>
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

    return (
        <></>
    )
}

export default NewFile;