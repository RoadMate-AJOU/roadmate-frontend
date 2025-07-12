import axios from 'axios';

export async function fetchBusArrivalTime(
  stationName: string,
  routeName: string
): Promise<number | null | '운행종료'> {
  const SERVICE_KEY = 'PIhxU20UmgmdEe6RuG9HysRnlhY4BK%2FiSCzpx3PZWUKZC%2FL5CBexKOji3pXidRt1%2F7jQG2U7S5jdE34xyZco%2BQ%3D%3D';

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

      if (rtNm?.replace(/\s/g, '') === routeName.replace(/\s/g, '')) {
        if (bestMsg.includes('운행종료')) {
          console.warn(`🚫 운행종료된 노선입니다: ${routeName}`);
          return '운행종료';
        }

        const match = bestMsg.match(/(\d+)\s*분/);
        if (match) {
          return parseInt(match[1], 10);
        } else if (bestMsg.includes('곧 도착') || bestMsg.includes('전')) {
          return 0;
        }
      }
    }

    console.warn(`❌ [fetchBusArrivalTime] '${routeName}' 버스 정보 못 찾음 (정류장: ${stationName})`);
    return null;
  } catch (err) {
    console.error('❌ fetchBusArrivalTime error:', err);
    return null;
  }
}
