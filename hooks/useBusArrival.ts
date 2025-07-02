// hooks/useBusArrival.ts
import { useEffect, useState } from 'react';
import axios from 'axios';

const SERVICE_KEY ='Cb4J4pwSCPtLzWh4f1CyJUEZLFslFJPJgXOjaYDQZXXD3WFkNaNcWsOA+jWVx6h9XNsiy2TTIlfsQpodJyQ6iQ==';

interface BusArrivalInfo {
  routeId: string;
  routeName: string;
  locationNo1: string;
  predictTime1: string;
  remainSeatCnt1: string;
}

export function useBusArrival(arsId: string) {
  const [data, setData] = useState<BusArrivalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchArrivalInfo = async () => {
      try {
        const response = await axios.get(
          `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid`,
          {
            params: {
              serviceKey: SERVICE_KEY,
              arsId,
            },
          }
        );

        const items =
          response.data?.ServiceResult?.msgBody?.itemList ?? [];

        const parsedData = items.map((item: any) => ({
          routeId: item?.busRouteId,
          routeName: item?.rtNm,
          locationNo1: item?.stationNm1,
          predictTime1: item?.arrmsg1,
          remainSeatCnt1: item?.reride_Num1,
        }));

        setData(parsedData);
      } catch (err: any) {
        setError('버스 도착 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchArrivalInfo();
  }, [arsId]);

  return { data, loading, error };
}
