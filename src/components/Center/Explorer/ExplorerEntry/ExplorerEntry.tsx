import { invoke } from "@tauri-apps/api/tauri";
import { MouseEventHandler, useState } from "react";
import { Entry } from "../../../../intefaces/Entry";
import { open } from "../../../../slices/tabsSlice";
import { useDispatch } from "react-redux";
import { emit } from "@tauri-apps/api/event";

const ExplorerEntry: React.FC<Entry> = ({name, path}) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [children, setChildren] = useState<Entry[]>([]);

    const dispatch = useDispatch();

    const onMouseEnter = () => {
        setIsHovered(true);
    }

    const onMouseLeave = () => {
        setIsHovered(false);
    }

    const handleExpandDirectoryClick: MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        if (isExpanded) {
            setIsExpanded(false);
            setChildren([]);
        } else {
            invoke('expand_directory', {
                path
            })
            .then(response => {
                setChildren(response as Entry[]);
                setIsExpanded(true);
            }).catch(error => {
                emit("display-error", {
                    error
                });
            });
        }
    }

    const handleOpenDirectoryClick: MouseEventHandler<HTMLDivElement> = () => {
        dispatch(open({
            path,
            newTab: true
        }))
    }

    return (
        <div className="entry">
            <div 
                className="self"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={handleOpenDirectoryClick}
                style={{
                    backgroundColor: isExpanded ? '#46494b' : '',
                }}
            >
                <div className={"expand-button"} onClick={handleExpandDirectoryClick}>
                    {(isHovered || isExpanded) && <img className={"expand-button-icon"} src={isExpanded ? "./down-arrow.svg" : "./right-arrow-clean.svg"}/>}
                </div>
                <h4 className="name">{name}</h4>
            </div>
            <div className="children">
                {
                    children.map((entry, index) => (
                        //@ts-ignore
                        <ExplorerEntry
                            key={index} 
                            name={entry.name} 
                            path={entry.path}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default ExplorerEntry;