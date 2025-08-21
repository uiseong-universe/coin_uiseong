// 여러 유저 정보를 담은 mock 데이터
const mockUsers = [
  {
    //우리가 제공해야하는 데이터
    username: "박형석", // 유저 닉네임
    lastLogin: "2025-08-05", // 마지막 로그인 날짜
    createdAt: "2025-07-01", // 계정 생성일
    updatedAt: "2025-08-05", // 계정 정보 마지막 갱신일
    rank: "마늘", // 유저 등급 또는 타이틀 F
    point: 3000, // 앱 내 일반 포인트
    monthlyEarned: 1000, // 이번 달 획득 포인트
    monthlyUsed: 500, // 이번 달 사용 포인트
    totalExchanged: 5600, // 총 교환·출금한 포인트
    sns_share: false, // 인스타그램 인증 여부 (1회 미션)
    survey: true, // 설문조사 참여 여부 (1회 미션)
    daily_quiz: false, // 데일리 퀴즈 참여 여부
    mini_game: true, // 데일리 미니게임 참여 여부

    // Wepin 을 통해 제공받는 데이터
    email: "user@example.com", // 유저 이메일 (로그인·연락·식별용)
    userId: "wepin-user-12345", // Wepin에서 발급한 고유 유저 식별자
    walletId: "wallet-abcde12345", // Wepin 지갑 고유 ID
    address: "0xabc123...", // 지갑 블록체인 주소
    SVTPoint: 150 // Wepin 지갑에 보유 중인 포인트(토큰)
  },
  {
    address: '0xdef456',
    username: "김의성",
    lastLogin: "2025-08-01",
    rank: "사과",
    point: 4200,
    SVTPoint: 220,
    monthlyEarned: 1500,
    monthlyUsed: 700,
    totalExchanged: 6200,
    sns_share: false, // 인스타 인증 여부
    survey: true, // 설문조사 참여 여부
    daily_quiz: false, // 데일리 퀴즈 미션 여부
    mini_game: true // 데일리 미니게임 미션 여부
  }
];

// 주소를 기반으로 유저 정보 반환
export const getUserInfoByAddress = (address) => {
  return mockUsers.find((user) => user.address === address) || null;
};

// 한번 인증하고 그 이후 인증안해두 되는 것들
export const oneTimeMissionStatus = {
  sns_share: false, // 인스타 인증 여부
  survey: true // 설문조사 참여 여부
};
// 하루 한번씩 인증해줘야 하는 목록
// 시간 00:00기준 초기화
export const dailyMissionStatus = {
  daily_quiz: false, // 데일리 퀴즈 미션 여부
  mini_game: true // 데일리 미니게임 미션 여부
};