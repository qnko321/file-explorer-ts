import { useDispatch, useSelector } from "react-redux";
import TabData from "./TabData";
import { Entry } from "../../../intefaces/Entry";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api";
import { emit, listen } from "@tauri-apps/api/event";
import { deselectAll } from "../../../slices/tabsSlice";
import displayConfirmation from "../../ConfirmationManager/useConfirmationManager";
import { ConfirmationValue } from "../../ConfirmationManager/ConfirmationrWindow/ConfirmationWindow";
import { refreshEntries } from "../../../slices/entriesSlice";

type EntriesChache = {
    [path: string]: Entry[]
}

const useDirectoryWindow = () => {
    const [entriesCache,  setEntriesCache] = useState<EntriesChache>({});

    const [isCreatingNewFolder, setIsCreatingNewFolder] = useState<boolean>(false);
    const [isCreatingNewFile, setIsCreatingNewFile] = useState<boolean>(false);

    const dispatch = useDispatch();

    const tabsState: {
        currentTabIndex: number,
        data: TabData[]
    } = useSelector((state: {tabs: {
        currentTabIndex: number,
        data: TabData[]
    }}) => state.tabs);

    const tabsStateRef = useRef(tabsState);

    const currentPath = tabsState.currentTabIndex > -1 ? tabsState.data[tabsState.currentTabIndex].path : "";

    useEffect(() => {
        tabsStateRef.current = tabsState;
    }, [tabsState]);

    useEffect(() => {
        const unlisten_refresh_current_tab = listen("refresh-current-tab", (_) => {
            refreshContent();
        });
        
        const handleKeyDown = (event: any) => {
            if (event.key === 'Delete') {
                deleteSelectedEntries();
            } else if (event.key === "F2") {
                rename();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            unlisten_refresh_current_tab.then(f => f());
        }
    }, []);

    const deleteSelectedEntries = () => {
        const selectedEntries = tabsStateRef.current.data[tabsStateRef.current.currentTabIndex].selectedEntries;
        const toDelete = selectedEntries.map((entry, _) => {
            return {
                is_dir: entry.isDir,
                path: entry.path,
            };
        });
        displayConfirmation("", `Are you sure you want to delete:\n ${JSON.stringify(toDelete)}`, false, false, true, true)
        .then(result => {
            if (result == ConfirmationValue.Yes) {
                invoke("delete_entries", {
                    entries: toDelete,
                }).then(_ => {
                    refreshContent();
                    dispatch(deselectAll());
                }).catch(error => {
                    emit("display-error", {
                        error
                    });
                });
            }
        });
    }

    const rename = () => {
        const selectedEntries = tabsStateRef.current.data[tabsStateRef.current.currentTabIndex].selectedEntries;
        if (selectedEntries.length == 0) {
            return;
        }
        const lastEntry = selectedEntries[selectedEntries.length - 1];
        const path = lastEntry.path;
        
        emit('rename-entry', {
            path,
        });
    }

    const getEntriesInDirectory = (path: string): Entry[] => {
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
            }).catch(error => {
                emit("display-error", {
                    error
                });
            });
        } else {
            invoke("get_directory_content", {path}).then(entries => {
                setEntriesCache(prevState => ({
                    ...prevState,
                    [path]: entries as Entry[],
                }))
                
                return entries;
            }).catch(error => {
                console.log(error);
                emit("display-error", {
                    error
                });
            });
        }

        return [];
    }

    const searchForInEntries = (path: string, searchFor: string): Entry[] => {
        const entries = getEntriesInDirectory(path);
        const searchForLowered = searchFor.toLowerCase();

        const startsWith = entries.filter((entry, _) => entry.name.toLowerCase().startsWith(searchForLowered));

        const contains = entries.filter((entry, _) => entry.name.toLowerCase().includes(searchForLowered));

        const results = [...startsWith, ...contains];
        const filteredResults = results.filter((value, index, self) => self.indexOf(value) === index);
        return filteredResults;
    }
    
    const createNewFile = (name: string) => {
        if (name === "") {
            setIsCreatingNewFile(false);
            return;
        }

        const currentPath = tabsState.data[tabsState.currentTabIndex].path;
        invoke('create_new_file', {
            name: name,
            path: currentPath,
        })
        .then(_ => {
            console.log("Successfully created a new file!")
            refreshContent();
        }).catch(error => {
            emit("display-error", {
                error
            });
        });
        setIsCreatingNewFile(false);
    }

    const handleNewFileClick = () => {
        setIsCreatingNewFile(true);
    }

    const createNewFolder = (name: string) => {
        if (name === "") {
            setIsCreatingNewFolder(false);
            return;
        }

        const currentPath = tabsState.data[tabsState.currentTabIndex].path;
        invoke('create_new_folder', {
            name: name,
            path: currentPath,
        })
        .then(_ => {
            console.log("Successfully created a new folder!")
            refreshContent();
        }).catch(error => {
            emit("display-error", {
                error
            });
        });
        setIsCreatingNewFolder(false);
    }

    const handleNewFolderClick = () => {
        setIsCreatingNewFolder(true);
    }

    const openPowerShell = () => {
        const currentPath = tabsState.data[tabsState.currentTabIndex].path; 
        invoke('open_powershell', {path: currentPath}).catch(error => {
            emit("display-error", {
                error
            });
        });
    }

    const transferSelected = () => {
        const selected_entries = tabsState.data[tabsState.currentTabIndex].selectedEntries;
        const selected_entries_cleaned = selected_entries.map((entry, _) => {
            return {
                path: entry.path,
                is_dir: entry.isDir,
            }
        });
        
        invoke('transfer_selected', {
            entries: selected_entries_cleaned,
        }).catch(error => {
            emit("display-error", {
                error
            });
        });
    }

    const refreshContent = () => {
        //@ts-ignore
        dispatch(refreshEntries());
    }

    return {
        tabsState,
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
        refreshContent,
    };
}

export default useDirectoryWindow;