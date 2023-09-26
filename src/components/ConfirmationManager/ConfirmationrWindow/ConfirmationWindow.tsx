import { emit } from "@tauri-apps/api/event";

interface ConfirmationWindowProps {
    uuid: any,
    title: string | undefined,
    message: string| object,
    close: any,
    ok: boolean,
    cancel: boolean,
    yes: boolean,
    no: boolean,
}

enum ConfirmationValue {
    Cancel = 0,
    Ok = 1,
    No = 2,
    Yes = 3,
}

const ConfirmationWindow: React.FC<ConfirmationWindowProps> = ({uuid, message, title, close, ok, cancel, yes, no}) => {
    const answer = (result: ConfirmationValue) => {
        emit(`confirmation-${uuid}`, {
            result,
        });
        close();
    }

    return (
        <div className="confirmation-window">
            <div className="top">
                <div className="title">
                    {title}
                </div>
            </div>
            <div className="error">
                {message instanceof Object ? JSON.stringify(message) : message}
            </div>
            <div className="buttons">
                {cancel && (
                    <div className="button negative" onClick={() => answer(ConfirmationValue.Cancel)}>Cancel</div>
                )}

                {no && (
                    <div className="button negative" onClick={() => answer(ConfirmationValue.No)}>No</div>
                )}

                {ok && (
                    <div className="button positive" onClick={() => answer(ConfirmationValue.Ok)}>Ok</div>
                )}

                {yes && (
                    <div className="button positive" onClick={() => answer(ConfirmationValue.Yes)}>Yes</div>
                )}
            </div>
        </div>
    )
}

export default ConfirmationWindow;

export {
    ConfirmationValue,
}