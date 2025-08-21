const QuestProgressItem = ({ title, subtitle, status }) => {
    let statusClass = '';
    let statusIcon = null;

    if (status === 'completed') {
        statusClass = 'completed';
        statusIcon = (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
            </svg>
        );
    } else if (status === 'ongoing') {
        statusClass = 'ongoing';
        statusIcon = (<span>2</span>);
    } else {
        statusClass = 'locked';
        statusIcon = (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
            </svg>
        );
    }

    return (
        <li className={`quest-item ${statusClass}`}>
            <div className={`quest-status ${statusClass}`}>
                {statusIcon}
            </div>
            <div className="quest-details">
                <h4 className={status === 'ongoing' ? 'ongoing-title' : ''}>{title}</h4>
                <p>{subtitle}</p>
                <p className="distance-info">다음 퀘스트까지 거리: 1.2km | 약 15분</p>
            </div>
        </li>
    );
};

export default QuestProgressItem