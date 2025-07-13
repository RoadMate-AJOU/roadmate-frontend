import axios from 'axios';

export async function fetchBusArrivalTime(
  stationName: string,
  routeName: string
): Promise<number | string | '운행종료' | null> {
  const SERVICE_KEY =
    'PIhxU20UmgmdEe6RuG9HysRnlhY4BK%2FiSCzpx3PZWUKZC%2FL5CBexKOji3pXidRt1%2F7jQG2U7S5jdE34xyZco%2BQ%3D%3D';

  const normalize = (s: string) => s.replace(/\s/g, '').toLowerCase();

  const isMatchingBus = (apiRtNm: string, desired: string) => {
    const normApi = normalize(apiRtNm);
    const normDesired = normalize(desired);
    return (
      normApi === normDesired ||
      normApi.startsWith(normDesired) ||
      normApi.includes(normDesired) ||
      normDesired.startsWith(normApi) ||
      normDesired.includes(normApi)
    );
  };

  try {
    const arsUrl = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByName?serviceKey=${SERVICE_KEY}&stSrch=${encodeURIComponent(
      stationName
    )}&resultType=xml`;

    const arsRes = await axios.get(arsUrl, { responseType: 'text' });
    const arsId = arsRes.data.match(/<arsId>(\d+)<\/arsId>/)?.[1];

    if (!arsId) {
      console.warn(`⚠️ arsId not found for stationName: ${stationName}`);
      return null;
    }

    const arrivalUrl = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?serviceKey=${SERVICE_KEY}&arsId=${arsId}&resultType=xml`;
    const arrivalRes = await axios.get(arrivalUrl, { responseType: 'text' });

    const rows = [...arrivalRes.data.matchAll(/<itemList>([\s\S]*?)<\/itemList>/g)];
    for (const row of rows) {
      const rtNm = row[1].match(/<rtNm>(.*?)<\/rtNm>/)?.[1]?.trim();
      const msg1 = row[1].match(/<arrmsg1>(.*?)<\/arrmsg1>/)?.[1]?.trim() || '';
      const msg2 = row[1].match(/<arrmsg2>(.*?)<\/arrmsg2>/)?.[1]?.trim() || '';
      const bestMsg = msg1 || msg2;

      console.log(`🚌 [DEBUG] 비교: rtNm='${rtNm}', 원하는='${routeName}' | 메시지: '${bestMsg}'`);

      if (rtNm && isMatchingBus(rtNm, routeName)) {
        if (bestMsg.includes('운행종료')) {
          console.warn(`🚫 운행종료된 노선입니다: ${routeName}`);
          return '운행종료';
        }

        if (bestMsg.includes('출발대기')) {
          return '출발대기 중';
        }

        const match = bestMsg.match(/(\d+)\s*분/);
        if (match) {
          return parseInt(match[1], 10);
        } else if (bestMsg.includes('곧 도착') || bestMsg.includes('전')) {
          return 0;
        }

        // ⛔️ 그 외 처리 불가한 경우
        return bestMsg; // 원본 메시지 그대로 반환
      }
    }

    console.warn(`❌ [fetchBusArrivalTime] '${routeName}' 버스 정보 못 찾음 (정류장: ${stationName})`);
    return null;
  } catch (err) {
    console.error('❌ fetchBusArrivalTime error:', err);
    return null;
  }
}
