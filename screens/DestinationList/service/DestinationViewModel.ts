import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { poiService, routeService } from '@/services/api';
import * as Speech from 'expo-speech';
import { useLocation } from '@/contexts/LocationContext';
import { Router, UnknownOutputParams } from 'expo-router';

export function useDestinationListViewModel(router: Router, params: UnknownOutputParams, isActiveRef: React.MutableRefObject<boolean>) {
    const { location } = useLocation();
    const [poiList, setPoiList] = useState([]);
    const searchKeyword = params.searchKeyword || '-';
    const [routeSearching, setRouteSearching] = useState(null);
    const [initialized, setInitialized] = useState(false);

    const appendLog = (title: string, payload: any) => {
        console.log(`📝 [${title}]`, JSON.stringify(payload, null, 2));
    };

    const processPoiResults = useCallback((results: any) => {
        const parsedList = results.map((place: any, idx: any) => {
            const rawDistance = place.distance || 0;
            const formattedDistance =
                rawDistance >= 1000
                    ? `${(rawDistance / 1000).toFixed(1)}km`
                    : `${Math.round(rawDistance)}m`;

            return {
                id: `${place.name}-${idx}-${Date.now()}`,
                name: place.name,
                distance: formattedDistance,
                category: place.category || '기타',
                address: place.address || '주소 정보 없음',
                lat: place.latitude,
                lon: place.longitude,
                tel: place.tel || '',
            };
        });

        setPoiList(parsedList);
    }, []);

    const loadSampleData = useCallback(() => {
        try {
            const samplePOI = require('../../data/tmap_POI_sample.json');
            const rawList = samplePOI?.searchPoiInfo?.pois?.poi ?? [];
            const parsedList = rawList.map((poi: any, idx: any) => ({
                id: `${poi.id}-${poi.navSeq}-${idx}-${Date.now()}`,
                name: poi.name,
                distance: '',
                category: `${poi.upperBizName || ''}, ${poi.middleBizName || ''}`,
                address: poi.newAddressList?.newAddress?.[0]?.fullAddressRoad || '주소 정보 없음',
                lat: parseFloat(poi.frontLat),
                lon: parseFloat(poi.frontLon),
            }));
            setPoiList(parsedList);
        } catch (error) {
            setPoiList([]);
        }
    }, []);

    const handleSelectDestination = useCallback(async (item: any) => {
        if (routeSearching) {
            console.log('🚫 다른 경로 검색 중입니다. 중복 탐색 방지.');
            return;
        }

        Speech.stop();

        appendLog('clickButton', routeSearching);

        const currentLocation = location || { latitude: 37.52759656, longitude: 126.91994412 };
        const sessionId = params.sessionId;

        setRouteSearching(item.id);
        appendLog('📤 경로 요청 파라미터', {
            startLat: currentLocation.latitude,
            startLon: currentLocation.longitude,
            endLat: item.lat,
            endLon: item.lon,
            startName: '현재 위치',
            endName: item.name,
        });

        try {
            await routeService.searchRoute(
                sessionId,
                currentLocation.latitude,
                currentLocation.longitude,
                item.lat,
                item.lon,
                '현재 위치',
                item.name
            );
            if (!isActiveRef.current) {
                console.log('🛑 이미 화면을 떠났습니다.');
                return;
            }
            Speech.speak(`${item.name}까지 경로 안내를 시작합니다.`, {  // **** 수정사항 : MapScreen으로 이 부분을 넘겨서 화면 넘어가지고 안내 시작하게 변경 ****
                language: 'ko-KR',
                pitch: 1.0,
                rate: 1.0,
                onDone: () => {
                    if (!isActiveRef.current) {
                        console.log('🛑 이미 화면을 떠났습니다.');
                        return;
                    }
                    router.push({
                        pathname: '/map',
                        params: {
                            destinationName: item.name,
                            destinationLat: item.lat,
                            destinationLon: item.lon,
                            destinationAddress: item.address,
                            startLat: currentLocation.latitude,
                            startLon: currentLocation.longitude,
                            startName: '현재 위치',
                        },
                    });
                    setRouteSearching(null);
                },
            });
        } catch (error) {
            if (!isActiveRef.current) {
                console.log('🛑 이미 화면을 떠났습니다.');
                return;
            }
            appendLog('❌ 경로 요청 실패', error);
            Alert.alert('경로 검색 실패', '경로를 찾을 수 없습니다. 기본 지도로 이동합니다.', [
                {
                    text: '확인',
                    onPress: () => {
                        router.replace({
                            pathname: '/map',
                            params: {
                                destinationName: item.name,
                                destinationLat: item.lat,
                                destinationLon: item.lon,
                                destinationAddress: item.address,
                                startLat: currentLocation.latitude,
                                startLon: currentLocation.longitude,
                                startName: '현재 위치',
                                routeError: 'true',
                            },
                        });
                    },
                },
            ]);
            setRouteSearching(null);
        }
    }, [location, router, params]);


    const initialize = useCallback(() => {
        if (initialized) return;

        if (params.poiResults) {
            try {
                const parsedResults = JSON.parse(params.poiResults);
                processPoiResults(parsedResults);
                setInitialized(true);
            } catch (error) {
                loadSampleData();
                setInitialized(true);
            }
        } else {
            loadSampleData();
            setInitialized(true);
        }
    }, [params, initialized, processPoiResults, loadSampleData]);


    return {
        poiList,
        searchKeyword,
        routeSearching,
        initialized,
        loadSampleData,
        processPoiResults,
        handleSelectDestination,
        initialize
    };
}
