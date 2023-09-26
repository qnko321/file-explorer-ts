import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";

interface NewFileTemplateProps {
    create: (name: string) => void,
}

const DetailsNewFileTemplate: React.FC<NewFileTemplateProps> = ({create}) => {
    const [name, setName] = useState("New File");
    const nameRef = useRef(name);
    const nameInputRef = useRef();

    useEffect(() => {
        const unlisten = listen('close-context-menu', (event) => {
            create(nameRef.current);
        });

        nameInputRef.current.focus();
        nameInputRef.current.select();

        return () => {
            unlisten.then(f => f());
        }
    }, []);
    
    useEffect(() => {
        nameRef.current = name;
    }, [name]);

    const handleNameChange = (e) => {
        setName(e.target.value);
    }

    const handleOnKeyDown = (e) => {
        if (e.key == "/" ||
        e.key == "\\" ||
        e.key == ":" ||
        e.key == "*" ||
        e.key == "?" ||
        e.key == "\"" ||
        e.key == "<" ||
        e.key == ">" ||
        e.key == "|") {
            e.preventDefault();
        }

        if (e.keyCode === 13) {
            create(nameRef.current);
        } 
    }

    return (
        <div className={"file entry"}>
            <img src="./file.svg"/>
            <input 
                type="text" 
                ref={nameInputRef} 
                className="name-input" 
                value={name} 
                onChange={handleNameChange}
                onKeyDown={handleOnKeyDown}
                onClick={(e) => {e.stopPropagation()}}
            />
        </div>
    )
}

export default DetailsNewFileTemplate;