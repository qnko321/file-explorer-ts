import TabDirectoryNavigator from "./TabDirectoryNavigator/TabDirectoryNavigator";
import TopMenu from "./TopMenu/TopMenu";

const Header: React.FC = () => {
    return (
        <div id="header">
            <TopMenu/>
            <TabDirectoryNavigator/>
        </div>
    )
}

export default Header;