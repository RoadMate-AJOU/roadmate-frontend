const BASE_URL = 'http://49.50.131.200:8080';
import { useSessionStore } from '@/contexts/sessionStore';
const { sessionId, userState } = useSessionStore.getState();

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
    debugLog('API_ERROR', `HTTP ${response.status}`, {errorText});
    throw new Error(`API 오류: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  debugLog('API_SUCCESS', 'Response received', data);
  return data;
};

// ✅ 1. 사용자 인증 서비스
export const authService = {
    signup: async (username, password, name) => {
    const url = `${BASE_URL}/users/signup`;
    debugLog('SIGNUP_REQUEST', '📬 회원가입 요청1', { username, password, name });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, name, password }),
    });

    debugLog('SIGNUP_RESPONSE', '📬 회원가입 응답');


    return await handleApiResponse(response);
  },

  login: async (username, password) => {
    const url = `${BASE_URL}/users/signin`;
    debugLog('LOGIN_REQUEST', '🔐 로그인 요청', { username, password });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await handleApiResponse(response);

    console.log('로그인 성공:', data);

    useSessionStore.getState().setSession(data.token, 'signed');
    return data;
  },

  deleteAccount: async (userId, token) => {
    const url = `${BASE_URL}/users/${userId}`;
    debugLog('DELETE_REQUEST', '🗑️ 회원 탈퇴 요청', { userId });

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await handleApiResponse(response);
  },

  logout: () => {
    debugLog('LOGOUT', '로그아웃 요청 처리');
    useSessionStore.getState().clearSession();
  },
};

// ✅ 2. POI 검색 서비스
export const poiService = {
  searchPOI: async (keyword, latitude, longitude) => {
    try {
      debugLog('POI_SEARCH', '🔍 POI 검색 시작', { keyword, latitude, longitude });

      const url = `${BASE_URL}/api/poi/search`;
      debugLog('POI_REQUEST', '📍 POI API URL', { url });

      const requestBody = {
        destination: keyword,
        currentLat: latitude,
        currentLon: longitude,
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

      debugLog('POI_FALLBACK', '📦 샘플 데이터로 대체합니다');

      return {
        places: [
          {
            name: '서울역(세종대로)',
            lat: 37.5665,
            lon: 126.978,
            address: '서울특별시 종로구 세종대로',
          },
          {
            name: '서울역(자하문로)',
            lat: 37.57,
            lon: 126.982,
            address: '서울특별시 종로구 자하문로',
          },
        ],
      };
    }
  },
};

// ✅ 3. GPT 질의 처리 서비스
export const gptService = {
  askQuestion: async (text) => {
    const { sessionId, userState } = useSessionStore.getState();
    const url = `${BASE_URL}/nlp/chat`;

    debugLog('GPT_QUESTION', '🎤 GPT 질의 시작', { text });

    const headers = {
      'Content-Type': 'application/json',
      ...(userState === 'guest'
        ? { 'X-Guest-Id': sessionId }
        : { Authorization: sessionId }),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
    });

    const data = await handleApiResponse(response);
    // const destination = data?.data?.destination;

    return data;
  },
};

// ✅ 4. 경로 탐색 서비스
const appendLog = (title, payload) => {
  console.log(`📝 [${title}]`, JSON.stringify(payload, null, 2));
};

export const routeService = {
  searchRoute: async (
    startLat,
    startLon,
    endLat,
    endLon,
    startName = '현재 위치',
    endName = '목적지'
  ) => {
    appendLog('ROUTE_SEARCH', '=== 경로 탐색 시작 ===');
   const { sessionId, userState } = useSessionStore.getState();

    appendLog('ROUTE_PARAMS', {
      sessionId,
      startLat,
      startLon,
      endLat,
      endLon,
      startName,
      endName,
    });

    try {
      if (!startLat || !startLon || !endLat || !endLon) {
        throw new Error('출발지 또는 목적지 좌표가 없습니다');
      }

      const url = `${BASE_URL}/api/route/search`;
      appendLog('ROUTE_REQUEST_URL', { url });

      const requestBody = {
        startLat: parseFloat(startLat),
        startLon: parseFloat(startLon),
        endLat: parseFloat(endLat),
        endLon: parseFloat(endLon),
        startName,
        endName,
        searchOption: '0',
      };

      debugLog('ROUTE_REQUEST_BODY', 'Request body', requestBody);
      const headers = {
        'Content-Type': 'application/json',
        ...(userState === 'guest'
          ? { 'X-Guest-Id': sessionId }
          : { Authorization: sessionId }),
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('🚀 요청 헤더:', headers);

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

      if (
        error.message.includes('Network request failed') ||
        error.message.includes('fetch')
      ) {
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
  },
};

export const userService = {
  getMe: async (token) => {
    const url = `${BASE_URL}/users/me`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    return await handleApiResponse(response);
  },
};