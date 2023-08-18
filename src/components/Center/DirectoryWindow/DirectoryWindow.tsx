import { useState } from "react";
import CurrentPathDisplay from "./CurrentPathDisplay/CurrentPathDisplay";
import Directory from "./Entries/Directory";
import File from "./Entries/File";
import NewFolderTemplate from "./NewEntries/NewFolderTemplate";
import SearchBox from "./SearchBox/SearchBox";
import Tab from "./Tab/Tab";
import useDirectoryWindow from "./useDirectoryWIndow";

const DirectoryWindow: React.FC = () => {
    const {
        tabs,
        getEntries,
        openTabContextMenu,
        displayTabContextMenu,
        tabContextMenuData,
        closeTab,
        openFolderContextMenu,
        displayFolderContextMenu,
        folderContextMenuData,
        openDirectoryInNewTab,
        searchForInEntries,
        openDirectoryWindowContextMenu,
        directoryWindowContextMenuData,
        displayDirectoryWindowContextMenu,
        createNewFolder,
        handleNewFolderClick,
        isCreatingNewFolder,
        openPowerShell,
    } = useDirectoryWindow();

    const [refreshCount, setRefreshCount] = useState(0);

    const refreshComponent = () => {
        setRefreshCount(prevRefreshCount => prevRefreshCount + 1);
    };

    return (
        <div 
            className="directory-window"
            onContextMenu={(e) => openDirectoryWindowContextMenu(e)}
        >
            <div style={{
                color: "white"
            }}>
                {JSON.stringify(tabs)}
            </div>
            <div className="tabs-container">
                {
                    tabs.data.map((tab, index) => (
                        <Tab 
                            key={index} 
                            title={tab.title} 
                            index={index}
                            isSelected={index === tabs.currentTabIndex}
                            openContextMenu={openTabContextMenu}
                        />
                    ))
                }
            </div>
            <div className="under-tabs-controls">
                {(tabs.currentTabIndex > -1) && <CurrentPathDisplay path={tabs.data[tabs.currentTabIndex].path}/>}
                {(tabs.currentTabIndex > -1) && <SearchBox searchFor={tabs.data[tabs.currentTabIndex].searchFor}/>}
            </div>
            <div className="entries-container">
                {
                    tabs.data[tabs.currentTabIndex] && searchForInEntries(tabs.data[tabs.currentTabIndex].path, tabs.data[tabs.currentTabIndex].searchFor).map((entry, index) => (
                        entry.is_dir ? 
                        <Directory 
                            key={index}
                            name={entry.name}
                            path={entry.path}
                            openContextMenu={openFolderContextMenu}
                            index={index}
                            isSelected={tabs.data[tabs.currentTabIndex].selectedEntries.includes(index)}
                        />
                        :
                        <File
                            key={index}
                            name={entry.name}
                            path={entry.path}
                            index={index}
                            isSelected={tabs.data[tabs.currentTabIndex].selectedEntries.includes(index)}
                        />
                    ))
                }
                {(isCreatingNewFolder && tabs.data[tabs.currentTabIndex].path !== "drives") && <NewFolderTemplate create={createNewFolder}/>}
            </div>
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
                </ul>
            </div>
            <div 
                className="context-menu"
                style={{
                    display: displayDirectoryWindowContextMenu ? "inline" : "none",
                    top: `${directoryWindowContextMenuData.y}px`,
                    left: `${directoryWindowContextMenuData.x}px`
                }}
            >
                <ul>
                    <li onClick={() => {handleNewFolderClick()}}>New Folder</li>
                    <li onClick={() => {openPowerShell()}}>Open Powershell Here</li>
                </ul>
            </div>
        </div>
    )
}

export default DirectoryWindow;