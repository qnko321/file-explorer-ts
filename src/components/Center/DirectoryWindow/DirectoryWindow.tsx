import CurrentPathDisplay from "./CurrentPathDisplay/CurrentPathDisplay";
import SearchBox from "./SearchBox/SearchBox";
import Tab from "./Tab/Tab";
import useDirectoryWindow from "./useDirectoryWIndow";
import useFolderContextMenu from "./ContextMenus/FolderContextMenu/useFolderContextMenu";
import FolderContextMenu from "./ContextMenus/FolderContextMenu/FolderContextMenu";
import useDirectoryWindowContextMenu from "./ContextMenus/DirectoryWindowContextMenu/useDirectoryWindowContextMenu";
import DirectoryWindowContextMenu from "./ContextMenus/DirectoryWindowContextMenu/DirectoryWindowMenu";
import TabContextMenu from "./ContextMenus/TabContextMenu/TabContextMenu";
import useTabContextMenu from "./ContextMenus/TabContextMenu/useTabContextMenu";
import useFileContextMenu from "./ContextMenus/FileContextMenu/useFileContextMenu";
import FileContextMenu from "./ContextMenus/FileContextMenu/FileContextMenu";
import TransferProgressBarsContainer from "./TransferProgressBarsContainer/TransferProgressBarsContainer";
import EntriesDisplay from "./EntriesDisplay/EntriesDisplay";
import { useDispatch } from "react-redux";
import { refreshEntries } from "../../../slices/entriesSlice";

const DirectoryWindow: React.FC = () => {
    const {
        tabsState,
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
        refreshContent,
    } = useDirectoryWindow();

    const {
        displayFolderContextMenu,
        folderContextMenuData,
        openDirectoryInNewTab,
        openFolderContextMenu,
        transferFolder,
        open,
        deleteFolderEntry
    } = useFolderContextMenu(refreshContent);

    const {
        displayFileContextMenu,
        fileContextMenuData,
        openFileContextMenu,
        transferFile,
        openFile,
        rename,
        deleteFileEntry
    } = useFileContextMenu(refreshContent);
    
    const {
        openDirectoryWindowContextMenu,
        directoryWindowContextMenuData,
        displayDirectoryWindowContextMenu,
    } = useDirectoryWindowContextMenu();

    const {
        displayTabContextMenu,
        tabContextMenuData,
        closeTab,
        closeAllTabs,
        closeOthersTabs,
        closeTabsToTheLeft,
        closeTabsToTheRight,
        openTabContextMenu,
    } = useTabContextMenu();
    
    return (
        <div 
            className="directory-window"
            onContextMenu={(e) => openDirectoryWindowContextMenu(e)}
        >
            <div className="tabs-container">
                {
                    tabsState.data.map((tab, index) => (
                        <Tab 
                            key={index} 
                            title={tab.title} 
                            index={index}
                            isSelected={index === tabsState.currentTabIndex}
                            openContextMenu={openTabContextMenu}
                        />
                    ))
                }
            </div>
            <div className="under-tabs-controls">
                {(tabsState.currentTabIndex > -1) && <CurrentPathDisplay path={tabsState.data[tabsState.currentTabIndex].path}/>}
                {(tabsState.currentTabIndex > -1) && <SearchBox searchFor={tabsState.data[tabsState.currentTabIndex].searchFor}/>}
            </div>
            <EntriesDisplay
                openFileContextMenu={openFileContextMenu}
                openFolderContextMenu={openFolderContextMenu}
                isCreatingNewFile={isCreatingNewFile}
                isCreatingNewFolder={isCreatingNewFolder}
                createNewFile={createNewFile}
                createNewFolder={createNewFolder}
            />
            <TabContextMenu 
                displayTabContextMenu={displayTabContextMenu}
                tabContextMenuData={tabContextMenuData}
                closeTab={closeTab}
                closeAll={closeAllTabs}
                closeOthers={closeOthersTabs}
                closeTabsToTheLeft={closeTabsToTheLeft}
                closeTabsToTheRight={closeTabsToTheRight}
            />
            <FolderContextMenu 
                displayFolderContextMenu={displayFolderContextMenu} 
                folderContextMenuData={folderContextMenuData}
                openDirectoryInNewTab={openDirectoryInNewTab}
                transferFolder={transferFolder}
                transferSelected={transferSelected}
                open={open}
                rename={rename}
                deleteEntry={deleteFolderEntry}
            />
            <FileContextMenu 
                displayFileContextMenu={displayFileContextMenu} 
                fileContextMenuData={fileContextMenuData}
                transferFile={transferFile}
                transferSelected={transferSelected}
                openFile={openFile}
                rename={rename}
                deleteEntry={deleteFileEntry}
            />
            <DirectoryWindowContextMenu 
                displayDirectoryWindowContextMenu={displayDirectoryWindowContextMenu} 
                directoryWindowContextMenuData={directoryWindowContextMenuData} 
                handleNewFolderClick={handleNewFolderClick} 
                handleNewFileClick={handleNewFileClick} 
                openPowerShell={openPowerShell}
                currentPath={currentPath}
                refresh={refreshContent}
            />
            <TransferProgressBarsContainer/>
        </div>
    )
}

export default DirectoryWindow;