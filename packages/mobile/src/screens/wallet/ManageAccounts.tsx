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
  Platform,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// 컴포넌트
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';

// 훅
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../hooks/useTheme';

// 유틸리티
import { formatAmount } from '../../utils/formatters';
import { truncateAddress } from '../../utils/address';
import { showToast } from '../../utils/toast';

// 타입
import { Account } from '../../types/wallet';

const ManageAccounts: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 훅 사용
  const { 
    wallets, 
    activeWallet, 
    activeAccount, 
    accounts, 
    createAccount, 
    switchAccount, 
    renameAccount,
    importAccount,
    exportPrivateKey,
    getAccountBalance,
    refreshAccounts
  } = useWallet();

  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addAccountLoading, setAddAccountLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [importedAccountName, setImportedAccountName] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  // 계정 목록 가져오기
  const fetchAccounts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      await refreshAccounts();
    } catch (error) {
      console.error('Error fetching accounts:', error);
      showToast(
        typeof error === 'string' ? error : (error as Error).message,
        'error'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshAccounts]);

  // 컴포넌트 마운트 시 계정 목록 가져오기
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // 계정 추가 핸들러
  const handleAddAccount = async () => {
    try {
      setAddAccountLoading(true);
      await createAccount(newAccountName.trim() || undefined);
      setShowAddModal(false);
      setNewAccountName('');
      showToast(t('manageAccounts.accountCreated'), 'success');
    } catch (error) {
      console.error('Error creating account:', error);
      showToast(
        typeof error === 'string' ? error : (error as Error).message,
        'error'
      );
    } finally {
      setAddAccountLoading(false);
    }
  };

  // 계정 가져오기 핸들러
  const handleImportAccount = async () => {
    if (!privateKey.trim()) {
      showToast(t('manageAccounts.emptyPrivateKey'), 'error');
      return;
    }

    try {
      setImportLoading(true);
      await importAccount(privateKey.trim(), importedAccountName.trim() || undefined);
      setShowImportModal(false);
      setPrivateKey('');
      setImportedAccountName('');
      showToast(t('manageAccounts.accountImported'), 'success');
    } catch (error) {
      console.error('Error importing account:', error);
      showToast(
        typeof error === 'string' ? error : (error as Error).message,
        'error'
      );
    } finally {
      setImportLoading(false);
    }
  };

  // 계정 이름 변경 시작
  const startRenameAccount = (account: Account) => {
    setEditingAccount(account);
    setNewAccountName(account.name);
  };

  // 계정 이름 변경 저장
  const saveAccountName = async () => {
    if (!editingAccount) return;
    
    try {
      await renameAccount(editingAccount.address, newAccountName.trim());
      setEditingAccount(null);
      setNewAccountName('');
      showToast(t('manageAccounts.nameUpdated'), 'success');
    } catch (error) {
      console.error('Error renaming account:', error);
      showToast(
        typeof error === 'string' ? error : (error as Error).message,
        'error'
      );
    }
  };

  // 계정 내보내기 핸들러
  const handleExportAccount = (account: Account) => {
    Alert.alert(
      t('manageAccounts.exportTitle'),
      t('manageAccounts.exportMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('manageAccounts.exportConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              const privateKey = await exportPrivateKey(account.address);
              
              // 실제 구현에서는 보안 인증 후 진행
              navigation.navigate('ExportPrivateKey' as never, { 
                privateKey, 
                accountName: account.name,
                address: account.address
              } as never);
            } catch (error) {
              console.error('Error exporting private key:', error);
              showToast(
                typeof error === 'string' ? error : (error as Error).message,
                'error'
              );
            }
          },
        },
      ]
    );
  };

  // 계정 항목 렌더링
  const renderAccountItem = ({ item }: { item: Account }) => {
    const isActive = activeAccount?.address === item.address;
    const balance = getAccountBalance(item.address);

    return (
      <Card
        style={[
          styles.accountCard,
          isActive && styles.activeCard,
          isActive && { borderColor: theme.colors.primary }
        ]}
      >
        <TouchableOpacity
          style={styles.accountContainer}
          onPress={() => switchAccount(item.address)}
          disabled={isActive}
        >
          <View style={styles.accountInfo}>
            <View style={styles.accountHeader}>
              {editingAccount?.address === item.address ? (
                <View style={styles.editNameContainer}>
                  <TextInput
                    style={[styles.accountNameInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={newAccountName}
                    onChangeText={setNewAccountName}
                    placeholder={t('manageAccounts.accountName')}
                    placeholderTextColor={theme.colors.secondaryText}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={saveAccountName}
                    blurOnSubmit={true}
                  />
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={saveAccountName}
                  >
                    <Icon name="checkmark" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.accountNameRow}>
                  <Text style={[styles.accountName, { color: theme.colors.text }]}>
                    {item.name || t('manageAccounts.account')} {item.index + 1}
                  </Text>
                  
                  {isActive && (
                    <View style={[styles.activeTag, { backgroundColor: theme.colors.primary }]}>
                      <Text style={[styles.activeTagText, { color: '#FFFFFF' }]}>
                        {t('manageAccounts.active')}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              <Text style={[styles.accountAddress, { color: theme.colors.secondaryText }]}>
                {truncateAddress(item.address)}
              </Text>
            </View>
            
            <Text style={[styles.accountBalance, { color: theme.colors.text }]}>
              {formatAmount(balance.total, 8)} {balance.symbol}
            </Text>
          </View>
          
          <View style={styles.accountActions}>
            {!editingAccount && (
              <>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => startRenameAccount(item)}
                >
                  <Icon name="pencil" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleExportAccount(item)}
                >
                  <Icon name="key-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  // 로딩 화면 렌더링
  if (loading && !accounts.length) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header
          title={t('manageAccounts.title')}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t('manageAccounts.loading')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('manageAccounts.title')}
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        <View style={styles.walletHeaderContainer}>
          <Text style={[styles.walletName, { color: theme.colors.text }]}>
            {activeWallet?.name || t('manageAccounts.myWallet')}
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { borderColor: theme.colors.border }]}
            onPress={() => setShowAddModal(true)}
          >
            <Icon name="add" size={20} color={theme.colors.primary} />
            <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
              {t('manageAccounts.addAccount')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.accountsCount, { color: theme.colors.secondaryText }]}>
          {t('manageAccounts.accountsCount', { count: accounts.length })}
        </Text>
        
        <FlatList
          data={accounts}
          renderItem={renderAccountItem}
          keyExtractor={(item) => item.address}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
            accounts.length === 0 && styles.emptyListContent
          ]}
          refreshing={refreshing}
          onRefresh={() => fetchAccounts(true)}
          ListEmptyComponent={() => (
            <EmptyState
              icon="wallet-outline"
              title={t('manageAccounts.noAccounts')}
              description={t('manageAccounts.createAccountMessage')}
              action={{
                label: t('manageAccounts.createAccount'),
                onPress: () => setShowAddModal(true),
              }}
            />
          )}
        />
        
        <View style={styles.importButtonContainer}>
          <Button
            title={t('manageAccounts.importAccount')}
            icon="key-outline"
            onPress={() => setShowImportModal(true)}
            variant="secondary"
          />
        </View>
      </View>
      
      {/* 계정 추가 모달 */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowAddModal(false);
          setNewAccountName('');
        }}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.modalBackground }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('manageAccounts.createNewAccount')}
            </Text>
            
            <TextInput
              style={[styles.modalInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={newAccountName}
              onChangeText={setNewAccountName}
              placeholder={t('manageAccounts.accountName')}
              placeholderTextColor={theme.colors.secondaryText}
              autoFocus
            />
            
            <Text style={[styles.modalNote, { color: theme.colors.secondaryText }]}>
              {t('manageAccounts.nameOptional')}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewAccountName('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { backgroundColor: theme.colors.primary }
                ]}
                onPress={handleAddAccount}
                disabled={addAccountLoading}
              >
                {addAccountLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                    {t('manageAccounts.create')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* 계정 가져오기 모달 */}
      <Modal
        visible={showImportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowImportModal(false);
          setPrivateKey('');
          setImportedAccountName('');
        }}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.modalBackground }]}>
          <View style={[styles.modalContent, styles.importModalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('manageAccounts.importAccount')}
            </Text>
            
            <Text style={[styles.modalLabel, { color: theme.colors.text }]}>
              {t('manageAccounts.privateKey')}
            </Text>
            <TextInput
              style={[styles.modalInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={privateKey}
              onChangeText={setPrivateKey}
              placeholder={t('manageAccounts.enterPrivateKey')}
              placeholderTextColor={theme.colors.secondaryText}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <Text style={[styles.modalLabel, { color: theme.colors.text, marginTop: 12 }]}>
              {t('manageAccounts.accountName')} ({t('common.optional')})
            </Text>
            <TextInput
              style={[styles.modalInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={importedAccountName}
              onChangeText={setImportedAccountName}
              placeholder={t('manageAccounts.accountName')}
              placeholderTextColor={theme.colors.secondaryText}
            />
            
            <Text style={[styles.securityWarning, { color: theme.colors.warning }]}>
              <Icon name="warning-outline" size={16} color={theme.colors.warning} /> {t('manageAccounts.securityWarning')}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => {
                  setShowImportModal(false);
                  setPrivateKey('');
                  setImportedAccountName('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { backgroundColor: theme.colors.primary }
                ]}
                onPress={handleImportAccount}
                disabled={importLoading || !privateKey.trim()}
              >
                {importLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                    {t('manageAccounts.import')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  walletHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  accountsCount: {
    fontSize: 14,
    marginBottom: 16,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyListContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  activeCard: {
    borderLeftWidth: 3,
  },
  accountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountHeader: {
    marginBottom: 8,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTag: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  accountAddress: {
    fontSize: 12,
    marginTop: 4,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: '600',
  },
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountNameInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 4,
  },
  saveButton: {
    padding: 8,
    marginLeft: 8,
  },
  importButtonContainer: {
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '90%',
    padding: 24,
    borderRadius: 16,
    elevation: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  importModalContent: {
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  modalNote: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  securityWarning: {
    fontSize: 12,
    marginTop: 16,
    marginBottom: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    marginRight: 8,
  },
  confirmButton: {
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ManageAccounts;
