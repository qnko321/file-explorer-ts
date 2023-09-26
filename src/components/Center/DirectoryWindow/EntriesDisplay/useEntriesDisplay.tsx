import { ReactElement, useEffect, useState } from "react";
import LargeIconDirectory from "./Entries/LargeIcons/LargeIconDirectory";
import LargeIconFile from "./Entries/LargeIcons/LargeIconFile";
import DetailsDirectory from "./Entries/Details/DetailsDirectory";
import DetailsFile from "./Entries/Details/DetailsFile";
import { emit, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api";
import LargeIconNewFileTemplate from "./NewEntries/LargeIcons/LargeIconNewFileTemplate";
import LargeIconNewFolderTemplate from "./NewEntries/LargeIcons/LargeIconNewFolderTemplate";
import DetailsNewFileTemplate from "./NewEntries/Details/DetailsNewFileTemplate";
import DetailsNewFolderTemplate from "./NewEntries/Details/DetailsNewFolderTemplate";

enum ViewMode {
    LargeIcons = 0,
    Details = 1,
}

const useDisplayEntries = (tabsData: any, searchForInEntries, openFileContextMenu, openFolderContextMenu, isCreatingNewFile, isCreatingNewFolder, createNewFile, createNewFolder) => {
    const [viewMode, setViewMode] = useState(ViewMode.Details);
    let elements: ReactElement<any, any>[] = [];
    let newEntryElements: ReactElement<any, any>[] = [];
    let containerClass = "";
    const [renaming, setRenaming] = useState(-1);

    useEffect(() => {
        const unlistenSetViewMode = listen("set-view-mode", (event: any) => {
            setViewMode(event.payload.mode);
        });

        const unlistenRenameEntry = listen('rename-entry', (event: any) => {
            setRenaming(event.payload.index);
        });

        return () => {
            unlistenSetViewMode.then(f => f());
            unlistenRenameEntry.then(f => f());
        }
    }, []);

    switch (viewMode) {
        case ViewMode.LargeIcons:
            if (tabsData.data[tabsData.currentTabIndex].path === "drives") {
                break;
            }

            if (isCreatingNewFile) {
                newEntryElements.push(<LargeIconNewFileTemplate key={"new-file-template"} create={createNewFile}/>);
            }
            if (isCreatingNewFolder) {
                newEntryElements.push(<LargeIconNewFolderTemplate key={"new-folder-template"} create={createNewFolder}/>);
            }
            break;
        case ViewMode.Details:
            if (!tabsData.data[tabsData.currentTabIndex]) {
                break;
            }
            if (tabsData.data[tabsData.currentTabIndex].path === "drives") {
                break;
            }

            if (isCreatingNewFile) {
                newEntryElements.push(<DetailsNewFileTemplate key={"new-file-template"} create={createNewFile}/>);
            }
            if (isCreatingNewFolder) {
                newEntryElements.push(<DetailsNewFolderTemplate key={"new-folder-template"} create={createNewFolder}/>);
            }
            break;

        default:
            break;
    }
    
    switch (viewMode) {
        case ViewMode.LargeIcons:
            if (tabsData.currentTabIndex == -1) {
                break;
            }
            containerClass = "entries-container-large-icons";
            elements = searchForInEntries(tabsData.data[tabsData.currentTabIndex].path, tabsData.data[tabsData.currentTabIndex].searchFor).map((entry, index) => (
                entry.is_dir ? 
                <LargeIconDirectory 
                    key={index}
                    name={entry.name}
                    path={entry.path}
                    openContextMenu={openFolderContextMenu}
                    index={index}
                    renaming={index === renaming}
                    isSelected={tabsData.data[tabsData.currentTabIndex].selectedEntries.some((entry, _) => entry.index === index)}
                />
                :
                <LargeIconFile
                    key={index}
                    name={entry.name}
                    path={entry.path}
                    openContextMenu={openFileContextMenu}
                    index={index}
                    renaming={index === renaming}
                    isSelected={tabsData.data[tabsData.currentTabIndex].selectedEntries.some((entry, _) => entry.index === index)}
                />
            ))
            break;
        case ViewMode.Details:
            if (tabsData.currentTabIndex == -1) {
                break;
            }

            containerClass = "entries-container-details";
            elements = searchForInEntries(tabsData.data[tabsData.currentTabIndex].path, tabsData.data[tabsData.currentTabIndex].searchFor).map((entry, index) => (
                entry.is_dir ?
                <DetailsDirectory 
                    key={index}
                    name={entry.name}
                    path={entry.path}
                    size={entry.size}
                    lastModified={entry.last_modified}
                    created={entry.created}
                    openContextMenu={openFolderContextMenu}
                    renaming={index === renaming}
                    index={index}
                    isSelected={tabsData.data[tabsData.currentTabIndex].selectedEntries.some((entry, _) => entry.index === index)}
                />
                :
                <DetailsFile
                    key={index}
                    name={entry.name}
                    path={entry.path}
                    size={entry.size}
                    lastModified={entry.last_modified}
                    created={entry.created}
                    openContextMenu={openFileContextMenu}
                    renaming={index === renaming}
                    index={index}
                    isSelected={tabsData.data[tabsData.currentTabIndex].selectedEntries.some((entry, _) => entry.index === index)}
                />
            ))
            break;
    
        default:
            console.error("Unknown view mode:", viewMode);
            
            break;
    }
    
    
    return {
        elements,
        newEntryElements,
        containerClass,
        viewMode,
    };
}

export default useDisplayEntries;
export {
    ViewMode
};