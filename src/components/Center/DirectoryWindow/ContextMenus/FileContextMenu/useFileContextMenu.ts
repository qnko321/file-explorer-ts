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

    const openFileContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, path: string, name: string) => {
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
        });
    }

    const closeFileContextMenu = () => {
        setDisplayFileContextMenu(false);
    }

    const transferFile = () => {
        invoke('send_file', {
            path: fileContextMenuData.path,
            name: fileContextMenuData.name,
        });
    }

    return {
        displayFileContextMenu,
        fileContextMenuData,
        openFileContextMenu,
        transferFile,
    };
}

export default useFileContextMenu;