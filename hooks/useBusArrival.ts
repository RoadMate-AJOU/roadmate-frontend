import { useEffect, useState } from 'react';
import axios from 'axios';

interface BusArrivalInfo {
  message: string;
}

export function useBusArrival(stationName?: string, routeName?: string) {
  const [data, setData] = useState<BusArrivalInfo[]>([]);
  const [soonestMinutes, setSoonestMinutes] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractMinutesFromMessage = (msg: string): number | null => {
    const match = msg.match(/(\d+)\s*분/);
    return match ? parseInt(match[1], 10) : null;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchBusArrival = async () => {
      if (!stationName || !routeName) {
        console.warn('⚠️ 필수 파라미터 누락 → API 호출 중단');
        console.warn('⛔ stationName:', stationName);
        console.warn('⛔ routeName:', routeName);
        return;
      }

      console.log('\n============== 🚌 [useBusArrival] 호출 ==============');
      console.log('🔍 정류장 이름 (stationName):', stationName);
      console.log('🔍 노선 이름 (routeName):', routeName);

      setLoading(true);
      setError(null);

      try {
        const SERVICE_KEY = 'PIhxU20UmgmdEe6RuG9HysRnlhY4BK%2FiSCzpx3PZWUKZC%2FL5CBexKOji3pXidRt1%2F7jQG2U7S5jdE34xyZco%2BQ%3D%3D';

        // 1️⃣ arsId 조회
        const arsUrl = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByName?serviceKey=${SERVICE_KEY}&stSrch=${encodeURIComponent(
          stationName
        )}&resultType=xml`;

        console.log('📡 arsId 조회 URL:', arsUrl);

        const arsRes = await axios.get(arsUrl, { responseType: 'text' });
        const arsXml = arsRes.data;

        console.log('📦 arsId 응답 XML 일부:\n', arsXml.slice(0, 500));

        const arsIdMatch = arsXml.match(/<arsId>(\d+)<\/arsId>/);
        const arsId = arsIdMatch?.[1];

        if (!arsId) {
          console.error('❌ arsId 추출 실패 → stationName이 잘못되었거나 응답에 arsId 없음');
          throw new Error('arsId를 찾을 수 없습니다.');
        }

        console.log('✅ 추출된 arsId:', arsId);

        // 2️⃣ 도착정보 조회
        const arrivalUrl = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?serviceKey=${SERVICE_KEY}&arsId=${arsId}&resultType=xml`;

        console.log('📡 도착정보 조회 URL:', arrivalUrl);

        const arrivalRes = await axios.get(arrivalUrl, { responseType: 'text' });
        const arrivalXml = arrivalRes.data;

        console.log('📦 도착정보 XML 일부:\n', arrivalXml.slice(0, 500));

        const rows = [...arrivalXml.matchAll(/<itemList>([\s\S]*?)<\/itemList>/g)];
        console.log(`🔎 총 itemList 갯수: ${rows.length}`);

        const results: BusArrivalInfo[] = [];

        for (const [i, row] of rows.entries()) {
          const block = row[1];
          const rtNm = block.match(/<rtNm>(.*?)<\/rtNm>/)?.[1]?.trim();
          const msg = block.match(/<arrmsg1>(.*?)<\/arrmsg1>/)?.[1]?.trim();

          console.log(`📄 [${i}] 노선: ${rtNm}, 도착 메시지: ${msg}`);

          if (rtNm === routeName && msg) {
            results.push({ message: msg });
            console.log(`✅ [${i}] routeName 일치 → 추가됨`);
          }
        }

        if (results.length === 0) {
          console.warn('⚠️ 일치하는 도착 메시지가 없습니다');
        }

        setData(results);

        const minutesList = results
          .map((r) => extractMinutesFromMessage(r.message))
          .filter((m): m is number => m !== null);

        const minMinutes = minutesList.length > 0 ? Math.min(...minutesList) : null;
        setSoonestMinutes(minMinutes);

        console.log('⏱️ 도착까지 가장 빠른 시간:', minMinutes);
      } catch (err: any) {
        console.error('❌ useBusArrival API Error:', err.message);
        setError(err.message || 'API 요청 실패');
        setData([]);
        setSoonestMinutes(null);
      } finally {
        setLoading(false);
        console.log('====================================================\n');
      }
    };

    fetchBusArrival();
    interval = setInterval(fetchBusArrival, 20000); // 20초마다 업데이트

    return () => clearInterval(interval);
  }, [stationName, routeName]);

  return { data, soonestMinutes, loading, error };
}
