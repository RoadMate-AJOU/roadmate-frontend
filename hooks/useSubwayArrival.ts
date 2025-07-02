// src/api/subway.ts
export const fetchSubwayArrival = async (stationName: string) => {
    const API_KEY = 'cc66485a4b486d696e3930707042666d';
    const url = `http://swopenapi.seoul.go.kr/api/subway/${API_KEY}/json/realtimeStationArrival/0/5/${encodeURIComponent(stationName)}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.errorMessage) {
        console.error('❌ API 오류:', data.errorMessage.message);
        return null;
      }
  
      return data.realtimeArrivalList;
    } catch (error) {
      console.error('❌ 요청 실패:', error);
      return null;
    }
  };
  