import { emit, listen, Event } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { close } from "../../../../../slices/tabsSlice";
import { useDispatch } from "react-redux";
import CloseContextMenuEventPayload from "../../../../../intefaces/EventPayloads/CloseContextMenuEventPayload";

const useTabContextMenu = () => {
    const dispatch = useDispatch();

    const [displayTabContextMenu, setDisplayTabContextMenu] = useState<boolean>(false);
    const [tabContextMenuData, setTabContextMenuData] = useState<{x: string, y: string, index: number}>({
        x: "0px",
        y: "0px",
        index: -1,
    });

    useEffect(() => {
        const unlisten_close_context_menu = listen('close-context-menu', (event: Event<CloseContextMenuEventPayload>) => {
            if (event.payload.menu !== 'tab') {
                closeTabContextMenu();
            }
        });

        return () => {
            unlisten_close_context_menu.then(f => f());
        }
    }, []);

    const closeTab = () => {
        dispatch(close(tabContextMenuData.index));
        closeTabContextMenu();
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

    return {
        displayTabContextMenu,
        tabContextMenuData,
        closeTab,
        openTabContextMenu
    };
}

export default useTabContextMenu;
