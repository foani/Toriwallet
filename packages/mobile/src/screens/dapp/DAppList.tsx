import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

// 컴포넌트
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';

// 훅
import { useTheme } from '../../hooks/useTheme';
import { useDAppConnector } from '../../hooks/useDAppConnector';

// 타입
import { DApp, DAppCategory } from '../../types/dapp';

// dApp 카테고리 컴포넌트
type DAppCategoryTabProps = {
  category: DAppCategory;
  isSelected: boolean;
  onSelect: (category: DAppCategory) => void;
};

const DAppCategoryTab: React.FC<DAppCategoryTabProps> = ({ category, isSelected, onSelect }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  return (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        isSelected && styles.selectedCategoryTab,
        {
          backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.cardAlt,
          borderColor: isSelected ? theme.colors.primary : 'transparent'
        }
      ]}
      onPress={() => onSelect(category)}
    >
      <Text
        style={[
          styles.categoryTabText,
          { color: isSelected ? theme.colors.primary : theme.colors.secondaryText }
        ]}
      >
        {t(`dappList.categories.${category.toLowerCase()}`)}
      </Text>
    </TouchableOpacity>
  );
};

// dApp 항목 컴포넌트
type DAppItemProps = {
  dapp: DApp;
  onPress: (dapp: DApp) => void;
};

const DAppItem: React.FC<DAppItemProps> = ({ dapp, onPress }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.dappItem, { backgroundColor: theme.colors.card }]}
      onPress={() => onPress(dapp)}
    >
      <Image
        source={{ uri: dapp.iconUrl }}
        style={styles.dappIcon}
        defaultSource={require('../../../assets/images/default-dapp-icon.png')}
      />
      <View style={styles.dappInfo}>
        <Text style={[styles.dappName, { color: theme.colors.text }]}>
          {dapp.name}
        </Text>
        <Text style={[styles.dappDescription, { color: theme.colors.secondaryText }]} numberOfLines={2}>
          {dapp.description}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme.colors.secondaryText} />
    </TouchableOpacity>
  );
};

// dApp 목록 화면
const DAppList: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 훅 사용
  const { fetchDApps, connectedDApps, addRecentDApp } = useDAppConnector();
  
  // 상태 관리
  const [dapps, setDapps] = useState<DApp[]>([]);
  const [filteredDapps, setFilteredDapps] = useState<DApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DAppCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 카테고리 목록
  const categories: DAppCategory[] = [
    'ALL',
    'DEFI',
    'EXCHANGE',
    'GAMES',
    'MARKETPLACE',
    'SOCIAL',
    'UTILITY',
    'FAVORITES'
  ];
  
  // dApp 목록 가져오기
  const loadDApps = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await fetchDApps();
      setDapps(result);
      applyFilters(result, selectedCategory, searchQuery);
    } catch (error) {
      console.error('Error fetching dApps:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchDApps, selectedCategory, searchQuery]);
  
  // 컴포넌트 마운트 시 dApp 목록 가져오기
  useEffect(() => {
    loadDApps();
  }, [loadDApps]);
  
  // 필터 적용
  const applyFilters = (dappList: DApp[], category: DAppCategory, query: string) => {
    let filtered = [...dappList];
    
    // 카테고리 필터
    if (category !== 'ALL') {
      if (category === 'FAVORITES') {
        // 즐겨찾기 필터
        filtered = filtered.filter(dapp => dapp.isFavorite);
      } else {
        // 일반 카테고리 필터
        filtered = filtered.filter(dapp => dapp.category === category);
      }
    }
    
    // 검색어 필터
    if (query.trim()) {
      const normalizedQuery = query.trim().toLowerCase();
      filtered = filtered.filter(dapp => 
        dapp.name.toLowerCase().includes(normalizedQuery) ||
        dapp.description.toLowerCase().includes(normalizedQuery)
      );
    }
    
    setFilteredDapps(filtered);
  };
  
  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: DAppCategory) => {
    setSelectedCategory(category);
    applyFilters(dapps, category, searchQuery);
  };
  
  // 검색어 변경 핸들러
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    applyFilters(dapps, selectedCategory, text);
  };
  
  // dApp 선택 핸들러
  const handleDAppSelect = (dapp: DApp) => {
    // 최근 사용 dApp에 추가
    addRecentDApp(dapp.id);
    
    // dApp 브라우저로 이동
    navigation.navigate('DAppBrowser' as never, {
      url: dapp.url,
      title: dapp.name,
      dappId: dapp.id
    } as never);
  };
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    loadDApps(true);
  };
  
  // 빈 상태 렌더링
  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <EmptyState
        icon="apps-outline"
        title={
          searchQuery
            ? t('dappList.noSearchResults')
            : selectedCategory !== 'ALL'
              ? t('dappList.noDAppsInCategory')
              : t('dappList.noDApps')
        }
        description={
          searchQuery
            ? t('dappList.tryDifferentSearch')
            : selectedCategory !== 'ALL'
              ? t('dappList.tryDifferentCategory')
              : t('dappList.exploreDApps')
        }
      />
    );
  };
  
  // 로딩 렌더링
  const renderLoading = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  };
  
  // 카테고리 탭 렌더링
  const renderCategoryTabs = () => {
    return (
      <View style={styles.categoryTabsContainer}>
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <DAppCategoryTab
              category={item}
              isSelected={selectedCategory === item}
              onSelect={handleCategoryChange}
            />
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsContent}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('dappList.title')}
        onBack={() => navigation.goBack()}
      />
      
      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.cardAlt }]}>
          <Icon name="search" size={20} color={theme.colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder={t('dappList.searchPlaceholder')}
            placeholderTextColor={theme.colors.secondaryText}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => handleSearchChange('')}
            >
              <Icon name="close-circle" size={16} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* 카테고리 탭 */}
      {renderCategoryTabs()}
      
      {/* dApp 목록 */}
      <FlatList
        data={filteredDapps}
        renderItem={({ item }) => <DAppItem dapp={item} onPress={handleDAppSelect} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 },
          filteredDapps.length === 0 && { flex: 1 }
        ]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoading}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      {/* 최근 사용 dApp */}
      {connectedDApps.length > 0 && selectedCategory === 'ALL' && !searchQuery && (
        <Card style={[styles.recentSection, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.recentTitle, { color: theme.colors.text }]}>
            {t('dappList.recentlyConnected')}
          </Text>
          <View style={styles.recentList}>
            {connectedDApps.slice(0, 4).map((dapp) => (
              <TouchableOpacity
                key={dapp.id}
                style={styles.recentItem}
                onPress={() => handleDAppSelect(dapp)}
              >
                <Image
                  source={{ uri: dapp.iconUrl }}
                  style={styles.recentIcon}
                  defaultSource={require('../../../assets/images/default-dapp-icon.png')}
                />
                <Text style={[styles.recentName, { color: theme.colors.text }]} numberOfLines={1}>
                  {dapp.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  categoryTabsContainer: {
    height: 44,
    marginBottom: 8,
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  selectedCategoryTab: {
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  dappItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  dappIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  dappInfo: {
    flex: 1,
  },
  dappName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  dappDescription: {
    fontSize: 14,
  },
  separator: {
    height: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  recentSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recentItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 4,
  },
  recentName: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default DAppList;
