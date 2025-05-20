import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { SwipeListView } from 'react-native-swipe-list-view';

// 컴포넌트
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

// 훅
import { useTheme } from '../../hooks/useTheme';
import { useBrowserBookmarks } from '../../hooks/useBrowserBookmarks';

// 타입
import { Bookmark, BookmarkFolder } from '../../types/dapp';

// 북마크 항목 컴포넌트
type BookmarkItemProps = {
  bookmark: Bookmark;
  onPress: (bookmark: Bookmark) => void;
};

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, onPress }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.bookmarkItem, { backgroundColor: theme.colors.card }]}
      onPress={() => onPress(bookmark)}
    >
      <Icon 
        name="globe-outline" 
        size={20} 
        color={theme.colors.primary}
        style={styles.bookmarkIcon}
      />
      <View style={styles.bookmarkInfo}>
        <Text style={[styles.bookmarkTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {bookmark.title}
        </Text>
        <Text style={[styles.bookmarkUrl, { color: theme.colors.secondaryText }]} numberOfLines={1}>
          {bookmark.url}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// 폴더 항목 컴포넌트
type FolderItemProps = {
  folder: BookmarkFolder;
  onPress: (folder: BookmarkFolder) => void;
};

const FolderItem: React.FC<FolderItemProps> = ({ folder, onPress }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.folderItem, { backgroundColor: theme.colors.card }]}
      onPress={() => onPress(folder)}
    >
      <Icon 
        name="folder-outline" 
        size={24} 
        color={theme.colors.primary}
        style={styles.folderIcon}
      />
      <View style={styles.folderInfo}>
        <Text style={[styles.folderTitle, { color: theme.colors.text }]}>
          {folder.name}
        </Text>
        <Text style={[styles.folderItemCount, { color: theme.colors.secondaryText }]}>
          {folder.bookmarks.length} 항목
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme.colors.secondaryText} />
    </TouchableOpacity>
  );
};

// 숨겨진 항목 컴포넌트 (스와이프 액션용)
type HiddenItemProps = {
  onEdit: () => void;
  onDelete: () => void;
};

const HiddenItem: React.FC<HiddenItemProps> = ({ onEdit, onDelete }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.hiddenItemContainer, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity 
        style={[styles.hiddenButton, styles.editButton, { backgroundColor: theme.colors.primary }]}
        onPress={onEdit}
      >
        <Icon name="pencil" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.hiddenButton, styles.deleteButton, { backgroundColor: theme.colors.error }]}
        onPress={onDelete}
      >
        <Icon name="trash" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

