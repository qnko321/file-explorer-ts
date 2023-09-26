import { emit, listen, Event } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import CloseContextMenuEventPayload from "../../../../../intefaces/EventPayloads/CloseContextMenuEventPayload";
import { invoke } from "@tauri-apps/api";

const useFileContextMenu = () => {
    const [displayFileContextMenu, setDisplayFileContextMenu] = useState<boolean>(false);
    const [fileContextMenuData, setFileContextMenuData] = useState<{x: string, y: string, path: string, name: string}>({
        x: "0px",
        y: "0px",
        path: "",
        name: "",
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
        const index = fileContextMenuData.index;
        emit('rename-entry', {
            index,
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

    return {
        displayFileContextMenu,
        fileContextMenuData,
        openFileContextMenu,
        transferFile,
        openFile,
        rename
    };
}

export default useFileContextMenu;