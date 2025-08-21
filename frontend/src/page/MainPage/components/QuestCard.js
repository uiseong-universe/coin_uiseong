// Quest Card Component
const QuestCard = ({ title, description, iconBgClass, iconPath, status }) => {
    const isLocked = status === '잠금';
    return (
        <div className="mission-card">
            <div className={iconBgClass}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath}></path>
                </svg>
            </div>
            <h4>{title}</h4>
            <p>{description}</p>
            <div className="mission-card-footer">
                <span className="status-text">{status}</span>
                <a href="#" className={`qr-link ${isLocked ? 'locked-link' : ''}`}>
                    {isLocked ? '잠금' : 'QR 스캔'}
                </a>
            </div>
        </div>
    );
};

export default QuestCard