// 북마크 화면
const Bookmarks: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 훅 사용
  const { 
    bookmarks, 
    folders, 
    currentFolder,
    fetchBookmarks, 
    addBookmark, 
    updateBookmark,
    deleteBookmark,
    addFolder,
    updateFolder,
    deleteFolder,
    navigateToFolder,
    navigateUp
  } = useBrowserBookmarks();
  
  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showEditBookmarkModal, setShowEditBookmarkModal] = useState(false);
  const [showEditFolderModal, setShowEditFolderModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUrl, setModalUrl] = useState('');
  const [modalFolderName, setModalFolderName] = useState('');
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<BookmarkFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<BookmarkFolder[]>([]);
  
  // 북마크 및 폴더 목록 가져오기
  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      await fetchBookmarks();
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchBookmarks]);
  
  // 컴포넌트 마운트 시 북마크 목록 가져오기
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);
  
  // 검색어 변경 시 필터링
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      setFilteredBookmarks(
        bookmarks.filter(
          bookmark => 
            bookmark.title.toLowerCase().includes(query) ||
            bookmark.url.toLowerCase().includes(query)
        )
      );
      setFilteredFolders(
        folders.filter(
          folder => folder.name.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredBookmarks(bookmarks);
      setFilteredFolders(folders);
    }
  }, [searchQuery, bookmarks, folders]);
  
  // 북마크 선택 핸들러
  const handleBookmarkPress = (bookmark: Bookmark) => {
    navigation.navigate('DAppBrowser' as never, { url: bookmark.url } as never);
  };
  
  // 폴더 선택 핸들러
  const handleFolderPress = (folder: BookmarkFolder) => {
    navigateToFolder(folder.id);
  };
  
  // 북마크 추가 모달 표시
  const showAddBookmark = () => {
    setModalTitle('');
    setModalUrl('');
    setShowAddBookmarkModal(true);
  };
  
  // 북마크 수정 모달 표시
  const showEditBookmark = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark);
    setModalTitle(bookmark.title);
    setModalUrl(bookmark.url);
    setShowEditBookmarkModal(true);
  };
  
  // 폴더 추가 모달 표시
  const showAddFolder = () => {
    setModalFolderName('');
    setShowAddFolderModal(true);
  };
  
  // 폴더 수정 모달 표시
  const showEditFolder = (folder: BookmarkFolder) => {
    setSelectedFolder(folder);
    setModalFolderName(folder.name);
    setShowEditFolderModal(true);
  };
  
  // 북마크 추가 처리
  const handleAddBookmark = async () => {
    if (!modalTitle.trim() || !modalUrl.trim()) {
      Alert.alert(
        t('bookmarks.error'),
        t('bookmarks.emptyFields'),
        [{ text: t('common.ok') }]
      );
      return;
    }
    
    try {
      await addBookmark({
        title: modalTitle.trim(),
        url: modalUrl.trim(),
        folderId: currentFolder?.id
      });
      setShowAddBookmarkModal(false);
    } catch (error) {
      console.error('Error adding bookmark:', error);
      Alert.alert(
        t('bookmarks.error'),
        typeof error === 'string' ? error : (error as Error).message,
        [{ text: t('common.ok') }]
      );
    }
  };
  
  // 북마크 수정 처리
  const handleEditBookmark = async () => {
    if (!selectedBookmark) return;
    
    if (!modalTitle.trim() || !modalUrl.trim()) {
      Alert.alert(
        t('bookmarks.error'),
        t('bookmarks.emptyFields'),
        [{ text: t('common.ok') }]
      );
      return;
    }
    
    try {
      await updateBookmark({
        ...selectedBookmark,
        title: modalTitle.trim(),
        url: modalUrl.trim()
      });
      setShowEditBookmarkModal(false);
      setSelectedBookmark(null);
    } catch (error) {
      console.error('Error updating bookmark:', error);
      Alert.alert(
        t('bookmarks.error'),
        typeof error === 'string' ? error : (error as Error).message,
        [{ text: t('common.ok') }]
      );
    }
  };
  
  // 북마크 삭제 처리
  const handleDeleteBookmark = (bookmark: Bookmark) => {
    Alert.alert(
      t('bookmarks.deleteBookmarkTitle'),
      t('bookmarks.deleteBookmarkMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('bookmarks.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBookmark(bookmark.id);
            } catch (error) {
              console.error('Error deleting bookmark:', error);
              Alert.alert(
                t('bookmarks.error'),
                typeof error === 'string' ? error : (error as Error).message,
                [{ text: t('common.ok') }]
              );
            }
          }
        }
      ]
    );
  };
  
  // 폴더 추가 처리
  const handleAddFolder = async () => {
    if (!modalFolderName.trim()) {
      Alert.alert(
        t('bookmarks.error'),
        t('bookmarks.emptyFolderName'),
        [{ text: t('common.ok') }]
      );
      return;
    }
    
    try {
      await addFolder({
        name: modalFolderName.trim(),
        parentId: currentFolder?.id
      });
      setShowAddFolderModal(false);
    } catch (error) {
      console.error('Error adding folder:', error);
      Alert.alert(
        t('bookmarks.error'),
        typeof error === 'string' ? error : (error as Error).message,
        [{ text: t('common.ok') }]
      );
    }
  };
  
  // 폴더 수정 처리
  const handleEditFolder = async () => {
    if (!selectedFolder) return;
    
    if (!modalFolderName.trim()) {
      Alert.alert(
        t('bookmarks.error'),
        t('bookmarks.emptyFolderName'),
        [{ text: t('common.ok') }]
      );
      return;
    }
    
    try {
      await updateFolder({
        ...selectedFolder,
        name: modalFolderName.trim()
      });
      setShowEditFolderModal(false);
      setSelectedFolder(null);
    } catch (error) {
      console.error('Error updating folder:', error);
      Alert.alert(
        t('bookmarks.error'),
        typeof error === 'string' ? error : (error as Error).message,
        [{ text: t('common.ok') }]
      );
    }
  };
  
  // 폴더 삭제 처리
  const handleDeleteFolder = (folder: BookmarkFolder) => {
    Alert.alert(
      t('bookmarks.deleteFolderTitle'),
      t('bookmarks.deleteFolderMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('bookmarks.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFolder(folder.id);
            } catch (error) {
              console.error('Error deleting folder:', error);
              Alert.alert(
                t('bookmarks.error'),
                typeof error === 'string' ? error : (error as Error).message,
                [{ text: t('common.ok') }]
              );
            }
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
    if (loading) return null;
    
    const isSearch = searchQuery.trim().length > 0;
    
    return (
      <EmptyState
        icon={isSearch ? 'search' : 'bookmark-outline'}
        title={
          isSearch
            ? t('bookmarks.noSearchResults')
            : currentFolder
              ? t('bookmarks.emptyFolder')
              : t('bookmarks.noBookmarks')
        }
        description={
          isSearch
            ? t('bookmarks.tryDifferentSearch')
            : t('bookmarks.addYourFirstBookmark')
        }
        action={{
          label: t('bookmarks.addBookmark'),
          onPress: showAddBookmark
        }}
      />
    );
  };
  
  // 로딩 인디케이터 렌더링
  const renderLoading = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  };
  
  // 폴더 경로 렌더링
  const renderFolderPath = () => {
    if (!currentFolder) return null;
    
    return (
      <View style={[styles.folderPath, { backgroundColor: theme.colors.cardAlt }]}>
        <TouchableOpacity
          style={styles.folderPathItem}
          onPress={navigateUp}
        >
          <Icon name="arrow-back" size={16} color={theme.colors.primary} />
          <Text style={[styles.folderPathText, { color: theme.colors.primary }]}>
            {currentFolder?.name || t('bookmarks.back')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('bookmarks.title')}
        onBack={() => navigation.goBack()}
        rightIcon={
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={showAddFolder}>
              <Icon name="folder-outline" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={showAddBookmark}>
              <Icon name="add" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
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
            placeholder={t('bookmarks.searchPlaceholder')}
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
      
      {/* 폴더 경로 */}
      {renderFolderPath()}
      
      {/* 북마크 및 폴더 목록 */}
      {loading ? (
        renderLoading()
      ) : (
        <SwipeListView
          data={[
            ...(searchQuery ? filteredFolders : folders).map(folder => ({ type: 'folder', data: folder })),
            ...(searchQuery ? filteredBookmarks : bookmarks).map(bookmark => ({ type: 'bookmark', data: bookmark }))
          ]}
          keyExtractor={(item) => `${item.type}-${item.type === 'folder' ? item.data.id : item.data.id}`}
          renderItem={({ item }) => 
            item.type === 'folder' ? (
              <FolderItem
                folder={item.data as BookmarkFolder}
                onPress={handleFolderPress}
              />
            ) : (
              <BookmarkItem
                bookmark={item.data as Bookmark}
                onPress={handleBookmarkPress}
              />
            )
          }
          renderHiddenItem={({ item }) => (
            <HiddenItem
              onEdit={() => 
                item.type === 'folder' 
                  ? showEditFolder(item.data as BookmarkFolder) 
                  : showEditBookmark(item.data as Bookmark)
              }
              onDelete={() => 
                item.type === 'folder' 
                  ? handleDeleteFolder(item.data as BookmarkFolder) 
                  : handleDeleteBookmark(item.data as Bookmark)
              }
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
            ((searchQuery ? filteredFolders.length : folders.length) + 
             (searchQuery ? filteredBookmarks.length : bookmarks.length)) === 0 && 
            { flex: 1 }
          ]}
          ListEmptyComponent={renderEmptyState()}
          rightOpenValue={-160}
          disableRightSwipe
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
      
      {/* 북마크 추가 모달 */}
      <Modal
        visible={showAddBookmarkModal}
        onClose={() => setShowAddBookmarkModal(false)}
        title={t('bookmarks.addBookmark')}
      >
        <View style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('bookmarks.title')}
            </Text>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.cardAlt,
                borderColor: theme.colors.border
              }]}
              value={modalTitle}
              onChangeText={setModalTitle}
              placeholder={t('bookmarks.titlePlaceholder')}
              placeholderTextColor={theme.colors.secondaryText}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('bookmarks.url')}
            </Text>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.cardAlt,
                borderColor: theme.colors.border
              }]}
              value={modalUrl}
              onChangeText={setModalUrl}
              placeholder={t('bookmarks.urlPlaceholder')}
              placeholderTextColor={theme.colors.secondaryText}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
          
          <View style={styles.modalButtons}>
            <Button
              title={t('common.cancel')}
              onPress={() => setShowAddBookmarkModal(false)}
              variant="secondary"
              style={styles.modalButton}
            />
            
            <Button
              title={t('bookmarks.add')}
              onPress={handleAddBookmark}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
      
      {/* 북마크 수정 모달 */}
      <Modal
        visible={showEditBookmarkModal}
        onClose={() => {
          setShowEditBookmarkModal(false);
          setSelectedBookmark(null);
        }}
        title={t('bookmarks.editBookmark')}
      >
        <View style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('bookmarks.title')}
            </Text>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.cardAlt,
                borderColor: theme.colors.border
              }]}
              value={modalTitle}
              onChangeText={setModalTitle}
              placeholder={t('bookmarks.titlePlaceholder')}
              placeholderTextColor={theme.colors.secondaryText}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('bookmarks.url')}
            </Text>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.cardAlt,
                borderColor: theme.colors.border
              }]}
              value={modalUrl}
              onChangeText={setModalUrl}
              placeholder={t('bookmarks.urlPlaceholder')}
              placeholderTextColor={theme.colors.secondaryText}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
          
          <View style={styles.modalButtons}>
            <Button
              title={t('common.cancel')}
              onPress={() => {
                setShowEditBookmarkModal(false);
                setSelectedBookmark(null);
              }}
              variant="secondary"
              style={styles.modalButton}
            />
            
            <Button
              title={t('common.save')}
              onPress={handleEditBookmark}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
      
      {/* 폴더 추가 모달 */}
      <Modal
        visible={showAddFolderModal}
        onClose={() => setShowAddFolderModal(false)}
        title={t('bookmarks.addFolder')}
      >
        <View style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('bookmarks.folderName')}
            </Text>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.cardAlt,
                borderColor: theme.colors.border
              }]}
              value={modalFolderName}
              onChangeText={setModalFolderName}
              placeholder={t('bookmarks.folderNamePlaceholder')}
              placeholderTextColor={theme.colors.secondaryText}
            />
          </View>
          
          <View style={styles.modalButtons}>
            <Button
              title={t('common.cancel')}
              onPress={() => setShowAddFolderModal(false)}
              variant="secondary"
              style={styles.modalButton}
            />
            
            <Button
              title={t('bookmarks.add')}
              onPress={handleAddFolder}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
      
      {/* 폴더 수정 모달 */}
      <Modal
        visible={showEditFolderModal}
        onClose={() => {
          setShowEditFolderModal(false);
          setSelectedFolder(null);
        }}
        title={t('bookmarks.editFolder')}
      >
        <View style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('bookmarks.folderName')}
            </Text>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.cardAlt,
                borderColor: theme.colors.border
              }]}
              value={modalFolderName}
              onChangeText={setModalFolderName}
              placeholder={t('bookmarks.folderNamePlaceholder')}
              placeholderTextColor={theme.colors.secondaryText}
            />
          </View>
          
          <View style={styles.modalButtons}>
            <Button
              title={t('common.cancel')}
              onPress={() => {
                setShowEditFolderModal(false);
                setSelectedFolder(null);
              }}
              variant="secondary"
              style={styles.modalButton}
            />
            
            <Button
              title={t('common.save')}
              onPress={handleEditFolder}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
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
  folderPath: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  folderPathItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderPathText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  folderIcon: {
    marginRight: 12,
  },
  folderInfo: {
    flex: 1,
  },
  folderTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  folderItemCount: {
    fontSize: 12,
    marginTop: 2,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  bookmarkIcon: {
    marginRight: 12,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  bookmarkUrl: {
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
    marginLeft: 8,
  },
  editButton: {},
  deleteButton: {},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 16,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default Bookmarks;
