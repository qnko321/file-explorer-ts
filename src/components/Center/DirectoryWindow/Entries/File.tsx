import { invoke } from "@tauri-apps/api";
import { selectEntry } from "../../../../slices/tabsSlice";
import { useDispatch } from "react-redux";

interface FileProps {
    name: string,
    path: string,
    index: number,
    isSelected: boolean,
}

const File: React.FC<FileProps> = ({name, path, index, isSelected}) => {
    const dispatch = useDispatch();

    const handleOpenFile = () => {
        invoke("open_file", {path});
    }

    return (
        <div className={"file entry" + (isSelected ? " selected" : "")} onDoubleClick={handleOpenFile} onClick={() => dispatch(selectEntry({index, path, isDir: false}))}>
            <img src="./file.svg"/>
            <h5 title={name} className="name">{name}</h5>
        </div>
    );
}

export default File;