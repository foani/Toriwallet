import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { format } from 'date-fns';
import { ko, ja, enUS, zhCN, vi, th } from 'date-fns/locale';

// 컴포넌트
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';

// 훅
import { useTheme } from '../../hooks/useTheme';
import { useBrowserHistory } from '../../hooks/useBrowserHistory';
import { useLanguage } from '../../hooks/useLanguage';

// 타입
import { BrowserHistoryItem } from '../../types/dapp';

// 방문 기록 항목 컴포넌트
type HistoryItemProps = {
  item: BrowserHistoryItem;
  onPress: (item: BrowserHistoryItem) => void;
};

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onPress }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: theme.colors.card }]}
      onPress={() => onPress(item)}
    >
      <Icon 
        name="time-outline" 
        size={20} 
        color={theme.colors.primary}
        style={styles.historyIcon}
      />
      <View style={styles.historyInfo}>
        <Text style={[styles.historyTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {item.title || item.url}
        </Text>
        <Text style={[styles.historyUrl, { color: theme.colors.secondaryText }]} numberOfLines={1}>
          {item.url}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// 숨겨진 항목 컴포넌트 (스와이프 액션용)
type HiddenItemProps = {
  onDelete: () => void;
};

const HiddenItem: React.FC<HiddenItemProps> = ({ onDelete }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.hiddenItemContainer, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity 
        style={[styles.hiddenButton, { backgroundColor: theme.colors.error }]}
        onPress={onDelete}
      >
        <Icon name="trash" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

// 방문 날짜 헤더 컴포넌트
type DateHeaderProps = {
  date: string;
};

const DateHeader: React.FC<DateHeaderProps> = ({ date }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  // 날짜 로케일 매핑
  const localeMap: Record<string, Locale> = {
    en: enUS,
    ko,
    ja,
    'zh-CN': zhCN,
    'zh-TW': zhCN, // 번체중국어는 간체 로케일 사용
    vi,
    th
  };
  
  const locale = localeMap[language] || enUS;
  
  // 오늘, 어제, 이번 주, 이전 날짜 구분
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const headerDate = new Date(date);
  const isToday = headerDate.toDateString() === today.toDateString();
  const isYesterday = headerDate.toDateString() === yesterday.toDateString();
  
  let displayDate;
  if (isToday) {
    displayDate = t('browserHistory.today');
  } else if (isYesterday) {
    displayDate = t('browserHistory.yesterday');
  } else {
    displayDate = format(headerDate, 'PPP', { locale });
  }
  
  return (
    <View style={[styles.dateHeader, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.dateHeaderText, { color: theme.colors.text }]}>
        {displayDate}
      </Text>
    </View>
  );
};

// 방문 기록 화면
const BrowserHistory: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 훅 사용
  const { 
    history, 
    fetchHistory, 
    deleteHistoryItem, 
    clearHistory,
    isLoading
  } = useBrowserHistory();
  
  // 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<BrowserHistoryItem[]>([]);
  const [groupedHistory, setGroupedHistory] = useState<{[key: string]: BrowserHistoryItem[]}>({});
  
  // 방문 기록 가져오기
  const loadHistory = useCallback(async () => {
    try {
      await fetchHistory();
    } catch (error) {
      console.error('Error fetching browser history:', error);
    }
  }, [fetchHistory]);
  
  // 컴포넌트 마운트 시 방문 기록 가져오기
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);
  
  // 검색어 변경 시 필터링
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      setFilteredHistory(
        history.filter(
          item => 
            (item.title?.toLowerCase()?.includes(query) || false) ||
            item.url.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredHistory(history);
    }
  }, [searchQuery, history]);
  
  // 기록 그룹화 (날짜별)
  useEffect(() => {
    const grouped: {[key: string]: BrowserHistoryItem[]} = {};
    
    filteredHistory.forEach(item => {
      // 날짜 부분만 추출 (시간 제외)
      const dateString = new Date(item.timestamp).toISOString().split('T')[0];
      
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      
      grouped[dateString].push(item);
    });
    
    // 날짜순으로 정렬 (최신순)
    const sortedGrouped: {[key: string]: BrowserHistoryItem[]} = {};
    Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .forEach(key => {
        sortedGrouped[key] = grouped[key];
      });
    
    setGroupedHistory(sortedGrouped);
  }, [filteredHistory]);
  
  // 기록 항목 선택 핸들러
  const handleHistoryItemPress = (item: BrowserHistoryItem) => {
    navigation.navigate('DAppBrowser' as never, { url: item.url } as never);
  };
  
  // 기록 항목 삭제 핸들러
  const handleDeleteHistoryItem = (item: BrowserHistoryItem) => {
    deleteHistoryItem(item.id);
  };
  
  // 기록 전체 삭제 핸들러
  const handleClearHistory = () => {
    Alert.alert(
      t('browserHistory.clearHistoryTitle'),
      t('browserHistory.clearHistoryMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('browserHistory.clearHistory'),
          style: 'destructive',
          onPress: () => {
            clearHistory();
            setSearchQuery('');
          }
        }
      ]
    );
  };
  
  // 검색 핸들러
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };
  
  // 검색 취소 핸들러
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // 빈 상태 렌더링
  const renderEmptyState = () => {
    if (isLoading) return null;
    
    const isSearch = searchQuery.trim().length > 0;
    
    return (
      <EmptyState
        icon={isSearch ? 'search' : 'time-outline'}
        title={
          isSearch
            ? t('browserHistory.noSearchResults')
            : t('browserHistory.noHistory')
        }
        description={
          isSearch
            ? t('browserHistory.tryDifferentSearch')
            : t('browserHistory.browseToSeeHistory')
        }
      />
    );
  };
  
  // 로딩 인디케이터 렌더링
  const renderLoading = () => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  };
  
  // 데이터 준비
  const renderData = () => {
    // 데이터를 플랫하게 만들기
    const data: any[] = [];
    
    Object.keys(groupedHistory).forEach(date => {
      // 날짜 헤더 추가
      data.push({ id: `header-${date}`, type: 'header', date });
      
      // 해당 날짜의 방문 기록 추가
      groupedHistory[date].forEach(item => {
        data.push({ id: item.id, type: 'item', data: item });
      });
    });
    
    return data;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('browserHistory.title')}
        onBack={() => navigation.goBack()}
        rightIcon={
          history.length > 0 ? (
            <TouchableOpacity style={styles.headerButton} onPress={handleClearHistory}>
              <Icon name="trash-outline" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          ) : undefined
        }
      />
      
      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.cardAlt }]}>
          <Icon name="search" size={20} color={theme.colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder={t('browserHistory.searchPlaceholder')}
            placeholderTextColor={theme.colors.secondaryText}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearSearch}
            >
              <Icon name="close-circle" size={16} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* 방문 기록 목록 */}
      {isLoading ? (
        renderLoading()
      ) : (
        <SwipeListView
          data={renderData()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => 
            item.type === 'header' ? (
              <DateHeader date={item.date} />
            ) : (
              <HistoryItem
                item={item.data}
                onPress={handleHistoryItemPress}
              />
            )
          }
          renderHiddenItem={({ item }) => 
            item.type === 'item' ? (
              <HiddenItem
                onDelete={() => handleDeleteHistoryItem(item.data)}
              />
            ) : null
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
            filteredHistory.length === 0 && { flex: 1 }
          ]}
          ListEmptyComponent={renderEmptyState()}
          rightOpenValue={-80}
          disableRightSwipe
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  dateHeader: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  historyIcon: {
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  historyUrl: {
    fontSize: 12,
    marginTop: 2,
  },
  separator: {
    height: 8,
  },
  hiddenItemContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
    paddingRight: 16,
  },
  hiddenButton: {
    width: 70,
    height: '80%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BrowserHistory;
