import useErrorManager from "./useErrorManager";

const ErrorManager: React.FC = () => {
    const {
        displayWindow
    } = useErrorManager();

    if (displayWindow !== undefined) {
        return (
            <div className="error-manager"
            style={{
                color:"white",
            }}>
                {displayWindow}
            </div>
        )
    } else {
        return (
            <div>
            </div>
        )
    }
}

export default ErrorManager;