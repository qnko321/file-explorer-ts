interface ErrorWindowProps {
    error: string,
    title: string | undefined,
    close: any,
}

const ErrorWindow: React.FC<ErrorWindowProps> = ({error, title, close}) => {
    return (
        <div className="error-window">
            <div className="top">
                <div className="title">
                    {title}
                </div>
                <img className="close-icon-button" src="X.svg" onClick={() => close()}/>
            </div>
            <div className="error">
                {/* @ts-ignore */}
                {error instanceof Object ? JSON.stringify(error) : error}
            </div>
        </div>
    )
}

export default ErrorWindow;