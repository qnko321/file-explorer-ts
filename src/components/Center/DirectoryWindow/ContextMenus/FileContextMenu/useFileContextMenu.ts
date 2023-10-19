import { emit, listen, Event } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import CloseContextMenuEventPayload from "../../../../../intefaces/EventPayloads/CloseContextMenuEventPayload";
import { invoke } from "@tauri-apps/api";
import displayConfirmation from "../../../../ConfirmationManager/useConfirmationManager";
import { ConfirmationValue } from "../../../../ConfirmationManager/ConfirmationrWindow/ConfirmationWindow";

const useFileContextMenu = (refreshCurrent: () => void) => {
    const [displayFileContextMenu, setDisplayFileContextMenu] = useState<boolean>(false);
    const [fileContextMenuData, setFileContextMenuData] = useState<{x: string, y: string, path: string, name: string, index: number}>({
        x: "0px",
        y: "0px",
        path: "",
        name: "",
        index: undefined,
    });

    useEffect(() => {
        const unlisten_close_context_menu = listen('close-context-menu', (event: Event<CloseContextMenuEventPayload>) => {
            if (event.payload.menu !== 'file') {
                closeFileContextMenu();
            }
        });

        return () => {
            unlisten_close_context_menu.then(f => f());
        }
    }, []);

    const rename = () => {
        const path = fileContextMenuData.path;
        emit('rename-entry', {
            path,
        });
    }

    const openFileContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, path: string, name: string, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        emit('close-context-menu', {
            menu: 'file',
        });

        setDisplayFileContextMenu(true);
        setFileContextMenuData({
            x: `${e.pageX}`,
            y: `${e.pageY}`,
            path,
            name,
            index,
        });
    }

    const closeFileContextMenu = () => {
        setDisplayFileContextMenu(false);
    }

    const transferFile = () => {
        invoke('send_file', {
            path: fileContextMenuData.path,
            name: fileContextMenuData.name,
        }).catch(error => {
            console.log(error);
            
            emit("display-error", {
                error
            });
        });
    }

    const openFile = () => {
        invoke('open_file', {
            path: fileContextMenuData.path,
        }).catch(error => {
            emit("display-error", {
                error
            });
        });
    }

    const deleteEntry = () => {
        const toDelete = [
            {
                is_dir: false,
                path: fileContextMenuData.path
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
        displayFileContextMenu,
        fileContextMenuData,
        openFileContextMenu,
        transferFile,
        openFile,
        rename,
        deleteFileEntry: deleteEntry,
    };
}

export default useFileContextMenu;