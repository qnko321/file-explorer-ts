import { emit, listen, Event } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { open } from "../../../../../slices/tabsSlice";
import { useDispatch } from "react-redux";
import CloseContextMenuEventPayload from "../../../../../intefaces/EventPayloads/CloseContextMenuEventPayload";

const useFolderContextMenu = () => {
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

    return {
        displayFolderContextMenu,
        folderContextMenuData,
        openDirectoryInNewTab,
        openFolderContextMenu
    };
}

export default useFolderContextMenu;

function dispatch(arg0: Window | null) {
    throw new Error("Function not implemented.");
}
