import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';


export default function StepCard({
  type,
  instruction,
  highlighted,
  route,
  emoji,
  fullGuidance,
  liveInfo,
  exitName,
  startLocation,
  routeName,
}: any) {
  const renderIconByType = () => {
    switch (type) {
      case 'walk':
        return <FontAwesome5 name="walking" size={20} color="#ff6600" />;
      case 'bus':
        return <FontAwesome name="bus" size={20} color="#ff6600" />;
      case 'subway':
        return <FontAwesome name="subway" size={20} color="#ff6600" />;
      default:
        return <FontAwesome name="question" size={20} color="#ff6600" />;
    }
  };

  return (
    <View style={[styles.card, highlighted && styles.highlightedCard]}>
      <View style={styles.badge}>{renderIconByType()}</View>

      <Text style={styles.guidance}>
  {type === 'bus' && routeName && startLocation && exitName ? (
  <View style={styles.guidanceColumn}>
    <View style={styles.row}>
      <Text style={styles.guidanceLineBold}>{routeName}번</Text>
      <Text style={styles.infoText}>
          {liveInfo || instruction || '정보 없음'}
        </Text>
      </View>
    <Text style={styles.guidanceLine}>{startLocation}</Text>
    <AntDesign name="down" size={18} color="#ff6600" style={{ marginVertical: 2 }} />
    <Text style={styles.guidanceLine}>{exitName}</Text>
  </View>
) : (
  <Text style={styles.guidance}>{fullGuidance || '이동 정보 없음'}</Text>
)}

</Text>


     <Text style={styles.route}></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 350,
    borderRadius: 12,
    backgroundColor: '#fffaf0',
    padding: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  highlightedCard: {
    borderWidth: 2,
    borderColor: '#ff6600',
  },
  row: {
  flexDirection: 'row',       // 👉 아이템을 가로로 나열
  alignItems: 'center',       // 👉 세로 중앙 정렬
  justifyContent: 'center',   // 👉 가로 중앙 정렬 (또는 'space-between' 등도 가능)
  gap: 8,                     // 👉 아이템 사이 간격 (React Native 0.71 이상)
  marginBottom: 10,
},
  badge: {
  backgroundColor: '#fff',
  borderWidth: 2,
  borderColor: '#ff6600',
  borderRadius: 999,          // 완전한 원형 만들기
  width: 50,                  // 원하는 너비
  height: 50,                 // 원하는 높이
  justifyContent: 'center',  // 세로 중앙
  alignItems: 'center',      // 가로 중앙
  marginBottom: 6,
},
  badgeText: {
    color: '#ff6600',               // 글자도 주황색으로 변경 (가독성 ↑)
    fontWeight: 'bold',
    fontSize: 20,
  },
  guidance: {
    fontSize: 20,
    color: '#ff6600',
    textAlign: 'center',
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  infoText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  route: {
    fontSize: 20,
    color: '#777',
    marginTop: 6,
    textAlign: 'center',
  },
  guidanceColumn: {
  alignItems: 'center',
  justifyContent: 'center',
},

guidanceLine: {
  fontSize: 20,
  color: '#ff6600',
  textAlign: 'center',
},

guidanceLineBold: {
  fontSize: 20,
  color: '#ff6600',
  fontWeight : "bold",
  textAlign: 'center',
},

});