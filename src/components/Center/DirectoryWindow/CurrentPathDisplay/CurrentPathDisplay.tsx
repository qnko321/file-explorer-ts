interface CurrentPathDisplayProps {
    path: string
}  

const CurrentPathDisplay: React.FC<CurrentPathDisplayProps> = ({path}) => {
    return (
        <div className="current-path-display">
            <h4>{path}</h4>
        </div>
    )
}

export default CurrentPathDisplay;