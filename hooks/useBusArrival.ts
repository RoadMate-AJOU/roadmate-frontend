import { useEffect, useState } from 'react';
import axios from 'axios';

interface BusArrivalInfo {
  message: string;
}

export function useBusArrival(
  stId?: string,
  busRouteId?: string,
  ord?: string
) {
  const [data, setData] = useState<BusArrivalInfo[]>([]);
  const [soonestMinutes, setSoonestMinutes] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ 문자열에서 "X분"을 정수로 추출
  const extractMinutesFromMessage = (msg: string): number | null => {
    const match = msg.match(/(\d+)\s*분/);
    return match ? parseInt(match[1], 10) : null;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchBusArrival = async () => {
      if (!stId || !busRouteId || !ord) return;

      console.log('\n🔎 [useBusArrival] 호출');
      console.log('🟢 stId:', stId);
      console.log('🟢 busRouteId:', busRouteId);
      console.log('🟢 ord:', ord);

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get('http://10.0.2.2:4000/bus-api', {
          params: {
            endpoint: 'arrive/getArrInfoByRoute',
            stId,
            busRouteId,
            ord,
          },
        });

        const xml = response.data;
        console.log('✅ 응답 XML 일부:\n', xml.slice(0, 500));

        const arrmsg1 = xml.match(/<arrmsg1>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/arrmsg1>/)?.[1];
        const arrmsg2 = xml.match(/<arrmsg2>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/arrmsg2>/)?.[1];

        console.log('📦 파싱된 arrmsg1:', arrmsg1);
        console.log('📦 파싱된 arrmsg2:', arrmsg2);

        const results: BusArrivalInfo[] = [];
        if (arrmsg1) results.push({ message: arrmsg1 });
        if (arrmsg2) results.push({ message: arrmsg2 });
        setData(results);

        // ✅ 가장 빠른 분 단위 추출
        const messages = [arrmsg1, arrmsg2].filter(Boolean);
        const minutesList = messages
          .map((msg) => extractMinutesFromMessage(msg!))
          .filter((m): m is number => m !== null);

        const minMinutes = minutesList.length > 0 ? Math.min(...minutesList) : null;
        setSoonestMinutes(minMinutes);
        console.log('⏱️ 도착까지 가장 빠른 시간:', minMinutes);
      } catch (err: any) {
        console.error('❌ useBusArrival API Error:', err.message);
        setError(err.message);
        setData([]);
        setSoonestMinutes(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBusArrival();
    interval = setInterval(fetchBusArrival, 20000); // 20초마다 자동 갱신

    return () => clearInterval(interval);
  }, [stId, busRouteId, ord]);

  return { data, soonestMinutes, loading, error };
}
