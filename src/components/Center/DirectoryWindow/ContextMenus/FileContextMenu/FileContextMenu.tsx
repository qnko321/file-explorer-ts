interface FolderContextMenuProps {
    displayFileContextMenu: boolean,
    fileContextMenuData: {x: string, y: string, path: string},
    transferFile: () => void,
    transferSelected: () => void,
}

const FileContextMenu: React.FC<FolderContextMenuProps> = ({displayFileContextMenu, fileContextMenuData, transferFile, transferSelected}) => {
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
                <li onClick={() => {transferFile()}}>Transfer</li>
                <li onClick={() => {transferSelected()}}>Transfer Selected</li>
            </ul>
        </div>
    )
}

export default FileContextMenu;