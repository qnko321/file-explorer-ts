import { useDispatch } from "react-redux";
import { open, selectEntry } from "../../../../slices/tabsSlice";

interface DirectoryProps {
    name: string,
    path: string,
    openContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, path: string) => void,
    index: number,
    isSelected: boolean,
}

const  Directory: React.FC<DirectoryProps> = ({name, path, openContextMenu, index, isSelected}) => {
    const dispatch = useDispatch();

    return (
        <div 
            className={"directory entry" + (isSelected ? " selected" : "")}
            onDoubleClick={() => dispatch(open({path, newTab: false}))}
            onClick={() => dispatch(selectEntry(index))}
            onContextMenu={(e) => openContextMenu(e, path)}>
            <img src="./folder.svg"/>
            <h5 title={name} className="name">{name}</h5>
        </div>
    );
}

export default Directory;