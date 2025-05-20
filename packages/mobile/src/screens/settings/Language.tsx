import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

// 컴포넌트
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';

// 훅
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';

// 유틸리티
import { showToast } from '../../utils/toast';

// 국가 아이콘
const CountryFlags = {
  en: '🇺🇸',  // 영어 - 미국
  ko: '🇰🇷',  // 한국어 - 한국
  ja: '🇯🇵',  // 일본어 - 일본
  'zh-CN': '🇨🇳', // 중국어 간체 - 중국
  'zh-TW': '🇹🇼', // 중국어 번체 - 대만
  vi: '🇻🇳',  // 베트남어 - 베트남
  th: '🇹🇭',  // 태국어 - 태국
};

// 언어 설정 화면
const Language: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 훅 사용
  const { language, setLanguage, supportedLanguages } = useLanguage();
  
  // 상태 관리
  const [loading, setLoading] = useState(false);
  
  // 언어 변경 핸들러
  const handleLanguageChange = async (langCode: string) => {
    if (langCode === language) return;
    
    setLoading(true);
    
    try {
      await setLanguage(langCode);
      showToast(t('languageSettings.languageChanged'), 'success');
    } catch (error) {
      console.error('Error changing language:', error);
      showToast(
        typeof error === 'string' ? error : (error as Error).message,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // 언어 항목 렌더링
  const renderLanguageItem = ({ item }: { item: { code: string; name: string; nativeName: string } }) => {
    const isSelected = item.code === language;
    const flag = CountryFlags[item.code as keyof typeof CountryFlags] || '🌐';
    
    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          isSelected && styles.selectedLanguageItem,
          isSelected && { borderColor: theme.colors.primary }
        ]}
        onPress={() => handleLanguageChange(item.code)}
        disabled={loading}
      >
        <View style={styles.languageItemLeft}>
          <Text style={styles.flagIcon}>{flag}</Text>
          <View style={styles.languageTexts}>
            <Text style={[styles.languageName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.languageNativeName, { color: theme.colors.secondaryText }]}>
              {item.nativeName}
            </Text>
          </View>
        </View>
        
        {isSelected && (
          <Icon name="checkmark-circle" size={24} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('languageSettings.title')}
        onBack={() => navigation.goBack()}
      />
      
      <Card style={styles.infoCard}>
        <Text style={[styles.infoText, { color: theme.colors.text }]}>
          {t('languageSettings.selectLanguage')}
        </Text>
      </Card>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t('languageSettings.changing')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={supportedLanguages}
          renderItem={renderLanguageItem}
          keyExtractor={(item) => item.code}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 15,
  },
  listContent: {
    padding: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  selectedLanguageItem: {
    borderWidth: 1,
  },
  languageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  languageTexts: {
    flexDirection: 'column',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageNativeName: {
    fontSize: 14,
    marginTop: 2,
  },
  separator: {
    height: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
});

export default Language;
