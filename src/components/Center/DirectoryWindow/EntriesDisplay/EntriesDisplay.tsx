import { Entry } from "../../../../intefaces/Entry"
import useDisplayEntries, { ViewMode } from "./useEntriesDisplay";
import LargeIconNewFolderTemplate from "./NewEntries/LargeIcons/LargeIconNewFolderTemplate";
import LargeIconNewFileTemplate from "./NewEntries/LargeIcons/LargeIconNewFileTemplate";

interface EntriesDisplayProps {
    tabsData: any,
    openFileContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, path: string, name: string) => void, 
    openFolderContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, path: string) => void,
    searchForInEntries: (path: string, searchFor: string) => Entry[],
    isCreatingNewFolder: boolean,
    createNewFolder: (name: string) => void,
    isCreatingNewFile: boolean,
    createNewFile: (name: string) => void,
}

const EntriesDisplay: React.FC<EntriesDisplayProps> = ({tabsData, openFileContextMenu, openFolderContextMenu, searchForInEntries, isCreatingNewFile, isCreatingNewFolder, createNewFile, createNewFolder}) => {    
    const {
        elements,
        newEntryElements,
        containerClass,
        viewMode
    } = useDisplayEntries(tabsData, searchForInEntries, openFileContextMenu, openFolderContextMenu, isCreatingNewFile, isCreatingNewFolder, createNewFile, createNewFolder);
    
    return (
        <div className="wrapper">
            {
                viewMode == ViewMode.Details && (
                    <div className={"headers"}>
                        <img src="header-img.svg"/>
                        {/* <div className="icon"/> */}
                        <h5 className="name">Name</h5>
                        <h5 className="size">Size</h5>
                        <h5 className="last-modified">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Last Modified&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h5>
                        <h5 className="created">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Created&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h5>
                    </div>
                )
            }
            <div className={containerClass}>
                {elements}
                {newEntryElements}
            </div>
        </div>
        
    );
}

export default EntriesDisplay;