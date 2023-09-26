import { useDispatch } from "react-redux";
import { open, selectEntry } from "../../../../../../slices/tabsSlice";
import { useEffect, useRef, useState } from "react";
import { emit } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api";

interface DetailsDirectoryProps {
    name: string,
    path: string,
    size: string,
    lastModified: string,
    created: string,
    openContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, path: string) => void,
    index: number,
    renaming: boolean,
    isSelected: boolean,
}

const DetailsDirectory: React.FC<DetailsDirectoryProps> = ({name, path, size, lastModified, created, openContextMenu, index, renaming, isSelected}) => {
    const dispatch = useDispatch();
    let isCtrlDown = useRef(false);

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (event.code === "ControlLeft") {
                isCtrlDown.current = true;
            }
        }

        const handleKeyUp = (event: any) => {
            if (event.code === "ControlLeft") {
                isCtrlDown.current = false;
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        }
    })

    const [nameS, setNameS] = useState<string>(name);

    const [nameInput, setNameInput] = useState(name);
    const nameInputRef = useRef(nameInput);

    const nameInputFieldRef = useRef();

    useEffect(() => {
        if (renaming) {
            nameInputFieldRef.current.focus();
        } 
    }, [renaming]);

    useEffect(() => {
        nameInputRef.current = nameInput;
    }, [nameInput]);

    const handleNameInputChange = (e) => {
        setNameInput(e.target.value);
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
            handleRename();
        } 
    }

    const handleRename = () => {
        emit('rename-entry', {
            index: -1,
        });
        
        invoke("rename_entry", {
            path,
            newName: nameInputRef.current,
        }).then(_ => {
            setNameS(nameInputRef.current);
        }).catch(error => {
            emit('show-error', {
                error,
            });
        });
    }
    
    return (
        <div 
            className={"directory entry" + (isSelected ? " selected" : "")}
            onDoubleClick={() => dispatch(open({path, newTab: false}))}
            onClick={() => dispatch(selectEntry({index, path, isDir: true, ctrlDown: isCtrlDown.current}))}
            onContextMenu={(e) => openContextMenu(e, path)}
        >
            <img src="./folder.svg"/>
            {
                renaming ? (
                    <input ref={nameInputFieldRef} type="text" className="name-input" value={nameInput} onChange={handleNameInputChange} onKeyDown={handleOnKeyDown}/>
                ) : (
                    <h4 title={name} className="name">{nameS}</h4>
                )
            }
            <h5 title={size} className="size"></h5>
            <h5 title={lastModified} className="last-modified">{lastModified}</h5>
            <h5 title={created} className="created">{created}</h5>
        </div>
    );
}

export default DetailsDirectory;