import { useEffect, useState } from 'react';
import axios from 'axios';

const SERVICE_KEY =
  'Cb4J4pwSCPtLzWh4f1CyJUEZLFslFJPJgXOjaYDQZXXD3WFkNaNcWsOA%2BjWVx6h9XNsiy2TTIlfsQpodJyQ6iQ%3D%3D';

interface BusArrivalInfo {
  routeId: string;
  routeName: string;
  locationNo1: string;
  predictTime1: string;
  remainSeatCnt1: string;
}

export function useBusArrival(startStop: string | undefined) {
  const [data, setData] = useState<BusArrivalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [arsId, setArsId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArsIdAndArrival = async () => {
      if (!startStop) {
        setError('정류장 이름이 없습니다.');
        setLoading(false);
        return;
      }

      try {
        // 1. 정류장명으로 ARS ID 조회
        const stationResponse = await axios.get(
          `http://ws.bus.go.kr/api/rest/stationinfo/getStationByName`,
          {
            params: {
              serviceKey: SERVICE_KEY,
              stSrch: startStop,
            },
          }
        );

        const stations = stationResponse.data?.ServiceResult?.msgBody?.itemList ?? [];

        if (stations.length === 0) {
          setError('정류장 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        const arsIdFetched = stations[0]?.arsId;
        setArsId(arsIdFetched);

        // 2. ARS ID로 도착 정보 조회
        const arrivalResponse = await axios.get(
          `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid`,
          {
            params: {
              serviceKey: SERVICE_KEY,
              arsId: arsIdFetched,
            },
          }
        );

        const items = arrivalResponse.data?.ServiceResult?.msgBody?.itemList ?? [];

        const parsedData = items.map((item: any) => ({
          routeId: item?.busRouteId,
          routeName: item?.rtNm,
          locationNo1: item?.stationNm1,
          predictTime1: item?.arrmsg1,
          remainSeatCnt1: item?.reride_Num1,
        }));

        setData(parsedData);
      } catch (err) {
        setError('API 요청 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArsIdAndArrival();
  }, [startStop]);

  return { data, loading, error, arsId };
}
