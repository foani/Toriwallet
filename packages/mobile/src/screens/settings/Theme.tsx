import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  useColorScheme,
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

// 테마 타입
type ThemeOption = 'system' | 'light' | 'dark';

// 테마 컬러 미리보기 컴포넌트
type ColorPreviewProps = {
  label: string;
  color: string;
  isDarkText?: boolean;
};

const ColorPreview: React.FC<ColorPreviewProps> = ({ label, color, isDarkText = false }) => {
  return (
    <View style={[styles.colorPreview, { backgroundColor: color }]}>
      <Text style={[styles.colorLabel, { color: isDarkText ? '#000000' : '#FFFFFF' }]}>
        {label}
      </Text>
    </View>
  );
};

// 테마 설정 화면
const Theme: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isDark, toggleTheme, themeType, setThemeType } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();
  
  // 시스템 테마인지 확인
  const isSystem = themeType === 'system';
  
  // 시스템 테마 사용 여부 변경
  const handleUseSystemTheme = (value: boolean) => {
    setThemeType(value ? 'system' : isDark ? 'dark' : 'light');
  };
  
  // 테마 변경
  const handleThemeChange = (selectedTheme: ThemeOption) => {
    setThemeType(selectedTheme);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('themeSettings.title')}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* 시스템 테마 사용 여부 */}
        <Card style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Icon name="phone-portrait-outline" size={24} color={theme.colors.primary} style={styles.settingIcon} />
              <View style={styles.settingItemTextContainer}>
                <Text style={[styles.settingItemTitle, { color: theme.colors.text }]}>
                  {t('themeSettings.useSystemTheme')}
                </Text>
                <Text style={[styles.settingItemDescription, { color: theme.colors.secondaryText }]}>
                  {t('themeSettings.useSystemThemeDescription')}
                </Text>
              </View>
            </View>
            <Switch
              value={isSystem}
              onValueChange={handleUseSystemTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
              thumbColor={isSystem ? theme.colors.primary : theme.colors.card}
              ios_backgroundColor={theme.colors.border}
            />
          </View>
        </Card>
        
        {/* 테마 선택 옵션 */}
        {!isSystem && (
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('themeSettings.selectTheme')}
            </Text>
            
            <View style={styles.themeOptions}>
              {/* 라이트 테마 */}
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeType === 'light' && [
                    styles.selectedThemeOption,
                    { borderColor: theme.colors.primary }
                  ]
                ]}
                onPress={() => handleThemeChange('light')}
              >
                <View style={[styles.themePreview, styles.lightThemePreview]}>
                  <View style={[styles.previewHeader, { backgroundColor: '#FFFFFF' }]}>
                    <View style={styles.previewHeaderContent}>
                      <View style={[styles.previewDot, { backgroundColor: '#FF605C' }]} />
                      <View style={[styles.previewDot, { backgroundColor: '#FFBD44' }]} />
                      <View style={[styles.previewDot, { backgroundColor: '#00CA4E' }]} />
                    </View>
                  </View>
                  <View style={[styles.previewContent, { backgroundColor: '#F8F9FA' }]}>
                    <View style={[styles.previewCard, { backgroundColor: '#FFFFFF' }]}>
                      <View style={styles.previewItem} />
                      <View style={styles.previewItem} />
                    </View>
                  </View>
                </View>
                
                <View style={styles.themeOptionLabelContainer}>
                  <Icon 
                    name="sunny-outline" 
                    size={20} 
                    color={theme.colors.text} 
                    style={styles.themeOptionIcon} 
                  />
                  <Text style={[styles.themeOptionLabel, { color: theme.colors.text }]}>
                    {t('themeSettings.light')}
                  </Text>
                </View>
                
                {themeType === 'light' && (
                  <Icon name="checkmark-circle" size={24} color={theme.colors.primary} style={styles.selectedIcon} />
                )}
              </TouchableOpacity>
              
              {/* 다크 테마 */}
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeType === 'dark' && [
                    styles.selectedThemeOption,
                    { borderColor: theme.colors.primary }
                  ]
                ]}
                onPress={() => handleThemeChange('dark')}
              >
                <View style={[styles.themePreview, styles.darkThemePreview]}>
                  <View style={[styles.previewHeader, { backgroundColor: '#1E1E1E' }]}>
                    <View style={styles.previewHeaderContent}>
                      <View style={[styles.previewDot, { backgroundColor: '#FF605C' }]} />
                      <View style={[styles.previewDot, { backgroundColor: '#FFBD44' }]} />
                      <View style={[styles.previewDot, { backgroundColor: '#00CA4E' }]} />
                    </View>
                  </View>
                  <View style={[styles.previewContent, { backgroundColor: '#121212' }]}>
                    <View style={[styles.previewCard, { backgroundColor: '#1E1E1E' }]}>
                      <View style={[styles.previewItem, { backgroundColor: '#333333' }]} />
                      <View style={[styles.previewItem, { backgroundColor: '#333333' }]} />
                    </View>
                  </View>
                </View>
                
                <View style={styles.themeOptionLabelContainer}>
                  <Icon 
                    name="moon-outline" 
                    size={20} 
                    color={theme.colors.text} 
                    style={styles.themeOptionIcon} 
                  />
                  <Text style={[styles.themeOptionLabel, { color: theme.colors.text }]}>
                    {t('themeSettings.dark')}
                  </Text>
                </View>
                
                {themeType === 'dark' && (
                  <Icon name="checkmark-circle" size={24} color={theme.colors.primary} style={styles.selectedIcon} />
                )}
              </TouchableOpacity>
            </View>
          </Card>
        )}
        
        {/* 현재 활성화된 테마 정보 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('themeSettings.currentTheme')}
          </Text>
          
          <View style={styles.currentThemeInfo}>
            <Text style={[styles.currentThemeText, { color: theme.colors.text }]}>
              {isSystem 
                ? t('themeSettings.systemControlled', { theme: systemColorScheme === 'dark' ? t('themeSettings.dark') : t('themeSettings.light') })
                : themeType === 'dark' 
                  ? t('themeSettings.dark') 
                  : t('themeSettings.light')}
            </Text>
          </View>
          
          <Text style={[styles.colorPaletteTitle, { color: theme.colors.text }]}>
            {t('themeSettings.colorPalette')}
          </Text>
          
          <View style={styles.colorPalette}>
            <ColorPreview label={t('themeSettings.primary')} color={theme.colors.primary} />
            <ColorPreview label={t('themeSettings.secondary')} color={theme.colors.secondary} />
            <ColorPreview label={t('themeSettings.background')} color={theme.colors.background} isDarkText={!isDark} />
            <ColorPreview label={t('themeSettings.card')} color={theme.colors.card} isDarkText={!isDark} />
            <ColorPreview label={t('themeSettings.text')} color={theme.colors.text} />
            <ColorPreview label={t('themeSettings.border')} color={theme.colors.border} isDarkText={!isDark} />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingItemTextContainer: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingItemDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOption: {
    width: '48%',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    padding: 8,
  },
  selectedThemeOption: {
    borderWidth: 2,
  },
  themePreview: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  lightThemePreview: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  darkThemePreview: {
    borderWidth: 1,
    borderColor: '#333333',
  },
  previewHeader: {
    height: '15%',
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  previewHeaderContent: {
    flexDirection: 'row',
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  previewContent: {
    flex: 1,
    padding: 8,
  },
  previewCard: {
    borderRadius: 6,
    padding: 6,
    flex: 1,
    justifyContent: 'center',
  },
  previewItem: {
    height: 10,
    borderRadius: 3,
    backgroundColor: '#EEEEEE',
    marginBottom: 6,
  },
  themeOptionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionIcon: {
    marginRight: 6,
  },
  themeOptionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  selectedIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  currentThemeInfo: {
    marginBottom: 16,
  },
  currentThemeText: {
    fontSize: 15,
  },
  colorPaletteTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorPreview: {
    width: '30%',
    height: 40,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Theme;
