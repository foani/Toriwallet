import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Tab {
  key: string;
  title: string;
}

interface TabViewProps {
  tabs: Tab[];
  activeKey: string;
  onTabChange: (key: string) => void;
  scrollable?: boolean;
}

/**
 * 탭 뷰 컴포넌트
 * 여러 탭 사이를 전환할 수 있는 UI를 제공합니다.
 * 
 * @param tabs 탭 목록 배열 (key, title 필요)
 * @param activeKey 현재 활성화된 탭의 키
 * @param onTabChange 탭 변경 핸들러
 * @param scrollable 가로 스크롤 가능 여부 (기본값: false)
 */
const TabView: React.FC<TabViewProps> = ({
  tabs,
  activeKey,
  onTabChange,
  scrollable = false,
}) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  // 탭 UI 컨테이너
  const Container = scrollable ? ScrollView : View;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Container
        horizontal={scrollable}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.tabsContainer,
          !scrollable && { width: screenWidth },
        ]}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              !scrollable && { flex: 1 },
              scrollable && { paddingHorizontal: 16 },
              activeKey === tab.key && {
                borderBottomColor: theme.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeKey === tab.key
                      ? theme.primary
                      : theme.textSecondary,
                  fontWeight: activeKey === tab.key ? '600' : 'normal',
                },
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabsContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  tab: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
  },
});

export default TabView;
