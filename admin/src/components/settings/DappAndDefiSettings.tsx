import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Button,
  Flex,
  Box,
  Text,
  useToast,
  FormErrorMessage,
  SimpleGrid,
  Divider,
  HStack,
  IconButton,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, InfoIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Card } from '@/components/common';
import { DefiSettings, DappSettings } from '@/types';
import { useTranslation } from 'react-i18next';

interface DappAndDefiSettingsProps {
  defiSettings: DefiSettings | null;
  dappSettings: DappSettings | null;
  onUpdateDefi: (settings: Partial<DefiSettings>) => Promise<boolean>;
  onUpdateDapp: (settings: Partial<DappSettings>) => Promise<boolean>;
  isLoading: boolean;
}

const DappAndDefiSettings: React.FC<DappAndDefiSettingsProps> = ({
  defiSettings,
  dappSettings,
  onUpdateDefi,
  onUpdateDapp,
  isLoading
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // DeFi 설정 관련 state
  const [localDefiSettings, setLocalDefiSettings] = useState<DefiSettings | null>(defiSettings);
  const [newProtocol, setNewProtocol] = useState<string>('');
  
  // dApp 설정 관련 state
  const [localDappSettings, setLocalDappSettings] = useState<DappSettings | null>(dappSettings);
  const [newCategory, setNewCategory] = useState<string>('');
  const [newDapp, setNewDapp] = useState<string>('');
  const [newDomain, setNewDomain] = useState<string>('');
  const [domainType, setDomainType] = useState<'whitelist' | 'blacklist'>('whitelist');
  
  useEffect(() => {
    if (defiSettings) {
      setLocalDefiSettings(defiSettings);
      defiFormik.resetForm({ values: defiSettings });
    }
  }, [defiSettings]);
  
  useEffect(() => {
    if (dappSettings) {
      setLocalDappSettings(dappSettings);
      dappFormik.resetForm({ values: dappSettings });
    }
  }, [dappSettings]);
  
  // DeFi 설정 유효성 검증 스키마
  const defiValidationSchema = Yup.object({
    enabledProtocols: Yup.array().of(Yup.string()),
    maxLeverageRatio: Yup.number()
      .min(1, t('settings.errors.minValue', { value: 1 }))
      .max(100, t('settings.errors.maxValue', { value: 100 }))
      .required(t('settings.errors.required')),
    liquidationThreshold: Yup.number()
      .min(0, t('settings.errors.minValue', { value: 0 }))
      .max(100, t('settings.errors.maxValue', { value: 100 }))
      .required(t('settings.errors.required')),
    defiWarningEnabled: Yup.boolean()
  });
  
  // dApp 설정 유효성 검증 스키마
  const dappValidationSchema = Yup.object({
    enabledCategories: Yup.array().of(Yup.string()),
    defaultFeaturedDapps: Yup.array().of(Yup.string()),
    dappBrowserEnabled: Yup.boolean(),
    whitelistedDomains: Yup.array().of(Yup.string()),
    blacklistedDomains: Yup.array().of(Yup.string())
  });
  
  // DeFi 설정 폼
  const defiFormik = useFormik({
    initialValues: defiSettings || {
      enabledProtocols: [],
      maxLeverageRatio: 2,
      liquidationThreshold: 80,
      defiWarningEnabled: true
    },
    validationSchema: defiValidationSchema,
    onSubmit: async (values) => {
      const success = await onUpdateDefi(values);
      if (success) {
        toast({
          title: t('settings.updateSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
    }
  });
  
  // dApp 설정 폼
  const dappFormik = useFormik({
    initialValues: dappSettings || {
      enabledCategories: [],
      defaultFeaturedDapps: [],
      dappBrowserEnabled: true,
      whitelistedDomains: [],
      blacklistedDomains: []
    },
    validationSchema: dappValidationSchema,
    onSubmit: async (values) => {
      const success = await onUpdateDapp(values);
      if (success) {
        toast({
          title: t('settings.updateSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
    }
  });
  
  // DeFi 프로토콜 추가
  const handleAddProtocol = () => {
    if (!newProtocol.trim()) {
      return;
    }
    
    // 중복 체크
    if (defiFormik.values.enabledProtocols.includes(newProtocol)) {
      toast({
        title: t('settings.defi.duplicateProtocol'),
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // 프로토콜 추가
    const updatedProtocols = [...defiFormik.values.enabledProtocols, newProtocol];
    defiFormik.setFieldValue('enabledProtocols', updatedProtocols);
    setNewProtocol('');
  };
  
  // DeFi 프로토콜 제거
  const handleRemoveProtocol = (protocol: string) => {
    const updatedProtocols = defiFormik.values.enabledProtocols.filter(p => p !== protocol);
    defiFormik.setFieldValue('enabledProtocols', updatedProtocols);
  };
  
  // dApp 카테고리 추가
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      return;
    }
    
    // 중복 체크
    if (dappFormik.values.enabledCategories.includes(newCategory)) {
      toast({
        title: t('settings.dapp.duplicateCategory'),
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // 카테고리 추가
    const updatedCategories = [...dappFormik.values.enabledCategories, newCategory];
    dappFormik.setFieldValue('enabledCategories', updatedCategories);
    setNewCategory('');
  };
  
  // dApp 카테고리 제거
  const handleRemoveCategory = (category: string) => {
    const updatedCategories = dappFormik.values.enabledCategories.filter(c => c !== category);
    dappFormik.setFieldValue('enabledCategories', updatedCategories);
  };
  
  // 추천 dApp 추가
  const handleAddFeaturedDapp = () => {
    if (!newDapp.trim()) {
      return;
    }
    
    // 중복 체크
    if (dappFormik.values.defaultFeaturedDapps.includes(newDapp)) {
      toast({
        title: t('settings.dapp.duplicateDapp'),
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // dApp 추가
    const updatedDapps = [...dappFormik.values.defaultFeaturedDapps, newDapp];
    dappFormik.setFieldValue('defaultFeaturedDapps', updatedDapps);
    setNewDapp('');
  };
  
  // 추천 dApp 제거
  const handleRemoveFeaturedDapp = (dapp: string) => {
    const updatedDapps = dappFormik.values.defaultFeaturedDapps.filter(d => d !== dapp);
    dappFormik.setFieldValue('defaultFeaturedDapps', updatedDapps);
  };
  
  // 도메인 추가 (화이트리스트 또는 블랙리스트)
  const handleAddDomain = () => {
    if (!newDomain.trim()) {
      return;
    }
    
    if (domainType === 'whitelist') {
      // 중복 체크
      if (dappFormik.values.whitelistedDomains.includes(newDomain)) {
        toast({
          title: t('settings.dapp.duplicateDomain'),
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        return;
      }
      
      // 화이트리스트에 도메인 추가
      const updatedDomains = [...dappFormik.values.whitelistedDomains, newDomain];
      dappFormik.setFieldValue('whitelistedDomains', updatedDomains);
    } else {
      // 중복 체크
      if (dappFormik.values.blacklistedDomains.includes(newDomain)) {
        toast({
          title: t('settings.dapp.duplicateDomain'),
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        return;
      }
      
      // 블랙리스트에 도메인 추가
      const updatedDomains = [...dappFormik.values.blacklistedDomains, newDomain];
      dappFormik.setFieldValue('blacklistedDomains', updatedDomains);
    }
    
    setNewDomain('');
  };
  
  // 화이트리스트 도메인 제거
  const handleRemoveWhitelistedDomain = (domain: string) => {
    const updatedDomains = dappFormik.values.whitelistedDomains.filter(d => d !== domain);
    dappFormik.setFieldValue('whitelistedDomains', updatedDomains);
  };
  
  // 블랙리스트 도메인 제거
  const handleRemoveBlacklistedDomain = (domain: string) => {
    const updatedDomains = dappFormik.values.blacklistedDomains.filter(d => d !== domain);
    dappFormik.setFieldValue('blacklistedDomains', updatedDomains);
  };
  
  return (
    <Card
      title={t('settings.dappAndDefi.title')}
      subtitle={t('settings.dappAndDefi.subtitle')}
      isLoading={isLoading && (!localDefiSettings || !localDappSettings)}
    >
      <Tabs index={activeTab} onChange={setActiveTab} colorScheme="brand" variant="enclosed">
        <TabList>
          <Tab>{t('settings.defi.title')}</Tab>
          <Tab>{t('settings.dapp.title')}</Tab>
        </TabList>
        
        <TabPanels>
          {/* DeFi 설정 탭 */}
          <TabPanel px={0}>
            <form onSubmit={defiFormik.handleSubmit}>
              <VStack spacing={6} align="stretch">
                <Text fontSize="lg" fontWeight="bold">
                  {t('settings.defi.generalSettings')}
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl
                    isInvalid={!!(defiFormik.touched.maxLeverageRatio && defiFormik.errors.maxLeverageRatio)}
                    isRequired
                  >
                    <FormLabel>
                      {t('settings.defi.maxLeverageRatio')}
                      <Tooltip
                        label={t('settings.defi.maxLeverageRatioTooltip')}
                        placement="top"
                        hasArrow
                      >
                        <InfoIcon ml={1} boxSize={3} />
                      </Tooltip>
                    </FormLabel>
                    <NumberInput
                      id="maxLeverageRatio"
                      min={1}
                      max={100}
                      step={0.1}
                      precision={1}
                      value={defiFormik.values.maxLeverageRatio}
                      onChange={(valueAsString, valueAsNumber) => {
                        defiFormik.setFieldValue('maxLeverageRatio', valueAsNumber);
                      }}
                      isDisabled={isLoading}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{defiFormik.errors.maxLeverageRatio}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl
                    isInvalid={!!(defiFormik.touched.liquidationThreshold && defiFormik.errors.liquidationThreshold)}
                    isRequired
                  >
                    <FormLabel>
                      {t('settings.defi.liquidationThreshold')} (%)
                      <Tooltip
                        label={t('settings.defi.liquidationThresholdTooltip')}
                        placement="top"
                        hasArrow
                      >
                        <InfoIcon ml={1} boxSize={3} />
                      </Tooltip>
                    </FormLabel>
                    <NumberInput
                      id="liquidationThreshold"
                      min={0}
                      max={100}
                      step={1}
                      value={defiFormik.values.liquidationThreshold}
                      onChange={(valueAsString, valueAsNumber) => {
                        defiFormik.setFieldValue('liquidationThreshold', valueAsNumber);
                      }}
                      isDisabled={isLoading}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{defiFormik.errors.liquidationThreshold}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="defiWarningEnabled" mb="0">
                      {t('settings.defi.defiWarningEnabled')}
                    </FormLabel>
                    <Switch
                      id="defiWarningEnabled"
                      name="defiWarningEnabled"
                      isChecked={defiFormik.values.defiWarningEnabled}
                      onChange={defiFormik.handleChange}
                      isDisabled={isLoading}
                    />
                  </FormControl>
                </SimpleGrid>
                
                <Divider my={4} />
                
                <Text fontSize="lg" fontWeight="bold">
                  {t('settings.defi.enabledProtocols')}
                </Text>
                
                <Text fontSize="sm" color="gray.500">
                  {t('settings.defi.enabledProtocolsDescription')}
                </Text>
                
                <HStack spacing={4}>
                  <FormControl>
                    <Input
                      placeholder={t('settings.defi.protocolPlaceholder')}
                      value={newProtocol}
                      onChange={(e) => setNewProtocol(e.target.value)}
                      isDisabled={isLoading}
                    />
                  </FormControl>
                  <IconButton
                    icon={<AddIcon />}
                    aria-label={t('settings.defi.addProtocol')}
                    onClick={handleAddProtocol}
                    isDisabled={isLoading || !newProtocol}
                  />
                </HStack>
                
                <Box>
                  {defiFormik.values.enabledProtocols.length > 0 ? (
                    <Flex flexWrap="wrap" gap={2}>
                      {defiFormik.values.enabledProtocols.map((protocol) => (
                        <Badge
                          key={protocol}
                          px={2}
                          py={1}
                          borderRadius="md"
                          colorScheme="brand"
                          variant="solid"
                          fontSize="sm"
                        >
                          {protocol}
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label={t('settings.defi.removeProtocol')}
                            size="xs"
                            variant="ghost"
                            colorScheme="whiteAlpha"
                            ml={1}
                            onClick={() => handleRemoveProtocol(protocol)}
                            isDisabled={isLoading}
                          />
                        </Badge>
                      ))}
                    </Flex>
                  ) : (
                    <Text color="gray.500" fontSize="sm">
                      {t('settings.defi.noProtocols')}
                    </Text>
                  )}
                </Box>
                
                <Flex justify="flex-end" mt={4}>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    isLoading={isLoading}
                    isDisabled={!defiFormik.isValid}
                  >
                    {t('common.save')}
                  </Button>
                </Flex>
              </VStack>
            </form>
          </TabPanel>
          
          {/* dApp 설정 탭 */}
          <TabPanel px={0}>
            <form onSubmit={dappFormik.handleSubmit}>
              <VStack spacing={6} align="stretch">
                <Text fontSize="lg" fontWeight="bold">
                  {t('settings.dapp.generalSettings')}
                </Text>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="dappBrowserEnabled" mb="0">
                    {t('settings.dapp.dappBrowserEnabled')}
                  </FormLabel>
                  <Switch
                    id="dappBrowserEnabled"
                    name="dappBrowserEnabled"
                    isChecked={dappFormik.values.dappBrowserEnabled}
                    onChange={dappFormik.handleChange}
                    isDisabled={isLoading}
                  />
                </FormControl>
                
                <Divider my={4} />
                
                <Text fontSize="lg" fontWeight="bold">
                  {t('settings.dapp.enabledCategories')}
                </Text>
                
                <HStack spacing={4}>
                  <FormControl>
                    <Input
                      placeholder={t('settings.dapp.categoryPlaceholder')}
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      isDisabled={isLoading}
                    />
                  </FormControl>
                  <IconButton
                    icon={<AddIcon />}
                    aria-label={t('settings.dapp.addCategory')}
                    onClick={handleAddCategory}
                    isDisabled={isLoading || !newCategory}
                  />
                </HStack>
                
                <Box>
                  {dappFormik.values.enabledCategories.length > 0 ? (
                    <Flex flexWrap="wrap" gap={2}>
                      {dappFormik.values.enabledCategories.map((category) => (
                        <Badge
                          key={category}
                          px={2}
                          py={1}
                          borderRadius="md"
                          colorScheme="purple"
                          variant="solid"
                          fontSize="sm"
                        >
                          {category}
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label={t('settings.dapp.removeCategory')}
                            size="xs"
                            variant="ghost"
                            colorScheme="whiteAlpha"
                            ml={1}
                            onClick={() => handleRemoveCategory(category)}
                            isDisabled={isLoading}
                          />
                        </Badge>
                      ))}
                    </Flex>
                  ) : (
                    <Text color="gray.500" fontSize="sm">
                      {t('settings.dapp.noCategories')}
                    </Text>
                  )}
                </Box>
                
                <Divider my={4} />
                
                <Text fontSize="lg" fontWeight="bold">
                  {t('settings.dapp.featuredDapps')}
                </Text>
                
                <Text fontSize="sm" color="gray.500">
                  {t('settings.dapp.featuredDappsDescription')}
                </Text>
                
                <HStack spacing={4}>
                  <FormControl>
                    <Input
                      placeholder={t('settings.dapp.dappPlaceholder')}
                      value={newDapp}
                      onChange={(e) => setNewDapp(e.target.value)}
                      isDisabled={isLoading}
                    />
                  </FormControl>
                  <IconButton
                    icon={<AddIcon />}
                    aria-label={t('settings.dapp.addDapp')}
                    onClick={handleAddFeaturedDapp}
                    isDisabled={isLoading || !newDapp}
                  />
                </HStack>
                
                <Box>
                  {dappFormik.values.defaultFeaturedDapps.length > 0 ? (
                    <Flex flexWrap="wrap" gap={2}>
                      {dappFormik.values.defaultFeaturedDapps.map((dapp) => (
                        <Badge
                          key={dapp}
                          px={2}
                          py={1}
                          borderRadius="md"
                          colorScheme="blue"
                          variant="solid"
                          fontSize="sm"
                        >
                          {dapp}
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label={t('settings.dapp.removeDapp')}
                            size="xs"
                            variant="ghost"
                            colorScheme="whiteAlpha"
                            ml={1}
                            onClick={() => handleRemoveFeaturedDapp(dapp)}
                            isDisabled={isLoading}
                          />
                        </Badge>
                      ))}
                    </Flex>
                  ) : (
                    <Text color="gray.500" fontSize="sm">
                      {t('settings.dapp.noDapps')}
                    </Text>
                  )}
                </Box>
                
                <Divider my={4} />
                
                <Text fontSize="lg" fontWeight="bold">
                  {t('settings.dapp.domainLists')}
                </Text>
                
                <Tabs variant="soft-rounded" colorScheme="brand" size="sm">
                  <TabList>
                    <Tab
                      onClick={() => setDomainType('whitelist')}
                    >
                      {t('settings.dapp.whitelistedDomains')}
                    </Tab>
                    <Tab
                      onClick={() => setDomainType('blacklist')}
                    >
                      {t('settings.dapp.blacklistedDomains')}
                    </Tab>
                  </TabList>
                  
                  <TabPanels>
                    <TabPanel px={0} pt={4}>
                      <Text fontSize="sm" color="gray.500" mb={4}>
                        {t('settings.dapp.whitelistedDomainsDescription')}
                      </Text>
                      
                      <HStack spacing={4} mb={4}>
                        <FormControl>
                          <Input
                            placeholder={t('settings.dapp.domainPlaceholder')}
                            value={domainType === 'whitelist' ? newDomain : ''}
                            onChange={(e) => setNewDomain(e.target.value)}
                            isDisabled={isLoading}
                          />
                        </FormControl>
                        <IconButton
                          icon={<AddIcon />}
                          aria-label={t('settings.dapp.addDomain')}
                          onClick={handleAddDomain}
                          isDisabled={isLoading || !newDomain}
                        />
                      </HStack>
                      
                      <Box>
                        {dappFormik.values.whitelistedDomains.length > 0 ? (
                          <Flex flexWrap="wrap" gap={2}>
                            {dappFormik.values.whitelistedDomains.map((domain) => (
                              <Badge
                                key={domain}
                                px={2}
                                py={1}
                                borderRadius="md"
                                colorScheme="green"
                                variant="solid"
                                fontSize="sm"
                              >
                                {domain}
                                <IconButton
                                  icon={<DeleteIcon />}
                                  aria-label={t('settings.dapp.removeDomain')}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="whiteAlpha"
                                  ml={1}
                                  onClick={() => handleRemoveWhitelistedDomain(domain)}
                                  isDisabled={isLoading}
                                />
                              </Badge>
                            ))}
                          </Flex>
                        ) : (
                          <Text color="gray.500" fontSize="sm">
                            {t('settings.dapp.noDomains')}
                          </Text>
                        )}
                      </Box>
                    </TabPanel>
                    
                    <TabPanel px={0} pt={4}>
                      <Text fontSize="sm" color="gray.500" mb={4}>
                        {t('settings.dapp.blacklistedDomainsDescription')}
                      </Text>
                      
                      <HStack spacing={4} mb={4}>
                        <FormControl>
                          <Input
                            placeholder={t('settings.dapp.domainPlaceholder')}
                            value={domainType === 'blacklist' ? newDomain : ''}
                            onChange={(e) => setNewDomain(e.target.value)}
                            isDisabled={isLoading}
                          />
                        </FormControl>
                        <IconButton
                          icon={<AddIcon />}
                          aria-label={t('settings.dapp.addDomain')}
                          onClick={handleAddDomain}
                          isDisabled={isLoading || !newDomain}
                        />
                      </HStack>
                      
                      <Box>
                        {dappFormik.values.blacklistedDomains.length > 0 ? (
                          <Flex flexWrap="wrap" gap={2}>
                            {dappFormik.values.blacklistedDomains.map((domain) => (
                              <Badge
                                key={domain}
                                px={2}
                                py={1}
                                borderRadius="md"
                                colorScheme="red"
                                variant="solid"
                                fontSize="sm"
                              >
                                {domain}
                                <IconButton
                                  icon={<DeleteIcon />}
                                  aria-label={t('settings.dapp.removeDomain')}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="whiteAlpha"
                                  ml={1}
                                  onClick={() => handleRemoveBlacklistedDomain(domain)}
                                  isDisabled={isLoading}
                                />
                              </Badge>
                            ))}
                          </Flex>
                        ) : (
                          <Text color="gray.500" fontSize="sm">
                            {t('settings.dapp.noDomains')}
                          </Text>
                        )}
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
                
                <Flex justify="flex-end" mt={4}>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    isLoading={isLoading}
                    isDisabled={!dappFormik.isValid}
                  >
                    {t('common.save')}
                  </Button>
                </Flex>
              </VStack>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Card>
  );
};

export default DappAndDefiSettings;
