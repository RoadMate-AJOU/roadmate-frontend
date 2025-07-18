const BASE_URL = 'http://49.50.131.200:8080';

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

// TODO : 형님이 하셔야 할 거
// 1. 회원가입 처리하는 함수
// 2. 로그인 처리하는 함수
// 3. 회원 탈퇴 처리하는 함수
// 4. 회원 조회 함수 -> 이거는 백이 구현 안 할 수도 있어서 물어볼게여

// POI 검색 서비스
export const poiService = {
  searchPOI: async (keyword, latitude, longitude) => {
    try {
      debugLog('POI_SEARCH', '🔍 POI 검색 시작', { keyword, latitude, longitude });

      const url = `${BASE_URL}/api/poi/search`;
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

      // 🔁 샘플 데이터 fallback
      debugLog('POI_FALLBACK', '📦 샘플 데이터로 대체합니다');

      return {
        places: [
          {
            name: '서울역(세종대로)',
            lat: 37.5665,
            lon: 126.9780,
            address: '서울특별시 종로구 세종대로',
          },
          {
            name: '서울역(자하문로)',
            lat: 37.5700,
            lon: 126.982,
            address: '서울특별시 종로구 자하문로',
          },
        ],
      };
    }
  }
};

// GPT 질문 처리 서비스
export const gptService = {
  askQuestion: async (sessionId, text) => {
    const url = `${BASE_URL}/nlp/chat`;

    debugLog('GPT_QUESTION', '🎤 GPT 질의 시작', { sessionId, text });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, text }),
    });

    const data = await handleApiResponse(response);

    const destination = data?.data?.destination;

    debugLog('GPT_RESULT', '🧠 목적지 추출 결과', { destination });

    return destination; // 목적지 문자열만 반환
  }
};


// 디버깅 로그 출력용 (사용자 정의 함수)
const appendLog = (title, payload) => {
  console.log(`📝 [${title}]`, JSON.stringify(payload, null, 2));
};

export const routeService = {
  searchRoute: async (startLat, startLon, endLat, endLon, startName = '현재 위치', endName = '목적지') => {
    appendLog('ROUTE_SEARCH', '=== 경로 탐색 시작 ===');
    const sessionId = 'session-002';
    appendLog('ROUTE_PARAMS', {
      sessionId,
      startLat,
      startLon,
      endLat,
      endLon,
      startName,
      endName
    });

    try {
      if (!startLat || !startLon || !endLat || !endLon) {
        throw new Error('출발지 또는 목적지 좌표가 없습니다');
      }

      const url = `${BASE_URL}/api/route/search`;
      appendLog('ROUTE_REQUEST_URL', { url });

      const requestBody = {
        sessionId: "session-002",
        startLat: parseFloat(startLat),
        startLon: parseFloat(startLon),
        endLat: parseFloat(endLat),
        endLon: parseFloat(endLon),
        startName: startName,
        endName: endName,
        searchOption: "0"
      };

      debugLog('ROUTE_REQUEST_BODY', 'Request body', requestBody);

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

      appendLog('ROUTE_RESPONSE_META', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      const data = await handleApiResponse(response);

      appendLog('ROUTE_SUCCESS', {
        totalDistance: data.totalDistance,
        totalTime: data.totalTime,
        guideCount: data.guides?.length || 0,
      });

      return data;
    } catch (error) {
      appendLog('ROUTE_ERROR', {
        message: error.message,
        stack: error.stack,
      });

      if (error.message.includes('Network request failed') ||
          error.message.includes('fetch')) {
        appendLog('NETWORK_ERROR', '서버 연결 실패: 백엔드가 켜져 있는지 확인하세요.');
        throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      }

      throw error;
    }
  },

  healthCheck: async () => {
    try {
      const url = `${BASE_URL}/api/route/health`;
      appendLog('HEALTH_CHECK_URL', { url });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await handleApiResponse(response);
      appendLog('HEALTH_SUCCESS', result);
      return result;

    } catch (error) {
      appendLog('HEALTH_ERROR', { message: error.message });
      throw error;
    }
  }
};
