import { useDispatch } from "react-redux";
import { selectTab } from "../../../../slices/tabsSlice";

interface TabProps {
    title: string,
    index: number,
    isSelected: boolean,
    openContextMenu: (e:React.MouseEvent<HTMLDivElement, MouseEvent> , index: number) => void,
}

const Tab: React.FC<TabProps> = ({title, index, isSelected, openContextMenu}) => {
    const dispatch = useDispatch();

    return (
        <div 
            className="tab"
            onClick={() => dispatch(selectTab({index}))}
            onContextMenu={(e) => openContextMenu(e, index)}
        >
            <img src={isSelected ? './curve-left-selected.svg' : './curve-left.svg'}/>
            <h4 className={"title" + (isSelected ? " selected" : "")}>{title}</h4>
            <img src={isSelected ? './curve-right-selected.svg' : './curve-right.svg'}/>
        </div>
    )
}

export default Tab;