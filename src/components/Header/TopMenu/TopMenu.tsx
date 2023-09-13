import FileTransferButton from "./FileTransferButton/FileTransferButton";
import TopMenuButton from "./TopMenuButton";

const TopMenu: React.FC = () => {
    return (
        <div className="top-menu">
            <TopMenuButton title="Global Search" onClick={() => console.log("qnko")}/>
            <FileTransferButton/>
        </div>
    )
}

export default TopMenu;