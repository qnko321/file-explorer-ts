interface TopMenuButtonProps {
    title: string,
    onClick: () => void;
}

const TopMenuButton: React.FC<TopMenuButtonProps> = ({title, onClick}) => {
    return (
        <div className="top-menu-button" onClick={onClick}>
            <h4 className="title">{title}</h4>
        </div>
    )
}

export default TopMenuButton;