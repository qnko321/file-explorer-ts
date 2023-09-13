import { useDispatch, useSelector } from "react-redux";
import TabData from "./TabData";
import { Entry } from "../../../intefaces/Entry";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api";
import { close, open } from "../../../slices/tabsSlice";
import { emit, listen, Event } from "@tauri-apps/api/event";
import CloseContextMenuEventPayload from "../../../intefaces/EventPayloads/CloseContextMenuEventPayload";

type EntriesChache = {
    [path: string]: Entry[]
}

const useDirectoryWindow = () => {
    const [entriesCache, setEntriesCache] = useState<EntriesChache>({});

    const [isCreatingNewFolder, setIsCreatingNewFolder] = useState<boolean>(false);
    const [isCreatingNewFile, setIsCreatingNewFile] = useState<boolean>(false);

    const tabs: {
        currentTabIndex: number,
        data: TabData[]
    } = useSelector((state: {tabs: {
        currentTabIndex: number,
        data: TabData[]
    }}) => state.tabs);

    const tabsRef = useRef(tabs);

    const currentPath = tabsRef.current.currentTabIndex > -1 ? tabsRef.current.data[tabsRef.current.currentTabIndex].path : "";

    useEffect(() => {
        tabsRef.current = tabs;
    }, [tabs]);

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (event.key === 'Delete') {
                const selectedEntries = tabsRef.current.data[tabsRef.current.currentTabIndex].selectedEntries;
                const toDelete = selectedEntries.map((entry, _) => {
                    return {
                        is_dir: entry.isDir,
                        path: entry.path,
                    };
                });
                invoke("delete_entries", {
                    entries: toDelete,
                }).then(_ => {
                    const currentPath = tabsRef.current.data[tabsRef.current.currentTabIndex].path;
                    invoke("get_directory_content", {path: currentPath}).then(entries => {
                        setEntriesCache(prevState => ({
                            ...prevState,
                            [currentPath]: entries as Entry[],
                        }))
                    });
                }). catch(error => {
                    console.error(error);
                });
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    const getEntries = (path: string): Entry[] => {
        if (entriesCache[path] !== undefined) {
            return entriesCache[path];
        }
        if (path === "drives") {
            invoke("get_drive_letters").then(drives => {
                const newEntries = (drives as string[]).map((entry, _) => {
                    return {
                        is_dir: true,
                        path: entry,
                        name: entry,
                    } as Entry;
                });
                
                setEntriesCache(prevState => ({...prevState, [path]: newEntries}));
                return newEntries;
            })
        } else {
            invoke("get_directory_content", {path}).then(entries => {
                setEntriesCache(prevState => ({
                    ...prevState,
                    [path]: entries as Entry[],
                }))
                
                return entries;
            })
        }

        return [];
    }

    const searchForInEntries = (path: string, searchFor: string): Entry[] => {
        const entries = getEntries(path);
        const searchForLowered = searchFor.toLowerCase();

        const startsWith = entries.filter((entry, index) => entry.name.toLowerCase().startsWith(searchForLowered));

        const contains = entries.filter((entry, index) => entry.name.toLowerCase().includes(searchForLowered));

        const results = [...startsWith, ...contains];
        const filteredResults = results.filter((value, index, self) => self.indexOf(value) === index);
        return filteredResults;
    }
    
    const createNewFile = (name: string) => {
        const currentPath = tabs.data[tabs.currentTabIndex].path;
        invoke('create_new_file', {
            name: name,
            path: currentPath,
        })
        .then(_ => {
            console.log("Successfully created a new file!")
            invoke("get_directory_content", {path: currentPath}).then(entries => {
                setEntriesCache(prevState => ({
                    ...prevState,
                    [currentPath]: entries as Entry[],
                }))
            });
        })
        .catch(error => emit('show-error', {error}));
        setIsCreatingNewFile(false);
    }

    const handleNewFileClick = () => {
        setIsCreatingNewFile(true);
    }

    const createNewFolder = (name: string) => {
        const currentPath = tabs.data[tabs.currentTabIndex].path;
        invoke('create_new_folder', {
            name: name,
            path: currentPath,
        })
        .then(_ => {
            console.log("Successfully created a new folder!")
            invoke("get_directory_content", {path: currentPath}).then(entries => {
                setEntriesCache(prevState => ({
                    ...prevState,
                    [currentPath]: entries as Entry[],
                }))
            });
        })
        .catch(error => emit('show-error', {error}));
        setIsCreatingNewFolder(false);
    }

    const handleNewFolderClick = () => {
        setIsCreatingNewFolder(true);
    }

    const openPowerShell = () => {
        const currentPath = tabs.data[tabs.currentTabIndex].path; 
        invoke('open_powershell', {path: currentPath});
    }

    const transferSelected = () => {
        const selected_entries = tabs.data[tabs.currentTabIndex].selectedEntries;
        const selected_entries_cleaned = selected_entries.map((entry, _) => {
            return {
                path: entry.path,
                is_dir: entry.isDir,
            }
        });
        invoke('transfer_selected', {
            entries: selected_entries_cleaned,
        });
    }

    return {
        tabs,
        currentPath,
        searchForInEntries,
        createNewFolder,
        createNewFile,
        handleNewFolderClick,
        isCreatingNewFolder,
        handleNewFileClick,
        isCreatingNewFile,
        openPowerShell,
        transferSelected,
    };
}

export default useDirectoryWindow;