// Route Card Componente
const RouteCard = ({ title, description, iconBgClass, iconPath, onClick }) => {
    return (
        <div className="mission-card" onClick={onClick}>
            <div className={iconBgClass}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath}></path>
                </svg>
            </div>
            <h4>{title}</h4>
            <p>{description}</p>
            <div className="mission-card-footer" style={{justifyContent: 'flex-end'}}>
                <a href="#" className="participate-link">선택하기</a>
            </div>
        </div>
    );
};
export default RouteCard