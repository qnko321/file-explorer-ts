import { useConfirmationManager } from "./useConfirmationManager";

const ConfirmationManager: React.FC = () => {
    const {
        displayWindow
    } = useConfirmationManager();

    if (displayWindow !== undefined) {
        return (
            <div className="confirmation-manager"
                style={{
                    color:"white",
                }}
            >
                {displayWindow}
            </div>
        )
    } else {
        return (
            <>
            </>
        )
    }
}

export default ConfirmationManager;