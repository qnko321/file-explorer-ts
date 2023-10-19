import { emit, listen, Event } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { open } from "../../../../../slices/tabsSlice";
import { useDispatch } from "react-redux";
import CloseContextMenuEventPayload from "../../../../../intefaces/EventPayloads/CloseContextMenuEventPayload";
import { invoke } from "@tauri-apps/api";
import displayConfirmation from "../../../../ConfirmationManager/useConfirmationManager";
import { ConfirmationValue } from "../../../../ConfirmationManager/ConfirmationrWindow/ConfirmationWindow";

const useFolderContextMenu = (refreshCurrent: () => void) => {
    const dispatch = useDispatch();

    const [displayFolderContextMenu, setDisplayFolderContextMenu] = useState<boolean>(false);
    const [folderContextMenuData, setFolderContextMenuData] = useState<{x: string, y: string, path: string}>({
        x: "0px",
        y: "0px",
        path: "",
    });

    useEffect(() => {
        const unlisten_close_context_menu = listen('close-context-menu', (event: Event<CloseContextMenuEventPayload>) => {
            if (event.payload.menu !== 'folder') {
                closeFolderContextMenu();
            }
        });

        return () => {
            unlisten_close_context_menu.then(f => f());
        }
    }, []);

    const openDirectoryInNewTab = () => {
        dispatch(open({
            path: folderContextMenuData.path,
            newTab: true,
        }));
        closeFolderContextMenu();
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

    const transferFolder = () => {
        invoke("send_folder_all", {
            path: folderContextMenuData.path,
        }).catch(error => {
            emit("display-error", {
                error
            });
        });
    }

    const openFolder = () => {
        dispatch(open({
            path: folderContextMenuData.path,
            newTab: false,
        }));
    }

    const deleteFolderEntry = () => {
        const toDelete = [
            {
                is_dir: true,
                path: folderContextMenuData.path
            }
        ];

        displayConfirmation("", `Are you sure you want to delete:\n ${JSON.stringify(toDelete)}`, false, false, true, true)
        .then(result => {
            if (result == ConfirmationValue.Yes) {
                invoke("delete_entries", {
                    entries: toDelete,
                }).then(_ => {
                    refreshCurrent();
                }).catch(error => {
                    console.log(error);
                    
                    emit("display-error", {
                        error
                    });
                });
            }
        });
    }

    return {
        displayFolderContextMenu,
        folderContextMenuData,
        openDirectoryInNewTab,
        openFolderContextMenu,
        transferFolder,
        open: openFolder,
        deleteFolderEntry
    };
}

export default useFolderContextMenu;