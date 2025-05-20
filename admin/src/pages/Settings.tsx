import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue
} from '@chakra-ui/react';
import { useSettings } from '@/hooks';
import {
  GeneralSettings,
  SecuritySettings,
  StakingSettings,
  CrosschainSettings,
  DappAndDefiSettings
} from '@/components/settings';
import { SettingCategory } from '@/types';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const {
    generalSettings,
    securitySettings,
    stakingSettings,
    crosschainSettings,
    defiSettings,
    dappSettings,
    loading,
    activeCategory,
    updateGeneralSettings,
    updateSecuritySettings,
    updateStakingSettings,
    updateCrosschainSettings,
    updateDefiSettings,
    updateDappSettings,
    changeActiveCategory,
    fetchGeneralSettings,
    fetchSecuritySettings,
    fetchStakingSettings,
    fetchCrosschainSettings,
    fetchDefiSettings,
    fetchDappSettings
  } = useSettings();
  
  const tabBg = useColorModeValue('white', 'gray.800');
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeBorderColor = useColorModeValue('brand.500', 'brand.200');
  
  const handleTabChange = (index: number) => {
    const categories = [
      SettingCategory.GENERAL,
      SettingCategory.SECURITY,
      SettingCategory.STAKING,
      SettingCategory.CROSSCHAIN,
      'dapp_and_defi' // 이것은 실제 카테고리가 아니라 UI를 위한 값
    ];
    changeActiveCategory(categories[index] as SettingCategory);
  };
  
  const getTabIndex = () => {
    switch (activeCategory) {
      case SettingCategory.GENERAL:
        return 0;
      case SettingCategory.SECURITY:
        return 1;
      case SettingCategory.STAKING:
        return 2;
      case SettingCategory.CROSSCHAIN:
        return 3;
      case SettingCategory.DEFI:
      case SettingCategory.DAPP:
        return 4;
      default:
        return 0;
    }
  };
  
  return (
    <Box>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={6}
        flexDirection={{ base: 'column', md: 'row' }}
        gap={3}
      >
        <Box>
          <Heading as="h1" size="lg">
            {t('settings.title')}
          </Heading>
          <Text color="gray.500">{t('settings.subtitle')}</Text>
        </Box>
      </Flex>
      
      <Tabs
        index={getTabIndex()}
        onChange={handleTabChange}
        variant="enclosed"
        colorScheme="brand"
        isLazy
      >
        <TabList>
          <Tab
            _selected={{
              bg: activeBg,
              borderColor: 'inherit',
              borderBottomColor: activeBorderColor
            }}
            bg={tabBg}
          >
            {t('settings.categories.general')}
          </Tab>
          <Tab
            _selected={{
              bg: activeBg,
              borderColor: 'inherit',
              borderBottomColor: activeBorderColor
            }}
            bg={tabBg}
          >
            {t('settings.categories.security')}
          </Tab>
          <Tab
            _selected={{
              bg: activeBg,
              borderColor: 'inherit',
              borderBottomColor: activeBorderColor
            }}
            bg={tabBg}
          >
            {t('settings.categories.staking')}
          </Tab>
          <Tab
            _selected={{
              bg: activeBg,
              borderColor: 'inherit',
              borderBottomColor: activeBorderColor
            }}
            bg={tabBg}
          >
            {t('settings.categories.crosschain')}
          </Tab>
          <Tab
            _selected={{
              bg: activeBg,
              borderColor: 'inherit',
              borderBottomColor: activeBorderColor
            }}
            bg={tabBg}
          >
            {t('settings.categories.dappAndDefi')}
          </Tab>
        </TabList>
        
        <TabPanels bg={tabBg} borderX={1} borderBottom={1} borderColor="inherit" borderTopRadius={0}>
          <TabPanel>
            <GeneralSettings
              settings={generalSettings}
              onUpdate={updateGeneralSettings}
              isLoading={loading}
            />
          </TabPanel>
          
          <TabPanel>
            <SecuritySettings
              settings={securitySettings}
              onUpdate={updateSecuritySettings}
              isLoading={loading}
            />
          </TabPanel>
          
          <TabPanel>
            <StakingSettings
              settings={stakingSettings}
              onUpdate={updateStakingSettings}
              isLoading={loading}
            />
          </TabPanel>
          
          <TabPanel>
            <CrosschainSettings
              settings={crosschainSettings}
              onUpdate={updateCrosschainSettings}
              isLoading={loading}
            />
          </TabPanel>
          
          <TabPanel>
            <DappAndDefiSettings
              defiSettings={defiSettings}
              dappSettings={dappSettings}
              onUpdateDefi={updateDefiSettings}
              onUpdateDapp={updateDappSettings}
              isLoading={loading}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Settings;
