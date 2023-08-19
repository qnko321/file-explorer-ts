interface DirectoryWindowContextMenuProps {
    currentPath: string,
    displayDirectoryWindowContextMenu: boolean,
    directoryWindowContextMenuData: {x: string, y: string},
    handleNewFolderClick: () => void,
    handleNewFileClick: () => void,
    openPowerShell: () => void,
}

const DirectoryWindowContextMenu: React.FC<DirectoryWindowContextMenuProps> = ({currentPath, displayDirectoryWindowContextMenu, directoryWindowContextMenuData, handleNewFolderClick, handleNewFileClick, openPowerShell}) => {
    return (
        <div 
            className="context-menu"
            style={{
                display: displayDirectoryWindowContextMenu ? "inline" : "none",
                top: `${directoryWindowContextMenuData.y}px`,
                left: `${directoryWindowContextMenuData.x}px`
            }}
        >
            <ul>
                {currentPath !== "drives" ? [
                    (<li onClick={() => {handleNewFolderClick()}}>New Folder</li>),
                    (<li onClick={() => {handleNewFileClick()}}>New File</li>),
                    (<li onClick={() => {openPowerShell()}}>Open Powershell Here</li>)
                ] : <li className="not-hoverable">No actions here</li>}
            </ul>
        </div>
    )
}

export default DirectoryWindowContextMenu;