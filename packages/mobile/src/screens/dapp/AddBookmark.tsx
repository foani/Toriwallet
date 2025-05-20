import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

// 컴포넌트
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

// 훅
import { useTheme } from '../../hooks/useTheme';
import { useBrowserBookmarks } from '../../hooks/useBrowserBookmarks';

// 타입
import { BookmarkFolder } from '../../types/dapp';

type AddBookmarkParams = {
  AddBookmark: {
    url: string;
    title: string;
  };
};

// 폴더 선택 항목 컴포넌트
type FolderItemProps = {
  folder: BookmarkFolder;
  isSelected: boolean;
  onSelect: (folder: BookmarkFolder) => void;
  level?: number;
};

const FolderItem: React.FC<FolderItemProps> = ({ 
  folder, 
  isSelected, 
  onSelect,
  level = 0
}) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.folderItem,
        { 
          paddingLeft: 16 + level * 16,
          backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.card
        }
      ]}
      onPress={() => onSelect(folder)}
    >
      <Icon 
        name="folder-outline" 
        size={20} 
        color={isSelected ? theme.colors.primary : theme.colors.text}
        style={styles.folderIcon}
      />
      <Text 
        style={[
          styles.folderName, 
          { 
            color: isSelected ? theme.colors.primary : theme.colors.text,
            fontWeight: isSelected ? '600' : 'normal'
          }
        ]}
      >
        {folder.name}
      </Text>
      
      {isSelected && (
        <Icon name="checkmark" size={20} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );
};

// 북마크 추가 화면
const AddBookmark: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AddBookmarkParams, 'AddBookmark'>>();
  const insets = useSafeAreaInsets();
  
  // 훅 사용
  const { 
    folders, 
    addBookmark, 
    fetchBookmarks 
  } = useBrowserBookmarks();
  
  // 상태 관리
  const [title, setTitle] = useState(route.params?.title || '');
  const [url, setUrl] = useState(route.params?.url || '');
  const [selectedFolder, setSelectedFolder] = useState<BookmarkFolder | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // 컴포넌트 마운트 시 북마크 폴더 가져오기
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);
  
  // 폼 유효성 검사
  useEffect(() => {
    setIsFormValid(!!title.trim() && !!url.trim());
  }, [title, url]);
  
  // 북마크 저장 핸들러
  const handleSave = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    
    try {
      await addBookmark({
        title: title.trim(),
        url: url.trim(),
        folderId: selectedFolder?.id
      });
      
      navigation.goBack();
    } catch (error) {
      console.error('Error adding bookmark:', error);
      Alert.alert(
        t('addBookmark.error'),
        typeof error === 'string' ? error : (error as Error).message,
        [{ text: t('common.ok') }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  // 폴더 선택 핸들러
  const handleSelectFolder = (folder: BookmarkFolder) => {
    setSelectedFolder(folder.id === selectedFolder?.id ? null : folder);
  };
  
  // 재귀적으로 폴더 트리 렌더링
  const renderFolders = (folderList: BookmarkFolder[], level = 0) => {
    return folderList.map(folder => (
      <React.Fragment key={folder.id}>
        <FolderItem
          folder={folder}
          isSelected={selectedFolder?.id === folder.id}
          onSelect={handleSelectFolder}
          level={level}
        />
        {folder.subFolders && folder.subFolders.length > 0 && (
          renderFolders(folder.subFolders, level + 1)
        )}
      </React.Fragment>
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('addBookmark.title')}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        <Card style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('addBookmark.name')}
            </Text>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.cardAlt,
                borderColor: theme.colors.border
              }]}
              value={title}
              onChangeText={setTitle}
              placeholder={t('addBookmark.namePlaceholder')}
              placeholderTextColor={theme.colors.secondaryText}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('addBookmark.url')}
            </Text>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.cardAlt,
                borderColor: theme.colors.border
              }]}
              value={url}
              onChangeText={setUrl}
              placeholder={t('addBookmark.urlPlaceholder')}
              placeholderTextColor={theme.colors.secondaryText}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </Card>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('addBookmark.selectFolder')}
        </Text>
        
        <Card style={styles.foldersCard}>
          <TouchableOpacity
            style={[
              styles.folderItem,
              { 
                backgroundColor: selectedFolder === null ? theme.colors.primary + '20' : theme.colors.card
              }
            ]}
            onPress={() => setSelectedFolder(null)}
          >
            <Icon 
              name="home-outline" 
              size={20} 
              color={selectedFolder === null ? theme.colors.primary : theme.colors.text}
              style={styles.folderIcon}
            />
            <Text 
              style={[
                styles.folderName, 
                { 
                  color: selectedFolder === null ? theme.colors.primary : theme.colors.text,
                  fontWeight: selectedFolder === null ? '600' : 'normal'
                }
              ]}
            >
              {t('addBookmark.rootFolder')}
            </Text>
            
            {selectedFolder === null && (
              <Icon name="checkmark" size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
          
          {renderFolders(folders)}
        </Card>
        
        <Button
          title={loading ? '' : t('addBookmark.save')}
          onPress={handleSave}
          disabled={loading || !isFormValid}
          style={styles.saveButton}
        >
          {loading && <ActivityIndicator color="#FFFFFF" size="small" />}
        </Button>
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
  formCard: {
    padding: 16,
    borderRadius: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  foldersCard: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 0,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
  },
  folderIcon: {
    marginRight: 12,
  },
  folderName: {
    fontSize: 15,
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
  },
});

export default AddBookmark;
