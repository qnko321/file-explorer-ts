interface TabContextMenuProps {
    displayTabContextMenu: boolean,
    tabContextMenuData: {x: string, y: string, index: number},
    closeTab: () => void,
    closeOthers: () => void,
    closeAll: () => void,
    closeTabsToTheLeft: () => void,
    closeTabsToTheRight: () => void,
}

const TabContextMenu: React.FC<TabContextMenuProps> = ({displayTabContextMenu, tabContextMenuData, closeTab, closeOthers, closeAll, closeTabsToTheLeft, closeTabsToTheRight}) => {
    return (
        <div 
            className="context-menu"
            style={{
                display: displayTabContextMenu ? "inline" : "none",
                top: `${tabContextMenuData.y}px`,
                left: `${tabContextMenuData.x}px`
            }}
        >
            <ul>
                <li onClick={() => closeTab()}>Close</li>
                <li onClick={() => closeOthers()}>Close Others</li>
                <li onClick={() => closeAll()}>Close All</li>
                <li onClick={() => closeTabsToTheLeft()}>Close All Left</li>
                <li onClick={() => closeTabsToTheRight()}>Close All Right</li>
            </ul>
        </div>
    )
}

export default TabContextMenu;