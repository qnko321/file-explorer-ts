interface DirectoryWindowContextMenuProps {
    currentPath: string,
    displayDirectoryWindowContextMenu: boolean,
    directoryWindowContextMenuData: {x: string, y: string},
    handleNewFolderClick: () => void,
    handleNewFileClick: () => void,
    openPowerShell: () => void,
    refresh: () => void,
}

const DirectoryWindowContextMenu: React.FC<DirectoryWindowContextMenuProps> = ({currentPath, displayDirectoryWindowContextMenu, directoryWindowContextMenuData, handleNewFolderClick, handleNewFileClick, openPowerShell, refresh}) => {
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
                    (<li key="refresh" onClick={() => {refresh()}}>Refresh</li>),
                    (<li key="new-folder" onClick={() => {handleNewFolderClick()}}>New Folder</li>),
                    (<li key="new-file" onClick={() => {handleNewFileClick()}}>New File</li>),
                    (<li key="open-power-shell" onClick={() => {openPowerShell()}}>Open Powershell Here</li>)
                ] : <li className="not-hoverable">No actions here</li>}
            </ul>
        </div>
    )
}

export default DirectoryWindowContextMenu;