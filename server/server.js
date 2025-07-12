const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 4000;

// ✅ 서비스 키
const busServiceKey = 'PIhxU20UmgmdEe6RuG9HysRnlhY4BK/iSCzpx3PZWUKZC/L5CBexKOji3pXidRt1/7jQG2U7S5jdE34xyZco+Q==';
const subwayServiceKey = '5855694b456d696e363742504c4f63';

app.use(cors());

// ✅ 버스 endpoint alias → 실제 경로
const endpointMap = {
  getArrInfoByArsId: 'arrive/getArrInfoByArsId',
  getBusArrInfoByStId: 'busarrivalservice/getLowBusArrInfoByStId',
  getBusArrInfoByRoute: 'busarrivalservice/getLowBusArrInfoByRoute',
  getArrInfoByRoute: 'arrive/getArrInfoByRoute',
  getArrInfoByRouteAll: 'arrive/getArrInfoByRouteAll',
  getStationByName: 'stationinfo/getStationByName',
};

/**
 * ✅ 버스 API 프록시
 * 예: /bus-api?endpoint=getArrInfoByRoute&stId=123&busRouteId=456&ord=2
 */
app.get('/bus-api', async (req, res) => {
  const { endpoint, ...params } = req.query;

  if (!endpoint) {
    console.warn('❌ endpoint 쿼리 없음');
    return res.status(400).send('❌ endpoint query parameter is required');
  }

  const actualPath = endpointMap[endpoint] || endpoint;
  const url = new URL(`http://ws.bus.go.kr/api/rest/${actualPath}`);

  const queryParams = new URLSearchParams(params);
  queryParams.delete('serviceKey');
  queryParams.append('serviceKey', busServiceKey);
  url.search = queryParams.toString();

  console.log('\n🚌 [버스 요청]');
  console.log('🌐 URL:', url.toString());

  try {
    const response = await axios.get(url.toString());
    const preview =
      typeof response.data === 'string'
        ? response.data.slice(0, 300)
        : JSON.stringify(response.data).slice(0, 300);
    console.log('✅ 응답 성공 (미리보기):\n', preview);

    res.send(response.data);
  } catch (err) {
    console.error('❌ 버스 API 에러:', err.message);
    res.status(500).send('Proxy error: ' + err.message);
  }
});

/**
 * ✅ 지하철 API 프록시
 * 예: /subway-api?stationName=서울
 */
app.get('/subway-api', async (req, res) => {
  const { stationName } = req.query;

  if (!stationName) {
    return res.status(400).send('❌ stationName query parameter is required');
  }

  const encodedStation = encodeURIComponent(stationName);
  const url = `http://swopenapi.seoul.go.kr/api/subway/${subwayServiceKey}/xml/realtimeStationArrival/0/5/${encodedStation}`;

  console.log('\n🚇 [지하철 요청]');
  console.log('🌐 URL:', url);

  try {
    const response = await axios.get(url, { responseType: 'text' }); // ✅ 핵심 수정
    console.log('✅ 응답 성공 (앞부분):\n', response.data.slice(0, 300));
    res.send(response.data);
  } catch (err) {
    console.error('❌ 지하철 API 에러:', err.message);
    res.status(500).send('Proxy error: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running at http://localhost:${PORT}`);
});
