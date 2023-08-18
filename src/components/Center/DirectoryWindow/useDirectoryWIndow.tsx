import { useDispatch, useSelector } from "react-redux";
import TabData from "./TabData";
import { Entry } from "../../../intefaces/Entry";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import { close, open } from "../../../slices/tabsSlice";
import { emit, listen } from "@tauri-apps/api/event";

type EntriesChache = {
    [path: string]: Entry[]
}

const useDirectoryWindow = () => {
    const dispatch = useDispatch();

    const [entriesCache, setEntriesCache] = useState<EntriesChache>({});
    const [displayTabContextMenu, setDisplayTabContextMenu] = useState<boolean>(false);
    const [tabContextMenuData, setTabContextMenuData] = useState<{x: string, y: string, index: number}>({
        x: "0px",
        y: "0px",
        index: -1,
    });
    const [displayFolderContextMenu, setDisplayFolderContextMenu] = useState<boolean>(false);
    const [folderContextMenuData, setFolderContextMenuData] = useState<{x: string, y: string, path: string}>({
        x: "0px",
        y: "0px",
        path: "",
    });
    const [displayDirectoryWindowContextMenu, setDisplayDirectoryWindowContextMenu] = useState<boolean>(false);
    const [directoryWindowContextMenuData, setDirectoryWindowContextMenuData] = useState<{x: string, y: string}>({
        x: "0px",
        y: "0px",
    });

    const [isCreatingNewFolder, setIsCreatingNewFolder] = useState<boolean>(false);
    const [isCreatingNewFile, setIsCreatingNewFile] = useState<boolean>(false);

    const tabs: {
        currentTabIndex: number,
        data: TabData[]
    } = useSelector((state: {tabs: {
        currentTabIndex: number,
        data: TabData[]
    }}) => state.tabs);

    useEffect(() => {
        const unlisten_close_context_menu = listen('close-context-menu', (event) => {
            if (event.payload.menu !== 'tab') {
                closeTabContextMenu();
            }
            if (event.payload.menu !== 'folder') {
                closeFolderContextMenu();
            }
            if (event.payload.menu !== 'directory-window') {
                closeDirectoryWindowContextMenu();
            }
        });

        return () => {
            unlisten_close_context_menu.then(f => f());
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

    const closeTab = () => {
        dispatch(close(tabContextMenuData.index));
        closeTabContextMenu();
    }

    const openDirectoryInNewTab = () => {
        dispatch(open({
            path: folderContextMenuData.path,
            newTab: true,
        }));
        closeFolderContextMenu();
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

    const openFolderContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, path: string) => {
        e.preventDefault();
        e.stopPropagation();
        emit('close-context-menu', {
            menu: 'folder',
        });

        setDisplayFolderContextMenu(true);
        setFolderContextMenuData({
            x: `${e.pageX}`,
            y: `${e.pageY}`,
            path,
        });
    }

    const closeFolderContextMenu = () => {
        setDisplayFolderContextMenu(false);
    }

    const openDirectoryWindowContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        emit('close-context-menu', {
            menu: 'directory-window',
        });

        setDisplayDirectoryWindowContextMenu(true);
        setDirectoryWindowContextMenuData({
            x: `${e.pageX}`,
            y: `${e.pageY}`,
        })
    }

    const closeDirectoryWindowContextMenu = () => {
        setDisplayDirectoryWindowContextMenu(false);
    }

    const openTabContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        emit('close-context-menu', {
            menu: 'tab',
        });

        setDisplayTabContextMenu(true);
        setTabContextMenuData({
            x: `${e.pageX}`,
            y: `${e.pageY}`,
            index,
        })
    }

    const closeTabContextMenu = () => {
        setDisplayTabContextMenu(false);
    }

    const createNewFolder = (name: string) => {
        const currentPath = tabs.data[tabs.currentTabIndex].path;
        invoke('create_new_folder', {
            name: name,
            path: currentPath,
        })
        .then(_ => {
            console.log("Successfully created new folder!")
            invoke("get_directory_content", {path: currentPath}).then(entries => {
                setEntriesCache(prevState => ({
                    ...prevState,
                    [currentPath]: entries as Entry[],
                }))
            })
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

    return {
        tabs,
        searchForInEntries,
        openTabContextMenu,
        displayTabContextMenu,
        tabContextMenuData,
        closeTab,
        openFolderContextMenu,
        displayFolderContextMenu,
        folderContextMenuData,
        openDirectoryInNewTab,
        openDirectoryWindowContextMenu,
        directoryWindowContextMenuData,
        displayDirectoryWindowContextMenu,
        createNewFolder,
        handleNewFolderClick,
        isCreatingNewFolder,
        openPowerShell,
    };
}

export default useDirectoryWindow;