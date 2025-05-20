import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SectionList,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import TransactionItem, { Transaction } from './TransactionItem';
import { format } from 'date-fns';

// 트랜잭션 섹션 타입 정의
interface TransactionSection {
  title: string;
  data: Transaction[];
}

interface TransactionsListProps {
  transactions: Transaction[];
  loading?: boolean;
  refreshing?: boolean;
  grouped?: boolean;
  onRefresh?: () => void;
  onTransactionPress?: (transaction: Transaction) => void;
  style?: ViewStyle;
  emptyMessage?: string;
}

/**
 * 트랜잭션 목록 컴포넌트
 * 
 * 트랜잭션 목록을 표시하는 컴포넌트입니다.
 * 트랜잭션 항목들을 리스트 또는 섹션 리스트로 표시하고 새로고침 기능을 제공합니다.
 * 
 * @param transactions 표시할 트랜잭션 목록
 * @param loading 로딩 상태 여부
 * @param refreshing 새로고침 중 상태 여부
 * @param grouped 날짜별 그룹화 사용 여부
 * @param onRefresh 새로고침 이벤트 핸들러
 * @param onTransactionPress 트랜잭션 항목 클릭 이벤트 핸들러
 * @param style 추가 스타일 (ViewStyle)
 * @param emptyMessage 트랜잭션이 없을 때 표시할 메시지
 */
const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  loading = false,
  refreshing = false,
  grouped = true,
  onRefresh,
  onTransactionPress,
  style,
  emptyMessage = '트랜잭션이 없습니다',
}) => {
  const { theme } = useTheme();
  
  // 트랜잭션 항목 클릭 처리
  const handleTransactionPress = (transaction: Transaction) => {
    if (onTransactionPress) {
      onTransactionPress(transaction);
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
  
  // 트랜잭션 항목 렌더링
  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={() => handleTransactionPress(item)}
    />
  );
  
  // 날짜별 섹션 헤더 렌더링
  const renderSectionHeader = ({ section }: { section: TransactionSection }) => (
    <View
      style={[
        styles.sectionHeader,
        {
          backgroundColor: theme.colors.surface,
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      <Text
        style={[
          styles.sectionHeaderText,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
            fontFamily: theme.typography.fontFamily.medium,
          },
        ]}
      >
        {section.title}
      </Text>
    </View>
  );
  
  // 키 추출기
  const keyExtractor = (item: Transaction) => item.id;
  
  // 트랜잭션을 날짜별로 그룹화
  const groupTransactionsByDate = (transactions: Transaction[]): TransactionSection[] => {
    // 날짜별로 트랜잭션 그룹화
    const groupedTransactions: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groupedTransactions[dateKey]) {
        groupedTransactions[dateKey] = [];
      }
      
      groupedTransactions[dateKey].push(transaction);
    });
    
    // 섹션 배열로 변환
    return Object.keys(groupedTransactions).map(dateKey => {
      const date = new Date(dateKey);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let title = format(date, 'yyyy년 M월 d일');
      
      // 오늘, 어제 표시 처리
      if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        title = '오늘';
      } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
        title = '어제';
      }
      
      return {
        title,
        data: groupedTransactions[dateKey],
      };
    }).sort((a, b) => {
      // 최신 날짜가 먼저 오도록 정렬
      const dateA = new Date(a.data[0].timestamp);
      const dateB = new Date(b.data[0].timestamp);
      return dateB.getTime() - dateA.getTime();
    });
  };
  
  // 새로고침 컨트롤
  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[theme.colors.primary]}
      tintColor={theme.colors.primary}
    />
  ) : undefined;
  
  // 그룹화 여부에 따라 적절한 리스트 컴포넌트 렌더링
  if (grouped) {
    const sections = groupTransactionsByDate(transactions);
    
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
        <SectionList
          sections={sections}
          renderItem={renderTransactionItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshControl={refreshControl}
          stickySectionHeadersEnabled={true}
        />
      </View>
    );
  }
  
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
        data={transactions.sort((a, b) => b.timestamp - a.timestamp)} // 최신순 정렬
        renderItem={renderTransactionItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={refreshControl}
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
  sectionHeader: {
    width: '100%',
  },
  sectionHeaderText: {},
});

export default TransactionsList;
