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
import useFileContextMenu from "./ContextMenus/FileContextMenu/useFileContextMenu";
import FileContextMenu from "./ContextMenus/FileContextMenu/FileContextMenu";
import { useEffect } from "react";

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
        transferSelected,
    } = useDirectoryWindow();

    const {
        displayFolderContextMenu,
        folderContextMenuData,
        openDirectoryInNewTab,
        openFolderContextMenu,
        transferFolder
    } = useFolderContextMenu();

    const {
        displayFileContextMenu,
        fileContextMenuData,
        openFileContextMenu,
        transferFile,
    } = useFileContextMenu();
    
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

    useEffect(() => {
        
    }, []);

    return (
        <div 
            className="directory-window"
            onContextMenu={(e) => openDirectoryWindowContextMenu(e)}
        >
            <div style={{color: "white"}}>
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
                            openContextMenu={openFileContextMenu}
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
                transferFolder={transferFolder}
                transferSelected={transferSelected}
            />
            <FileContextMenu 
                displayFileContextMenu={displayFileContextMenu} 
                fileContextMenuData={fileContextMenuData}
                transferFile={transferFile}
                transferSelected={transferSelected}
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