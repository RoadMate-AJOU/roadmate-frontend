import { useEffect, useState } from 'react';
import axios from 'axios';

interface SubwayArrivalInfo {
  trainLine: string;
  message: string;
  direction: string;
}

export function useSubwayArrival(stationName?: string) {
  const [data, setData] = useState<SubwayArrivalInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchSubwayArrival = async () => {
      if (!stationName) return;

      const API_KEY = '5855694b456d696e363742504c4f63';
      const url = `http://swopenapi.seoul.go.kr/api/subway/${API_KEY}/xml/realtimeStationArrival/0/5/${encodeURIComponent(
        stationName
      )}`;

      console.log('\n🚇 [useSubwayArrival] 호출');
      console.log('📍 stationName:', stationName);

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(url, {
          responseType: 'text', // ✅ XML을 문자열로 받기
        });
        const xml = response.data;

        if (typeof xml !== 'string') {
          throw new Error('응답이 문자열이 아닙니다');
        }

        console.log('✅ XML 일부:\n', xml.slice(0, 500));

        const rows = [...xml.matchAll(/<row>([\s\S]*?)<\/row>/g)];
        const results: SubwayArrivalInfo[] = [];

        for (const row of rows) {
          const block = row[1];

          const trainLine = block.match(/<trainLineNm>(.*?)<\/trainLineNm>/)?.[1] || '';
          const message = block.match(/<arvlMsg2>(.*?)<\/arvlMsg2>/)?.[1] || '';
          const direction = block.match(/<updnLine>(.*?)<\/updnLine>/)?.[1] || '';

          if (trainLine && message && direction) {
            results.push({
              trainLine,
              message,
              direction,
            });
          }
        }

        if (results.length === 0) {
          setError('도착 정보를 찾을 수 없습니다.');
          setData([]);
        } else {
          setData(results);
        }
      } catch (err: any) {
        console.error('❌ useSubwayArrival API Error:', err.message);
        setError('데이터를 불러오는 데 실패했습니다.');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubwayArrival();
    interval = setInterval(fetchSubwayArrival, 20000);

    return () => clearInterval(interval);
  }, [stationName]);

  return { data, loading, error };
}
