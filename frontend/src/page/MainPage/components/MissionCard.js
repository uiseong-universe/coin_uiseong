const MissionCard = ({ title, description, iconBgClass, iconPath, footerText, distance, duration, location }) => {
  return (
    <div className="mission-card">
      <div className={`icon ${iconBgClass}`}>
        <img src={iconPath} alt="아이콘" />
      </div>
      <div className="mission-content">
        <h3>{title}</h3>
        <p>{description}</p>
        {location && <p className="location-name">위치: {location}</p>}
        {distance && duration && (
          <p className="location-info">체험 장소까지 거리: {distance}km | 약 {duration}분</p>
        )}
        <p className="footer-text">{footerText}</p>
      </div>
    </div>
  );
};

export default MissionCard
