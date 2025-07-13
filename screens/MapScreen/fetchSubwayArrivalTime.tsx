// screens/MapScreen/fetchSubwayArrivalTime.ts
import axios from 'axios';

/**
 * 지하철 도착 시간 조회 함수
 * @param stationName 역 이름 (예: '경복궁')
 * @returns 가장 빠른 도착 시간 (단위: 분), 곧 도착이면 0, 실패 시 null
 */
export async function fetchSubwayArrivalTime(
  stationName: string
): Promise<number | null> {
  const SERVICE_KEY = '5855694b456d696e363742504c4f63';
  const URL = `http://swopenapi.seoul.go.kr/api/subway/${SERVICE_KEY}/xml/realtimeStationArrival/0/5/${encodeURIComponent(
    stationName
  )}`;

  try {
    const res = await axios.get(URL, { responseType: 'text' });

    const rows = [...res.data.matchAll(/<row>([\s\S]*?)<\/row>/g)];

    for (const row of rows) {
      const msg = row[1].match(/<arvlMsg2>(.*?)<\/arvlMsg2>/)?.[1]?.trim();
      if (msg) {
        const match = msg.match(/(\d+)\s*분/);
        return match ? parseInt(match[1], 10) : 0;
      }
    }

    return null;
  } catch (err: any) {
    console.error('❌ fetchSubwayArrivalTime error:', err.message);
    return null;
  }
}
