import { useEffect } from "react";
import DirectoryWindow from "./DirectoryWindow/DirectoryWindow";
import Explorer from "./Explorer/Explorer";
import { useDispatch } from "react-redux";
import { create } from "../../slices/tabsSlice";

const Center: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(create({path: undefined}));
    }, []);
    
    return (
        <div id="center">
            <Explorer/>
            <DirectoryWindow/>
        </div>
    )
}

export default Center;