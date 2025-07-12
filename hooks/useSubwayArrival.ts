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
      console.log('\n============== 🚇 [useSubwayArrival] 호출 ==============');
      console.log('📍 주어진 stationName:', stationName);

      if (!stationName) {
        console.warn('⚠️ stationName이 undefined 또는 빈 문자열입니다.');
        console.warn('⛔ 지하철 실시간 도착 정보 API 호출을 생략합니다.');
        console.log('====================================================\n');
        return;
      }

      const API_KEY = '5855694b456d696e363742504c4f63';
      const encodedStation = encodeURIComponent(stationName);
      const url = `http://swopenapi.seoul.go.kr/api/subway/${API_KEY}/xml/realtimeStationArrival/0/5/${encodedStation}`;

      console.log('🌐 요청 URL:', url);

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(url, { responseType: 'text' });
        const xml = response.data;

        if (typeof xml !== 'string') {
          throw new Error('❌ 응답이 문자열이 아닙니다.');
        }

        if (xml.includes('<CODE>INFO-200</CODE>')) {
          console.error('❌ 호출 한도 초과 감지 (INFO-200)');
          setError('API 호출 한도 초과 (INFO-200)');
          setData([]);
          return;
        }

        console.log('✅ XML 일부:\n', xml.slice(0, 500));

        const rows = [...xml.matchAll(/<row>([\s\S]*?)<\/row>/g)];
        const results: SubwayArrivalInfo[] = [];

        console.log(`🔍 추출된 row 수: ${rows.length}`);

        for (const [i, row] of rows.entries()) {
          const block = row[1];
          console.log(`\n📦 row[${i}] 전체:\n${block}`);

          const trainLine = block.match(/<trainLineNm[^>]*>([\s\S]*?)<\/trainLineNm>/)?.[1]?.trim() || '';
          const message = block.match(/<arvlMsg2[^>]*>([\s\S]*?)<\/arvlMsg2>/)?.[1]?.trim() || '';
          const direction = block.match(/<updnLine[^>]*>([\s\S]*?)<\/updnLine>/)?.[1]?.trim() || '';

          console.log(`🟢 row[${i}]`);
          console.log(`🚇 노선: ${trainLine}`);
          console.log(`📨 도착 메시지: ${message}`);
          console.log(`⬆⬇ 방향: ${direction}`);

          if (trainLine && message && direction) {
            results.push({ trainLine, message, direction });
          }
        }

        if (results.length === 0) {
          console.warn('⚠️ 파싱된 도착 정보가 없습니다.');
          setError('도착 정보를 찾을 수 없습니다.');
          setData([]);
        } else {
          console.log(`✅ 최종 결과 ${results.length}건`);
          setData(results);
        }
      } catch (err: any) {
        console.error('❌ useSubwayArrival API Error:', err.message);
        setError('데이터를 불러오는 데 실패했습니다.');
        setData([]);
      } finally {
        setLoading(false);
        console.log('====================================================\n');
      }
    };

    fetchSubwayArrival();
    interval = setInterval(fetchSubwayArrival, 20000);

    return () => clearInterval(interval);
  }, [stationName]);

  return { data, loading, error };
}
