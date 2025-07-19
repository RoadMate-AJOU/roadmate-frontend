export type TransportType = 'walk' | 'bus' | 'subway';

export interface StepModel {
    type: TransportType;             // 이동 수단
    instruction: string;             // 안내 문구 (예: "5분")
    highlighted: boolean;            // 현재 경로 여부
    route: string;                   // 노선 정보 (예: "노선:273")
    emoji: string;                   // 이모지 (🚶, 🚌, 🚇 등)
    fullGuidance: string;           // 전체 안내 텍스트
    originalIndex: number;          // guides 인덱스
    startLocation?: string;         // 출발 정류장 이름
    routeName?: string;             // 버스/지하철 노선 이름
    exitName?: string | null;       // 하차 정류장 이름 (있을 경우)
}
