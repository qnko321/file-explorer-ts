import { useState } from "react";
import CurrentPathDisplay from "./CurrentPathDisplay/CurrentPathDisplay";
import Directory from "./Entries/Directory";
import File from "./Entries/File";
import NewFolderTemplate from "./NewEntries/NewFolderTemplate";
import SearchBox from "./SearchBox/SearchBox";
import Tab from "./Tab/Tab";
import useDirectoryWindow from "./useDirectoryWIndow";
import useFolderContextMenu from "./ContextMenus/FolderContextMenu/useFolderContextMenu";
import FolderContextMenu from "./ContextMenus/FolderContextMenu/FolderContextMenu";
import useDirectoryWindowContextMenu from "./ContextMenus/DirectoryWindowContextMenu/useDirectoryWindowContextMenu";
import DirectoryWindowContextMenu from "./ContextMenus/DirectoryWindowContextMenu/DirectoryWindowMenu";
import TabContextMenu from "./ContextMenus/TabContextMenu/TabContextMenu";
import useTabContextMenu from "./ContextMenus/TabContextMenu/useTabContextMenu";
import NewFileTemplate from "./NewEntries/NewFileTemplate";

const DirectoryWindow: React.FC = () => {
    const {
        tabs,
        currentPath,
        searchForInEntries,
        createNewFolder,
        createNewFile,
        handleNewFolderClick,
        isCreatingNewFolder,
        handleNewFileClick,
        isCreatingNewFile,
        openPowerShell,
    } = useDirectoryWindow();

    const {
        displayFolderContextMenu,
        folderContextMenuData,
        openDirectoryInNewTab,
        openFolderContextMenu
    } = useFolderContextMenu();
    
    const {
        openDirectoryWindowContextMenu,
        directoryWindowContextMenuData,
        displayDirectoryWindowContextMenu,
    } = useDirectoryWindowContextMenu();

    const {
        displayTabContextMenu,
        tabContextMenuData,
        closeTab,
        openTabContextMenu
    } = useTabContextMenu();

    return (
        <div 
            className="directory-window"
            onContextMenu={(e) => openDirectoryWindowContextMenu(e)}
        >
            <div style={{
                color: "white",
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
                            isSelected={tabs.data[tabs.currentTabIndex].selectedEntries.some((entry, _) => entry.index === index)}
                        />
                        :
                        <File
                            key={index}
                            name={entry.name}
                            path={entry.path}
                            index={index}
                            isSelected={tabs.data[tabs.currentTabIndex].selectedEntries.some((entry, _) => entry.index === index)}
                        />
                    ))
                }
                {(isCreatingNewFolder && tabs.data[tabs.currentTabIndex].path !== "drives") && <NewFolderTemplate create={createNewFolder}/>}
                {(isCreatingNewFile && tabs.data[tabs.currentTabIndex].path !== "drives") && <NewFileTemplate create={createNewFile}/>}
            </div>
            <TabContextMenu 
                displayTabContextMenu={displayTabContextMenu}
                tabContextMenuData={tabContextMenuData}
                closeTab={closeTab}
            />
            <FolderContextMenu 
                displayFolderContextMenu={displayFolderContextMenu} 
                folderContextMenuData={folderContextMenuData}
                openDirectoryInNewTab={openDirectoryInNewTab}
            />
            <DirectoryWindowContextMenu 
                displayDirectoryWindowContextMenu={displayDirectoryWindowContextMenu} 
                directoryWindowContextMenuData={directoryWindowContextMenuData} 
                handleNewFolderClick={handleNewFolderClick} 
                handleNewFileClick={handleNewFileClick} 
                openPowerShell={openPowerShell}
                currentPath={currentPath}
            />
        </div>
    )
}

export default DirectoryWindow;