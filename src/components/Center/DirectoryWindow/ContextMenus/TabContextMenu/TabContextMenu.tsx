interface TabContextMenuProps {
    displayTabContextMenu: boolean,
    tabContextMenuData: {x: string, y: string, index: number},
    closeTab: () => void,
}

const TabContextMenu: React.FC<TabContextMenuProps> = ({displayTabContextMenu, tabContextMenuData, closeTab}) => {
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
            </ul>
        </div>
    )
}

export default TabContextMenu;