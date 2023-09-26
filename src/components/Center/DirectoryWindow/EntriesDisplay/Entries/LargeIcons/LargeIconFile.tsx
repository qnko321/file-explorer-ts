import { invoke } from "@tauri-apps/api";
import { useDispatch } from "react-redux";
import { emit } from "@tauri-apps/api/event";
import { selectEntry } from "../../../../../../slices/tabsSlice";
import { useEffect, useRef, useState } from "react";

interface LargeIconFileProps {
    name: string,
    path: string,
    openContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, path: string, name: string) => void,
    index: number,
    renaming: boolean,
    isSelected: boolean,
}

const LargeIconFile: React.FC<LargeIconFileProps> = ({name, path, openContextMenu, index, renaming, isSelected}) => {
    const dispatch = useDispatch();

    const [nameS, setNameS] = useState<string>(name);

    const [nameInput, setNameInput] = useState(name);
    const nameInputRef = useRef(nameInput);

    const nameInputFieldRef = useRef();

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
    });

    useEffect(() => {
        if (renaming) {
            nameInputFieldRef.current.focus();
        } 
    }, [renaming]);

    useEffect(() => {
        nameInputRef.current = nameInput;
    }, [nameInput]);

    useEffect(() => {
        setNameS(name);
    }, [name])

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

    const handleOpenFile = () => {
        invoke("open_file", {path}).catch(error => {
            emit("display-error", {
                error
            });
        });
    }

    return (
        <div 
            className={"file entry" + (isSelected ? " selected" : "")} 
            onDoubleClick={handleOpenFile} 
            onClick={() => dispatch(selectEntry({index, path, isDir: false, ctrlDown: isCtrlDown.current}))}
            onContextMenu={(e) => {openContextMenu(e, path, name)}}
        >
            <img src="./file.svg"/>
            {
                renaming ? (
                    <input ref={nameInputFieldRef} type="text" className="name-input" value={nameInput} onChange={handleNameInputChange} onKeyDown={handleOnKeyDown}/>
                ) : (
                    <h5 title={name} className="name">{nameS}</h5>
                )
            }
        </div>
    );
}

export default LargeIconFile;