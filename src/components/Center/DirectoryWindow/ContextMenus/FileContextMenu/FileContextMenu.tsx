interface FolderContextMenuProps {
    displayFileContextMenu: boolean,
    fileContextMenuData: {x: string, y: string, path: string},
    transferFile: () => void,
    transferSelected: () => void,
    openFile: () => void,
    rename: () => void,
    deleteEntry: () => void,
}

const FileContextMenu: React.FC<FolderContextMenuProps> = ({displayFileContextMenu, fileContextMenuData, transferFile, transferSelected, openFile, rename, deleteEntry}) => {
    return (
        <div 
            className="context-menu"
            style={{
                display: displayFileContextMenu ? "inline" : "none",
                top: `${fileContextMenuData.y}px`,
                left: `${fileContextMenuData.x}px`
            }}
        >
            <ul>
                <li onClick={() => {openFile()}}>Open</li>
                <li onClick={() => {rename()}}>Rename</li>
                <li onClick={() => {deleteEntry(true)}}>Delete</li>
                <li onClick={() => {transferFile()}}>Transfer</li>
                <li onClick={() => {transferSelected()}}>Transfer Selected</li>
            </ul>
        </div>
    )
}

export default FileContextMenu;