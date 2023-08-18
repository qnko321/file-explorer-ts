import { useDispatch } from "react-redux";
import { navigateBack, navigateForward } from "../../../slices/tabsSlice";
import { useEffect } from "react";

const TabDirectoryNavigator: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const handleMouseDown = (event) => {
            switch (event.button) {
                case 3:
                    goBack();
                    break;
                case 4:
                    goForward();
                    break;
            }
        }

        window.addEventListener('mousedown', handleMouseDown);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
        }
    }, []);

    const goBack = () => {
        dispatch(navigateBack());
    }

    const goForward = () => {
        dispatch(navigateForward());
    }

    return (
        <div className="navigator">
            <div className="controls">
                <img src="./left-arrow.svg" onClick={goBack}/>
                <div className="seperator"/>
                <img src="./right-arrow.svg" onClick={goForward}/>
            </div>
        </div>
    )
}

export default TabDirectoryNavigator;