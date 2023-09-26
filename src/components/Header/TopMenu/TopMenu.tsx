import FileTransferButton from "./FileTransferButton/FileTransferButton";
import ViewButton from "./ViewButton/ViewButton";

const TopMenu: React.FC = () => {
    return (
        <div className="top-menu">
            <ViewButton/>
            <FileTransferButton/>
        </div>
    )
}

export default TopMenu;