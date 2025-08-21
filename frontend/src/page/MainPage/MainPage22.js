
import React, { useEffect, useRef, useState } from 'react';
import './MainPage22.css'

const App = () => {
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [isQuestStarted, setIsQuestStarted] = useState(false);

    const tourismRoutes = [
        {
            id: 'jomunguk',
            title: '조문국 역사 탐방',
            description: '의성역에서 시작하는 천년 여행, 조문국의 비밀을 향해',
            iconBgClass: 'icon-circle light-blue',
            iconPath: 'M13.5 6a.5.5 0 11-1 0 .5.5 0 011 0zM12 2a10 10 0 100 20 10 10 0 000-20zM12 11a1 1 0 10-2 0v2l2 2 2-2v-2a1 1 0 10-2 0z',
            quests: [
                { title: '의성역', subtitle: '역광장 포토존 인증샷 미션', status: 'completed' },
                { title: '조문국', subtitle: '가장 높지만 낮은 길 미션', status: 'ongoing' },
                { title: '고운사', subtitle: '고운사 상징물 3개 업로드 미션', status: 'locked' },
                { title: '사천마을', subtitle: '마을 벽화 속 동물과 사진 찍기 미션', status: 'locked' },
                { title: '여행의 마지막 페이지', subtitle: '모든 퀘스트를 완료하고 최종 보상 획득!', status: 'locked' },
            ]
        },
        {
            id: 'sanchoon-story',
            title: '의성 산수유마을',
            description: '노란 물결이 넘실대는 아름다운 산수유 마을 탐방',
            iconBgClass: 'icon-circle yellow',
            iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
            quests: [
                { title: '산수유 마을 입구', subtitle: '인증샷 찍기', status: 'ongoing' },
                { title: '화전 체험', subtitle: '산수유 화전 만들기', status: 'locked' },
                { title: '마을 장터', subtitle: '특산물 구매', status: 'locked' },
            ]
        },
        {
            id: 'festival-gabaek',
            title: '의성 마늘 축제',
            description: '풍요로운 의성 마늘 축제를 즐기고 포인트를 얻으세요!',
            iconBgClass: 'icon-circle green',
            iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
            quests: [
                { title: '축제장 입구', subtitle: 'QR 스캔 후 입장', status: 'completed' },
                { title: '마늘 요리 체험', subtitle: '의성 마늘로 요리하기', status: 'completed' },
                { title: '마늘 굿즈 부스', subtitle: '한정판 굿즈 구매', status: 'ongoing' },
                { title: '폐막식 참여', subtitle: '폐막식 참여 인증', status: 'locked' },
            ]
        },
        {
            id: 'historic-churches',
            title: '의성 100년 교회 역사 탐방',
            description: '광복과 6.25의 흔적을 간직한 의성의 오래된 교회를 찾아가는 여정',
            iconBgClass: 'icon-circle red',
            iconPath: 'M12 2L2 7h20L12 2zM2 9v11h7V9H2zm13 0v11h7V9h-7z',
            quests: [
                { title: '삼산교회', subtitle: '100년 넘은 의성 최초의 교회 탐방', status: 'ongoing' },
                { title: '안평교회', subtitle: '6.25 전쟁 당시 피난민을 품은 장소', status: 'locked' },
                { title: '비안교회', subtitle: '광복 후 의성 지역 신앙 공동체의 중심', status: 'locked' },
                { title: '최종 미션', subtitle: '교회들의 역사 사진을 업로드하고 스토리를 공유하기', status: 'locked' },
            ]
        },
    ];

    const handleStartQuest = () => {
        setIsQuestStarted(true);
    };

    const handleBack = () => {
        setIsQuestStarted(false);
        setSelectedRoute(null);
    };

    return (
        <div className="main-container">
            {/* Header */}
            <header className="header">
                <h1 className="logo">의성 여행</h1>
                <div className="header-icons">
                    <div className="icon-wrapper">
                        {/* Notification Bell Icon */}
                        <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L14 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clipRule="evenodd" fillRule="evenodd"></path>
                        </svg>
                        <span className="notification-dot"></span>
                    </div>
                    <div className="profile">
                        <img className="profile-img" src="https://placehold.co/40x40/6B7280/FFFFFF?text=P" alt="Profile Picture" />
                        <span className="profile-name">박형석</span>
                    </div>
                </div>
            </header>

            {/* User Info & Points Section */}
            <section className="user-info-section">
                <div className="user-info-content">
                    <div className="user-details">
                        <div className="user-avatar-wrapper">
                            {/* User Avatar Icon */}
                            <svg className="avatar-icon" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                        </svg>
                            <span className="level-badge">마늘</span>
                        </div>
                        <div className="user-info-text">
                            <h2>박형석</h2>
                            <p>마지막 접속: 2025-08-05</p>
                        </div>
                    </div>
                    <div className="points-summary">
                        <div className="point-item">
                            <span>총 포인트</span>
                            <span className="current-points">3,000 P</span>
                        </div>
                        <div className="point-item">
                            <span>총 사용 금액</span>
                            <span className="total-spending">5,600 원</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="main-content-grid">
                {/* Left Side - Mission & Route Selection */}
                <div className="left-panel">
                    {selectedRoute && !isQuestStarted ? (
                        <>
                            {/* Display quests for the selected route */}
                            <section className="mission-section">
                                <div className="section-header">
                                    <h3>{selectedRoute.title}</h3>
                                    <button onClick={handleBack} className="back-button">← 뒤로가기</button>
                                </div>
                                <div className="mission-grid">
                                    {selectedRoute.quests.map((quest, index) => (
                                        <QuestCard 
                                            key={index}
                                            title={quest.title} 
                                            description={quest.subtitle} 
                                            iconBgClass={selectedRoute.iconBgClass} 
                                            iconPath={selectedRoute.iconPath} 
                                            status={quest.status}
                                        />
                                    ))}
                                </div>
                                <button onClick={handleStartQuest} className="start-button">퀘스트 시작하기</button>
                            </section>
                        </>
                    ) : (
                        <>
                            {/* Online Missions Section */}
                            <section className="mission-section">
                                <div className="section-header">
                                    <h3>온라인 미션</h3>
                                    <a href="#">더보기 →</a>
                                </div>
                                <div className="mission-grid">
                                    {/* Daily Quiz Card */}
                                    <MissionCard 
                                        title="데일리 퀴즈" 
                                        description="오늘의 퀴즈에 도전하고 포인트를 받으세요!" 
                                        iconBgClass="icon-circle yellow" 
                                        iconPath="M8.228 9.228a1.5 1.5 0 012.121 0l4.243 4.243a1.5 1.5 0 010 2.121l-4.243 4.243a1.5 1.5 0 01-2.121 0l-4.243-4.243a1.5 1.5 0 010-2.121L8.228 9.228z" 
                                        footerText="08:56:30"
                                    />
                                    {/* SNS Promotion Card */}
                                    <MissionCard 
                                        title="SNS 홍보" 
                                        description="의성 여행을 친구에게 공유하고 포인트를 얻으세요!" 
                                        iconBgClass="icon-circle blue" 
                                        iconPath="M4 16h16M4 8h16m-5 8v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2m0-8h16"
                                    />
                                    {/* Survey Card */}
                                    <MissionCard 
                                        title="설문조사" 
                                        description="간단한 설문에 참여하고 추가 포인트를 받으세요!" 
                                        iconBgClass="icon-circle purple" 
                                        iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9v2m-3-3h6M13 5v2m-3-3h6"
                                    />
                                </div>
                            </section>

                            {/* Offline Route Selection Section */}
                            <section className="mission-section">
                                <div className="section-header">
                                    <h3>퀘스트 루트 선택</h3>
                                    <a href="#">더보기 →</a>
                                </div>
                                <div className="mission-grid">
                                    {tourismRoutes.map((route) => (
                                        <RouteCard
                                            key={route.id}
                                            title={route.title}
                                            description={route.description}
                                            iconBgClass={route.iconBgClass}
                                            iconPath={route.iconPath}
                                            onClick={() => setSelectedRoute(route)}
                                        />
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </div>

                {/* Right Side - Quest Progress & Map */}
                <div className="right-panel">
                    {/* Current Quest Progress */}
                    <section className="quest-progress-section">
                        <div className="section-header">
                            <h3>{isQuestStarted && selectedRoute ? '진행 중인 퀘스트' : '현재 진행 중인 퀘스트'}</h3>
                        </div>
                        <ul className="quest-list">
                            {isQuestStarted && selectedRoute ? (
                                selectedRoute.quests.map((quest, index) => (
                                    <QuestProgressItem 
                                        key={index}
                                        title={quest.title} 
                                        subtitle={quest.subtitle} 
                                        status={quest.status}
                                    />
                                ))
                            ) : (
                                <>
                                    <li className="quest-item locked">
                                        <div className="quest-status locked">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                                            </svg>
                                        </div>
                                        <div className="quest-details">
                                            <h4>퀘스트 루트를 선택해주세요</h4>
                                            <p>오프라인 퀘스트를 시작할 수 있습니다.</p>
                                        </div>
                                    </li>
                                </>
                            )}
                        </ul>
                    </section>
                    
                </div>
            </div>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2025 Uiseong Tourism. All rights reserved.</p>
            </footer>

        </div>
    );
};

// Mission Card Component
const MissionCard = ({ title, description, iconBgClass, iconPath, footerText }) => {
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
                {footerText && <span className="time-left">{footerText}</span>}
                <a href="#" className="participate-link">참여하기</a>
            </div>
        </div>
    );
};

// Route Card Component
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

// Quest Progress Item Component
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
            </div>
        </li>
    );
};


export default App;
