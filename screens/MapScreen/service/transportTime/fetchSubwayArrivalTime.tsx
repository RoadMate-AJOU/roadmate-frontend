// screens/MapScreen/fetchSubwayArrivalTime.ts
import axios from 'axios';

const SERVICE_KEY = '5855694b456d696e363742504c4f63';

/**
 * 특정 역에서 지정된 호선(예: '3호선')의 가장 빠른 도착 시간 조회
 * @param stationName 역 이름 (예: '경복궁')
 * @param targetLineName 도착 정보를 필터링할 호선명 (예: '3호선')
 * @returns 가장 빠른 도착 시간 (단위: 분), 곧 도착이면 0, 실패 시 null
 */
export async function fetchSubwayArrivalTime(
  stationName: string,
  targetLineName: string
): Promise<number | null> {
  const URL = `http://swopenapi.seoul.go.kr/api/subway/${SERVICE_KEY}/xml/realtimeStationArrival/0/10/${encodeURIComponent(
    stationName
  )}`;

  try {
    const res = await axios.get(URL, { responseType: 'text' });

    const rows = [...res.data.matchAll(/<row>([\s\S]*?)<\/row>/g)];
    const arrivalTimes: number[] = [];

    for (const row of rows) {
      const rowText = row[1];

      const lineName = rowText.match(/<trainLineNm>(.*?)<\/trainLineNm>/)?.[1]?.trim() ?? '';
      const msg = rowText.match(/<arvlMsg2>(.*?)<\/arvlMsg2>/)?.[1]?.trim() ?? '';

      if (lineName.includes(targetLineName)) {
        const minMatch = msg.match(/(\d+)\s*분/);
        const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
        arrivalTimes.push(minutes);
      }
    }

    if (arrivalTimes.length > 0) {
      return Math.min(...arrivalTimes); // 가장 빠른 열차 시간 반환
    }

    return null;
  } catch (err: any) {
    console.error('❌ fetchSubwayArrivalTime error:', err.message);
    return null;
  }
}
