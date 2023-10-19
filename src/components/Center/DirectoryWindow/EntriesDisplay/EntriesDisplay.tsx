import { emit, listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import ViewMode from "./ViewMode";
import { useDispatch, useSelector } from "react-redux";
import { getEntries, refreshEntries } from "../../../../slices/entriesSlice";
import {  } from "../../../../slices/tabsSlice";
import EntryItem from "./Entries/Entry";
import NewFile from "./Entries/NewFile";
import NewDirectory from "./Entries/NewDirectory";
import { invoke } from "@tauri-apps/api";

interface Props {
    openFileContextMenu: any,
    openFolderContextMenu: any, 
    isCreatingNewFile: boolean,
    isCreatingNewFolder: boolean,
    createNewFile: (name: string) => void,
    createNewFolder: (name: string) => void,
}

const EntriesDisplay: React.FC<Props> = ({openFileContextMenu, openFolderContextMenu, isCreatingNewFile, isCreatingNewFolder, createNewFile, createNewFolder}) => {
    const dispatch = useDispatch();

    const [viewMode, setViewMode] = useState(ViewMode.Details); 
    const [entries, setEntries] = useState([]);
    const [renamingPath, setRenamingPath] = useState<string | undefined>();

    useEffect(() => {
        const unlistenSetViewMode = listen("set-view-mode", (event: any) => {
            setViewMode(event.payload.mode);
        });

        const unlistenRenameEntry = listen("rename-entry", (event: any) => {
            console.log(event.payload.path);
            
            setRenamingPath(event.payload.path);
        })

        return () => {
            unlistenSetViewMode.then(f => f());
            unlistenRenameEntry.then(f => f());
        }
    }, []);

    //@ts-ignore
    const currentPath = useSelector(state => state.tabs.currentTabIndex > -1 ? state.tabs.data[state.tabs.currentTabIndex].path : "");
    //@ts-ignore
    const entryState = useSelector(state => state.entries[`${currentPath}`]);
    //@ts-ignore
    const selectedEntries = useSelector(state => state.tabs.currentTabIndex > -1 ? state.tabs.data[state.tabs.currentTabIndex].selectedEntries : []);

    useEffect(() => {
        if (currentPath !== "") {
            //@ts-ignore
            dispatch(getEntries()).unwrap().then(r => {
                const newEntries = r.response.map((entry: any, index: number) => (
                    <EntryItem 
                        viewMode={viewMode}
                        entry={entry} 
                        index={index}
                        isSelected={selectedEntries.some((entry, _) => entry.index === index)}
                        isRenaming={renamingPath === entry.path}
                        rename={rename}
                        openFileContextMenu={openFileContextMenu}
                        openFolderContextMenu={openFolderContextMenu}
                        key={index}
                    />
                ));
    
                setEntries(newEntries);
            });
        }
    }, [currentPath, selectedEntries, viewMode, entryState, renamingPath]);

    const rename = (path: string, newName: string) => {
        invoke("rename_entry", {
            path,
            newName: newName,
        }).then(_ => {
            //@ts-ignore
            dispatch(updateSelectedEntryPath());
            //@ts-ignore
            dispatch(refreshEntries());
        }).catch(error => {
            emit('show-error', {
                error,
            });
        });
        setRenamingPath("");
    }

    if (viewMode == ViewMode.Details) {
        return (
            <div className="entries-display">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Size</th>
                            <th>Last Modified</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries}
                        {isCreatingNewFile && (
                            <NewFile viewMode={viewMode} createNewFile={createNewFile}/>
                        )}
                        {isCreatingNewFolder && (
                            <NewDirectory viewMode={viewMode} createNewFolder={createNewFolder}/>
                        )}
                    </tbody>
                </table>
            </div>
        )
    } else if (viewMode == ViewMode.LargeIcons) {
        return (
            <div className="entries-display">
                <div className="large-icons">
                    {entries}
                    {isCreatingNewFile && (
                        <NewFile viewMode={viewMode} createNewFile={createNewFile}/>
                    )}
                    {isCreatingNewFolder && (
                        <NewDirectory viewMode={viewMode} createNewFolder={createNewFolder}/>
                    )}
                </div>
            </div>
        )
    }
}

export default EntriesDisplay;