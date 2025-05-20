import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AssetItem, { Asset } from './AssetItem';

interface AssetsListProps {
  assets: Asset[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onAssetPress?: (asset: Asset) => void;
  style?: ViewStyle;
  emptyMessage?: string;
}

/**
 * 자산 목록 컴포넌트
 * 
 * 지갑 내 자산 목록을 표시하는 컴포넌트입니다.
 * 자산 항목들을 리스트로 표시하고 새로고침 기능을 제공합니다.
 * 
 * @param assets 표시할 자산 목록
 * @param loading 로딩 상태 여부
 * @param refreshing 새로고침 중 상태 여부
 * @param onRefresh 새로고침 이벤트 핸들러
 * @param onAssetPress 자산 항목 클릭 이벤트 핸들러
 * @param style 추가 스타일 (ViewStyle)
 * @param emptyMessage 자산이 없을 때 표시할 메시지
 */
const AssetsList: React.FC<AssetsListProps> = ({
  assets,
  loading = false,
  refreshing = false,
  onRefresh,
  onAssetPress,
  style,
  emptyMessage = '자산이 없습니다',
}) => {
  const { theme } = useTheme();
  
  // 자산 항목 클릭 처리
  const handleAssetPress = (asset: Asset) => {
    if (onAssetPress) {
      onAssetPress(asset);
    }
  };
  
  // 빈 목록 표시
  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text
          style={[
            styles.emptyText,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.md,
              fontFamily: theme.typography.fontFamily.medium,
            },
          ]}
        >
          {emptyMessage}
        </Text>
      </View>
    );
  };
  
  // 자산 항목 렌더링
  const renderAssetItem = ({ item }: { item: Asset }) => (
    <AssetItem
      asset={item}
      onPress={() => handleAssetPress(item)}
    />
  );
  
  // 키 추출기
  const keyExtractor = (item: Asset) => item.id;
  
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      <FlatList
        data={assets}
        renderItem={renderAssetItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          ) : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default AssetsList;
