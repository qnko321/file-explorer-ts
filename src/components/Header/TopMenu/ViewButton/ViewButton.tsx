import { useEffect, useState } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import ViewMode from "../../../Center/DirectoryWindow/EntriesDisplay/ViewMode";

const ViewButton: React.FC = () => {
    const [displayMenu, setDisplayMenu] = useState<boolean>(false);

    useEffect(() => {
        listen("close-context-menu", (event) => {
            //@ts-ignore
            if (event.payload.menu != "view-menu") {
                setDisplayMenu(false);
            }
        });
    }, []);

    const toggleViewMenu = (e) => {
        e.stopPropagation();
        emit('close-context-menu', {
            menu: "view-menu",
        });
        setDisplayMenu(prevState => !prevState);
    }

    const selectDetailsView = () => {
        emit("set-view-mode", {
            mode: ViewMode.Details
        });
        setDisplayMenu(false);
    }

    const selectLargeIconsView = () => {
        emit("set-view-mode", {
            mode: ViewMode.LargeIcons
        });
        setDisplayMenu(false);
    }

    const handleMenuClick = (e) => {
        e.stopPropagation();
    }

    return (
        <div className="top-menu-button" onClick={toggleViewMenu} title="Details">
            <h4 className="title">View</h4>
            <div 
                className="view-menu" 
                style={{
                    display: displayMenu ? "flex" : "none"
                }}
                onClick={handleMenuClick}
            >
                <div className="icon" onClick={selectDetailsView}>
                    <img src="details-file-view.svg"/>
                </div>
                <div className="icon" onClick={selectLargeIconsView} title="Large Icons">
                    <img src="large-icons-file-view.svg"/>
                </div>
            </div>
        </div>
    )
}

export default ViewButton;