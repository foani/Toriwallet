import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { WalletStackParamList } from '../../navigation/MainNavigator';
import { useTheme } from '../../hooks/useTheme';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import QRCodeGenerator from '../../components/common/QRCodeGenerator';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Icon from 'react-native-vector-icons/Ionicons';

type ReceiveScreenNavigationProp = StackNavigationProp<
  WalletStackParamList,
  'Receive'
>;

type ReceiveScreenRouteProp = RouteProp<
  WalletStackParamList,
  'Receive'
>;

interface ReceiveScreenProps {
  navigation: ReceiveScreenNavigationProp;
  route: ReceiveScreenRouteProp;
}

/**
 * 자산 수신 화면
 * 
 * 사용자의 지갑 주소를 QR 코드와 함께 표시하여 암호화폐를 받을 수 있는 화면입니다.
 */
const ReceiveScreen: React.FC<ReceiveScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { activeAccount } = useWallet();
  const { activeNetwork } = useNetwork();
  const [copied, setCopied] = useState(false);
  
  // 주소 복사 처리
  const handleCopyAddress = () => {
    if (!activeAccount) return;
    
    Clipboard.setString(activeAccount.address);
    setCopied(true);
    
    // 복사 알림 표시
    Alert.alert('복사됨', '주소가 클립보드에 복사되었습니다.');
    
    // 복사 상태 초기화 (2초 후)
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  // 주소 공유 처리
  const handleShareAddress = () => {
    // 공유 기능은 QRCodeGenerator 컴포넌트에서 처리
  };
  
  // 활성 계정이 없는 경우 로딩 표시
  if (!activeAccount) {
    return <Loading loading message="지갑 정보 로드 중..." />;
  }
  
  // 주소 포맷팅 (4글자 단위로 공백 추가)
  const formatAddress = (address: string) => {
    return address.replace(/(.{4})/g, '$1 ').trim();
  };
  
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Header
        title="자산 받기"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { padding: theme.spacing.md },
        ]}
      >
        <Card
          style={[
            styles.card,
            { padding: theme.spacing.lg },
          ]}
          elevated
        >
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.lg,
                fontFamily: theme.typography.fontFamily.bold,
                marginBottom: theme.spacing.md,
                textAlign: 'center',
              },
            ]}
          >
            {activeAccount.name}
          </Text>
          
          <QRCodeGenerator
            value={activeAccount.address}
            size={200}
            backgroundColor={theme.colors.white}
            color={theme.colors.black}
            label="지갑 주소"
            subLabel={activeNetwork?.name || 'Catena Chain'}
            showShareButton
            showCopyButton
            onCopy={handleCopyAddress}
          />
          
          <View
            style={[
              styles.addressContainer,
              {
                marginTop: theme.spacing.xl,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.md,
              },
            ]}
          >
            <Text
              style={[
                styles.addressLabel,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.sm,
                  fontFamily: theme.typography.fontFamily.medium,
                  marginBottom: theme.spacing.xs,
                },
              ]}
            >
              주소
            </Text>
            
            <Text
              style={[
                styles.address,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.sm,
                  fontFamily: theme.typography.fontFamily.regular,
                  marginBottom: theme.spacing.sm,
                  textAlign: 'center',
                },
              ]}
              selectable
            >
              {formatAddress(activeAccount.address)}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.copyButton,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.sm,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                },
              ]}
              onPress={handleCopyAddress}
            >
              <Icon
                name={copied ? 'checkmark-outline' : 'copy-outline'}
                size={18}
                color={theme.colors.white}
                style={{ marginRight: theme.spacing.xs }}
              />
              <Text
                style={[
                  styles.copyButtonText,
                  {
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSize.sm,
                    fontFamily: theme.typography.fontFamily.medium,
                  },
                ]}
              >
                {copied ? '복사됨' : '주소 복사'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
        
        <View
          style={[
            styles.infoContainer,
            {
              marginTop: theme.spacing.xl,
              padding: theme.spacing.md,
            },
          ]}
        >
          <Text
            style={[
              styles.infoTitle,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.md,
                fontFamily: theme.typography.fontFamily.bold,
                marginBottom: theme.spacing.sm,
              },
            ]}
          >
            이 주소로 받을 수 있는 자산
          </Text>
          
          <View
            style={[
              styles.infoItem,
              {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: theme.spacing.sm,
              },
            ]}
          >
            <Icon
              name="checkmark-circle-outline"
              size={20}
              color={theme.colors.success}
              style={{ marginRight: theme.spacing.sm }}
            />
            
            <Text
              style={[
                styles.infoText,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.md,
                  fontFamily: theme.typography.fontFamily.regular,
                },
              ]}
            >
              {activeNetwork?.name || 'Catena Chain'} 기반 토큰 및 NFT
            </Text>
          </View>
          
          <View
            style={[
              styles.warningContainer,
              {
                backgroundColor: theme.colors.warning + '20',
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                marginTop: theme.spacing.md,
              },
            ]}
          >
            <Icon
              name="warning-outline"
              size={24}
              color={theme.colors.warning}
              style={{ marginBottom: theme.spacing.xs }}
            />
            
            <Text
              style={[
                styles.warningTitle,
                {
                  color: theme.colors.warning,
                  fontSize: theme.typography.fontSize.md,
                  fontFamily: theme.typography.fontFamily.bold,
                  marginBottom: theme.spacing.xs,
                },
              ]}
            >
              주의
            </Text>
            
            <Text
              style={[
                styles.warningText,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.sm,
                  fontFamily: theme.typography.fontFamily.regular,
                },
              ]}
            >
              이 주소는 {activeNetwork?.name || 'Catena Chain'} 네트워크 전용입니다. 다른 블록체인에서 이 주소로 자산을 보내면 영구적으로 손실될 수 있습니다.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  card: {
    alignItems: 'center',
  },
  title: {},
  addressContainer: {},
  addressLabel: {},
  address: {},
  copyButton: {},
  copyButtonText: {},
  infoContainer: {},
  infoTitle: {},
  infoItem: {},
  infoText: {},
  warningContainer: {
    alignItems: 'center',
  },
  warningTitle: {
    textAlign: 'center',
  },
  warningText: {
    textAlign: 'center',
  },
});

export default ReceiveScreen;
