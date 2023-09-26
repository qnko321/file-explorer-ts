interface FolderContextMenuProps {
    displayFolderContextMenu: boolean,
    folderContextMenuData: {x: string, y: string, path: string},
    openDirectoryInNewTab: () => void,
    transferFolder: () => void,
    transferSelected: () => void,
    open: () => void,
    rename: () => void,
    deleteEntry: () => void,
}

const FolderContextMenu: React.FC<FolderContextMenuProps> = ({displayFolderContextMenu, folderContextMenuData, openDirectoryInNewTab, transferFolder, transferSelected, open, rename, deleteEntry}) => {
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
                <li onClick={() => {open()}}>Open</li>
                <li onClick={() => {openDirectoryInNewTab()}}>Open in New Tab</li>
                <li onClick={() => {rename()}}>Rename</li>
                <li onClick={() => {deleteEntry()}}>Open in New Tab</li>
                <li onClick={() => {transferFolder()}}>Transfer</li>
                <li onClick={() => {transferSelected()}}>Transfer Selected</li>
            </ul>
        </div>
    )
}

export default FolderContextMenu;