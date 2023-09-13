interface FolderContextMenuProps {
    displayFolderContextMenu: boolean,
    folderContextMenuData: {x: string, y: string, path: string},
    openDirectoryInNewTab: () => void,
    transferFolder: () => void,
    transferSelected: () => void,
}

const FolderContextMenu: React.FC<FolderContextMenuProps> = ({displayFolderContextMenu, folderContextMenuData, openDirectoryInNewTab, transferFolder, transferSelected}) => {
    return (
        <div 
            className="context-menu"
            style={{
                display: displayFolderContextMenu ? "inline" : "none",
                top: `${folderContextMenuData.y}px`,
                left: `${folderContextMenuData.x}px`
            }}
        >
            <ul>
                <li onClick={() => {openDirectoryInNewTab()}}>Open in New Tab</li>
                <li onClick={() => {transferFolder()}}>Transfer</li>
                <li onClick={() => {transferSelected()}}>Transfer Selected</li>
            </ul>
        </div>
    )
}

export default FolderContextMenu;