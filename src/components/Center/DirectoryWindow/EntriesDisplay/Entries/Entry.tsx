import { useDispatch } from "react-redux";
import { Entry } from "../../../../../intefaces/Entry";
import ViewMode from "../ViewMode";
import { open, selectEntry } from "../../../../../slices/tabsSlice";
import { invoke } from "@tauri-apps/api";
import { emit, listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
interface Props {
    viewMode: ViewMode,
    entry: Entry,
    index: number,
    isSelected: boolean;
    isRenaming: boolean,
    rename: (path: string, name: string) => void,
    openFileContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, path: string, name: string, index: number) => void,
    openFolderContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, path: string) => void,
}

const EntryItem: React.FC<Props> = ({viewMode, entry, index, isSelected, isRenaming, rename, openFileContextMenu, openFolderContextMenu}) => {    
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

        const unlisten_close_context_menu = listen('close-context-menu', (event) => {
            if (isRenaming) {
                rename(entry.path, newNameRef.current);
            }
        });

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            unlisten_close_context_menu.then(f => f());
        }
    }, []);

    useEffect(() => {
        if (isRenaming) {
            //@ts-ignore
            newNameInputRef.current.focus();
            //@ts-ignore
            newNameInputRef.current.select();
        }
    }, [isRenaming]);

    const handleOnContextMenu = (e) => {
        if (entry.is_dir) {
            openFolderContextMenu(e, entry.path);
        } else {
            openFileContextMenu(e, entry.path, entry.name, index);
        }
    }

    const handleDoubleClick = (e) => {
        if (entry.is_dir) {
            dispatch(open({
                path: entry.path,
                newTab: false,
            }));
        } else {
            invoke("open_file", { path: entry.path }).catch(error => {
                emit("display-error", {
                    error
                });
            });
        }
    }

    const handleClick = (e) => {
        e.stopPropagation();
        dispatch(selectEntry({
            index: index,
            path: entry.path,
            isDir: entry.is_dir !== undefined ? entry.is_dir : false,
            ctrlDown: isCtrlDown.current,
        }));
    }

    const [newName, setNewName] = useState<string>(entry.name);
    const newNameRef = useRef(newName);

    const newNameInputRef = useRef();

    useEffect(() => {
        newNameRef.current = newName;
    }, [newName]);

    const onNewNameChange = (e) => {
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
            rename(entry.path, newNameRef.current);
        } 
    }

    if (viewMode === ViewMode.Details) {
        return (
            <tr
                onContextMenu={handleOnContextMenu}
                onDoubleClick={handleDoubleClick}
                onClick={handleClick}
                className={isSelected ? "selected" : "not-selected"}
            >
                <td><img src={entry.is_dir ? "./folder.svg" : "./file.svg"}/></td>
                <td title={entry.name} className="name">{entry.name}</td>
                <td>{entry.is_dir ? "" : entry.size}</td>
                <td>{entry.lastModified}</td>
                <td>{entry.created}</td>
            </tr>
        )
    } else if (viewMode === ViewMode.LargeIcons) {
        return (
            <div
                onContextMenu={handleOnContextMenu}
                onDoubleClick={handleDoubleClick}
                onClick={handleClick}
                className={"entry " + (isSelected ? "selected" : "not-selected")} 
            >
                <img src={entry.is_dir ? "./folder.svg" : "./file.svg"}/>
                {
                    isRenaming ? (
                        <input 
                            ref={newNameInputRef} 
                            className="new-name-input" 
                            type="text" 
                            value={newName}
                            onChange={onNewNameChange} 
                            onKeyDown={handleOnKeyDown}
                        />
                    ) : (
                        <div className="name" title={entry.name}>{entry.name}</div>
                    )
                }
            </div>
        )
    }

    return (
        <></>
    )
}

export default EntryItem;