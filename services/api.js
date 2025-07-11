// services/api.js
const BASE_URL = 'http://223.130.135.190:8080/api'; // 실제 백엔드 IP로 변경하세요

// 디버깅을 위한 로그 함수
const debugLog = (tag, message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`🕐 ${timestamp} [${tag}] ${message}`);
  if (data) {
    console.log(`📊 [${tag}] Data:`, JSON.stringify(data, null, 2));
  }
};

// API 응답 공통 처리 함수
const handleApiResponse = async (response) => {
  debugLog('API_RESPONSE', `Status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    debugLog('API_ERROR', `HTTP ${response.status}`, { errorText });
    throw new Error(`API 오류: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  debugLog('API_SUCCESS', 'Response received', data);
  return data;
};

// GPT 서비스 (음성 입력 파싱용)
export const gptService = {
  parseUserInput: async (text) => {
    try {
      debugLog('GPT_PARSE', 'Input received', { text });

      // 간단한 키워드 추출 로직 (실제 GPT API 대신)
      const destination = text
        .replace(/가고\s*싶어요?|갈래요?|가자|가줘|까지|으로|에|로/g, '')
        .trim();

      const result = {
        departure: null,
        destination: destination || text.trim()
      };

      debugLog('GPT_PARSE', 'Result', result);
      return result;
    } catch (error) {
      debugLog('GPT_ERROR', 'Parse failed', { error: error.message });
      throw error;
    }
  }
};

// POI 검색 서비스
export const poiService = {
  searchPOI: async (keyword, latitude, longitude) => {
    try {
      debugLog('POI_SEARCH', '🔍 POI 검색 시작', { keyword, latitude, longitude });

      const url = `${BASE_URL}/poi/search`;
      debugLog('POI_REQUEST', '📍 POI API URL', { url });

      const requestBody = {
        destination: keyword,
        currentLat: latitude,
        currentLon: longitude
      };

      debugLog('POI_REQUEST_BODY', '📤 Request body', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await handleApiResponse(response);
      debugLog('POI_SUCCESS', '✅ POI search completed', { resultCount: data.places?.length || 0 });

      return data;
    } catch (error) {
      debugLog('POI_ERROR', '❌ POI search failed', { error: error.message });
      throw error;
    }
  }
};

// 경로 탐색 서비스
export const routeService = {
  searchRoute: async (startLat, startLon, endLat, endLon, startName = '현재 위치', endName = '목적지') => {
    debugLog('ROUTE_SEARCH', '=== 경로 탐색 시작 ===');
    debugLog('ROUTE_PARAMS', 'Input parameters', {
      startLat,
      startLon,
      endLat,
      endLon,
      startName,
      endName
    });

    try {
      // 파라미터 검증
      if (!startLat || !startLon || !endLat || !endLon) {
        throw new Error('출발지 또는 목적지 좌표가 없습니다');
      }

      const url = `${BASE_URL}/route/search`;
      debugLog('ROUTE_REQUEST', 'Request URL', { url });

      const requestBody = {
        startLat: parseFloat(startLat),
        startLon: parseFloat(startLon),
        endLat: parseFloat(endLat),
        endLon: parseFloat(endLon),
        startName: startName,
        endName: endName,
        searchOption: "0" // 최적 경로
      };

      debugLog('ROUTE_REQUEST_BODY', 'Request body', requestBody);

      // 실제 fetch 호출
      debugLog('ROUTE_FETCH', '🚀 실제 fetch 호출 시작!', {
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      debugLog('ROUTE_RESPONSE', '📥 fetch 응답 받음', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await handleApiResponse(response);
      debugLog('ROUTE_SUCCESS', '✅ 경로 탐색 완료', {
        totalDistance: data.totalDistance,
        totalTime: data.totalTime,
        guidesCount: data.guides?.length || 0
      });

      return data;

    } catch (error) {
      debugLog('ROUTE_ERROR', '❌ 경로 탐색 실패', {
        error: error.message,
        stack: error.stack
      });

      // 네트워크 연결 문제인지 확인
      if (error.message.includes('Network request failed') ||
          error.message.includes('fetch')) {
        debugLog('NETWORK_ERROR', '네트워크 연결 문제 감지');
        throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      }

      throw error;
    }
  },

  // 헬스 체크 함수 추가
  healthCheck: async () => {
    try {
      debugLog('HEALTH_CHECK', '서버 상태 확인 시작');

      const url = `${BASE_URL}/route/health`;
      debugLog('HEALTH_REQUEST', 'Health check URL', { url });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await handleApiResponse(response);
      debugLog('HEALTH_SUCCESS', '서버 정상 응답', result);
      return result;

    } catch (error) {
      debugLog('HEALTH_ERROR', '서버 연결 실패', { error: error.message });
      throw error;
    }
  }
};