import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Button,
  Flex,
  Box,
  Text,
  useToast,
  FormErrorMessage,
  SimpleGrid
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Card } from '@/components/common';
import { GeneralSettings as GeneralSettingsType } from '@/types';
import { useTranslation } from 'react-i18next';

interface GeneralSettingsProps {
  settings: GeneralSettingsType | null;
  onUpdate: (settings: Partial<GeneralSettingsType>) => Promise<boolean>;
  isLoading: boolean;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  onUpdate,
  isLoading
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [localSettings, setLocalSettings] = useState<GeneralSettingsType | null>(settings);
  
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      formik.resetForm({ values: settings });
    }
  }, [settings]);
  
  const validationSchema = Yup.object({
    platformName: Yup.string().required(t('settings.errors.required')),
    supportEmail: Yup.string().email(t('settings.errors.invalidEmail')).required(t('settings.errors.required')),
    termsUrl: Yup.string().url(t('settings.errors.invalidUrl')).required(t('settings.errors.required')),
    privacyUrl: Yup.string().url(t('settings.errors.invalidUrl')).required(t('settings.errors.required')),
    defaultLanguage: Yup.string().required(t('settings.errors.required')),
    defaultFiatCurrency: Yup.string().required(t('settings.errors.required')),
    logoUrl: Yup.string().url(t('settings.errors.invalidUrl')),
    faviconUrl: Yup.string().url(t('settings.errors.invalidUrl'))
  });
  
  const formik = useFormik({
    initialValues: settings || {
      platformName: '',
      supportEmail: '',
      termsUrl: '',
      privacyUrl: '',
      defaultLanguage: 'en',
      defaultFiatCurrency: 'USD',
      maintenanceMode: false,
      logoUrl: '',
      faviconUrl: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      const success = await onUpdate(values);
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
  
  const languageOptions = [
    { value: 'en', label: t('settings.languages.english') },
    { value: 'ko', label: t('settings.languages.korean') },
    { value: 'ja', label: t('settings.languages.japanese') },
    { value: 'zh-CN', label: t('settings.languages.chinese') },
    { value: 'zh-TW', label: t('settings.languages.traditionalChinese') },
    { value: 'vi', label: t('settings.languages.vietnamese') },
    { value: 'th', label: t('settings.languages.thai') }
  ];
  
  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'JPY', label: 'JPY' },
    { value: 'KRW', label: 'KRW' },
    { value: 'CNY', label: 'CNY' },
    { value: 'GBP', label: 'GBP' },
    { value: 'THB', label: 'THB' },
    { value: 'VND', label: 'VND' }
  ];
  
  return (
    <Card
      title={t('settings.general.title')}
      subtitle={t('settings.general.subtitle')}
      isLoading={isLoading && !localSettings}
    >
      <form onSubmit={formik.handleSubmit}>
        <VStack spacing={6} align="stretch">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl
              isInvalid={!!(formik.touched.platformName && formik.errors.platformName)}
              isRequired
            >
              <FormLabel>{t('settings.general.platformName')}</FormLabel>
              <Input
                id="platformName"
                name="platformName"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.platformName}
                isDisabled={isLoading}
              />
              <FormErrorMessage>{formik.errors.platformName}</FormErrorMessage>
            </FormControl>
            
            <FormControl
              isInvalid={!!(formik.touched.supportEmail && formik.errors.supportEmail)}
              isRequired
            >
              <FormLabel>{t('settings.general.supportEmail')}</FormLabel>
              <Input
                id="supportEmail"
                name="supportEmail"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.supportEmail}
                isDisabled={isLoading}
              />
              <FormErrorMessage>{formik.errors.supportEmail}</FormErrorMessage>
            </FormControl>
            
            <FormControl
              isInvalid={!!(formik.touched.termsUrl && formik.errors.termsUrl)}
              isRequired
            >
              <FormLabel>{t('settings.general.termsUrl')}</FormLabel>
              <Input
                id="termsUrl"
                name="termsUrl"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.termsUrl}
                isDisabled={isLoading}
              />
              <FormErrorMessage>{formik.errors.termsUrl}</FormErrorMessage>
            </FormControl>
            
            <FormControl
              isInvalid={!!(formik.touched.privacyUrl && formik.errors.privacyUrl)}
              isRequired
            >
              <FormLabel>{t('settings.general.privacyUrl')}</FormLabel>
              <Input
                id="privacyUrl"
                name="privacyUrl"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.privacyUrl}
                isDisabled={isLoading}
              />
              <FormErrorMessage>{formik.errors.privacyUrl}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>{t('settings.general.defaultLanguage')}</FormLabel>
              <Select
                id="defaultLanguage"
                name="defaultLanguage"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.defaultLanguage}
                isDisabled={isLoading}
              >
                {languageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{formik.errors.defaultLanguage}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>{t('settings.general.defaultFiatCurrency')}</FormLabel>
              <Select
                id="defaultFiatCurrency"
                name="defaultFiatCurrency"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.defaultFiatCurrency}
                isDisabled={isLoading}
              >
                {currencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{formik.errors.defaultFiatCurrency}</FormErrorMessage>
            </FormControl>
            
            <FormControl
              isInvalid={!!(formik.touched.logoUrl && formik.errors.logoUrl)}
            >
              <FormLabel>{t('settings.general.logoUrl')}</FormLabel>
              <Input
                id="logoUrl"
                name="logoUrl"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.logoUrl}
                isDisabled={isLoading}
              />
              <FormErrorMessage>{formik.errors.logoUrl}</FormErrorMessage>
            </FormControl>
            
            <FormControl
              isInvalid={!!(formik.touched.faviconUrl && formik.errors.faviconUrl)}
            >
              <FormLabel>{t('settings.general.faviconUrl')}</FormLabel>
              <Input
                id="faviconUrl"
                name="faviconUrl"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.faviconUrl}
                isDisabled={isLoading}
              />
              <FormErrorMessage>{formik.errors.faviconUrl}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
          
          <FormControl display="flex" alignItems="center" mt={4}>
            <FormLabel htmlFor="maintenanceMode" mb="0">
              {t('settings.general.maintenanceMode')}
            </FormLabel>
            <Switch
              id="maintenanceMode"
              name="maintenanceMode"
              isChecked={formik.values.maintenanceMode}
              onChange={formik.handleChange}
              isDisabled={isLoading}
            />
          </FormControl>
          
          <Flex justify="flex-end" mt={4}>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={isLoading}
              isDisabled={!formik.dirty || !formik.isValid}
            >
              {t('common.save')}
            </Button>
          </Flex>
        </VStack>
      </form>
    </Card>
  );
};

export default GeneralSettings;
