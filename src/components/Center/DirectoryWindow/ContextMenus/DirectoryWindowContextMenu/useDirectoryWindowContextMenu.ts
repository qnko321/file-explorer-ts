import { emit, listen, Event } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CloseContextMenuEventPayload from "../../../../../intefaces/EventPayloads/CloseContextMenuEventPayload";

const useFolderContextMenu = () => {
    const dispatch = useDispatch();

    const [displayDirectoryWindowContextMenu, setDisplayDirectoryWindowContextMenu] = useState<boolean>(false);
    const [directoryWindowContextMenuData, setDirectoryWindowContextMenuData] = useState<{x: string, y: string}>({
        x: "0px",
        y: "0px",
    });

    useEffect(() => {
        const unlisten_close_context_menu = listen('close-context-menu', (event: Event<CloseContextMenuEventPayload>) => {
            if (event.payload.menu !== 'directory-window') {
                closeDirectoryWindowContextMenu();
            }
        });

        return () => {
            unlisten_close_context_menu.then(f => f());
        }
    }, []);

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

    return {
        openDirectoryWindowContextMenu,
        directoryWindowContextMenuData,
        displayDirectoryWindowContextMenu,
    };
}

export default useFolderContextMenu;