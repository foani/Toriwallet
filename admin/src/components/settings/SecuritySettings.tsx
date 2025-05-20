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
  Tag,
  TagLabel,
  TagCloseButton
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Card } from '@/components/common';
import { SecuritySettings as SecuritySettingsType } from '@/types';
import { useTranslation } from 'react-i18next';

interface SecuritySettingsProps {
  settings: SecuritySettingsType | null;
  onUpdate: (settings: Partial<SecuritySettingsType>) => Promise<boolean>;
  isLoading: boolean;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  settings,
  onUpdate,
  isLoading
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [localSettings, setLocalSettings] = useState<SecuritySettingsType | null>(settings);
  const [newIpAddress, setNewIpAddress] = useState<string>('');
  
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      formik.resetForm({ values: settings });
    }
  }, [settings]);
  
  const validationSchema = Yup.object({
    requireTwoFactor: Yup.boolean(),
    sessionTimeout: Yup.number()
      .min(1, t('settings.errors.minValue', { value: 1 }))
      .max(240, t('settings.errors.maxValue', { value: 240 }))
      .required(t('settings.errors.required')),
    maxFailedAttempts: Yup.number()
      .min(1, t('settings.errors.minValue', { value: 1 }))
      .max(10, t('settings.errors.maxValue', { value: 10 }))
      .required(t('settings.errors.required')),
    passwordPolicy: Yup.object({
      minLength: Yup.number()
        .min(6, t('settings.errors.minValue', { value: 6 }))
        .max(32, t('settings.errors.maxValue', { value: 32 }))
        .required(t('settings.errors.required')),
      requireUppercase: Yup.boolean(),
      requireLowercase: Yup.boolean(),
      requireNumbers: Yup.boolean(),
      requireSpecialChars: Yup.boolean()
    }),
    ipWhitelist: Yup.array().of(Yup.string())
  });
  
  const formik = useFormik({
    initialValues: settings || {
      requireTwoFactor: false,
      sessionTimeout: 30,
      maxFailedAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      ipWhitelist: []
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
  
  const handleAddIpAddress = () => {
    // 간단한 IP 주소 검증
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(newIpAddress)) {
      toast({
        title: t('settings.security.invalidIpAddress'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // 중복 체크
    if (formik.values.ipWhitelist.includes(newIpAddress)) {
      toast({
        title: t('settings.security.duplicateIpAddress'),
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // IP 주소 추가
    const updatedIpWhitelist = [...formik.values.ipWhitelist, newIpAddress];
    formik.setFieldValue('ipWhitelist', updatedIpWhitelist);
    setNewIpAddress('');
  };
  
  const handleRemoveIpAddress = (ipAddress: string) => {
    const updatedIpWhitelist = formik.values.ipWhitelist.filter(ip => ip !== ipAddress);
    formik.setFieldValue('ipWhitelist', updatedIpWhitelist);
  };
  
  return (
    <Card
      title={t('settings.security.title')}
      subtitle={t('settings.security.subtitle')}
      isLoading={isLoading && !localSettings}
    >
      <form onSubmit={formik.handleSubmit}>
        <VStack spacing={6} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            {t('settings.security.generalSecurity')}
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="requireTwoFactor" mb="0">
                {t('settings.security.requireTwoFactor')}
              </FormLabel>
              <Switch
                id="requireTwoFactor"
                name="requireTwoFactor"
                isChecked={formik.values.requireTwoFactor}
                onChange={formik.handleChange}
                isDisabled={isLoading}
              />
            </FormControl>
            
            <FormControl
              isInvalid={!!(formik.touched.sessionTimeout && formik.errors.sessionTimeout)}
            >
              <FormLabel>{t('settings.security.sessionTimeout')}</FormLabel>
              <NumberInput
                id="sessionTimeout"
                min={1}
                max={240}
                value={formik.values.sessionTimeout}
                onChange={(valueAsString, valueAsNumber) => {
                  formik.setFieldValue('sessionTimeout', valueAsNumber);
                }}
                isDisabled={isLoading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formik.errors.sessionTimeout}</FormErrorMessage>
            </FormControl>
            
            <FormControl
              isInvalid={!!(formik.touched.maxFailedAttempts && formik.errors.maxFailedAttempts)}
            >
              <FormLabel>{t('settings.security.maxFailedAttempts')}</FormLabel>
              <NumberInput
                id="maxFailedAttempts"
                min={1}
                max={10}
                value={formik.values.maxFailedAttempts}
                onChange={(valueAsString, valueAsNumber) => {
                  formik.setFieldValue('maxFailedAttempts', valueAsNumber);
                }}
                isDisabled={isLoading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formik.errors.maxFailedAttempts}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
          
          <Divider my={4} />
          
          <Text fontSize="lg" fontWeight="bold">
            {t('settings.security.passwordPolicy')}
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl
              isInvalid={
                !!(
                  formik.touched.passwordPolicy?.minLength &&
                  formik.errors.passwordPolicy?.minLength
                )
              }
            >
              <FormLabel>{t('settings.security.minLength')}</FormLabel>
              <NumberInput
                id="passwordPolicy.minLength"
                min={6}
                max={32}
                value={formik.values.passwordPolicy.minLength}
                onChange={(valueAsString, valueAsNumber) => {
                  formik.setFieldValue('passwordPolicy.minLength', valueAsNumber);
                }}
                isDisabled={isLoading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>
                {formik.errors.passwordPolicy?.minLength}
              </FormErrorMessage>
            </FormControl>
            
            <Box></Box>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="passwordPolicy.requireUppercase" mb="0">
                {t('settings.security.requireUppercase')}
              </FormLabel>
              <Switch
                id="passwordPolicy.requireUppercase"
                name="passwordPolicy.requireUppercase"
                isChecked={formik.values.passwordPolicy.requireUppercase}
                onChange={formik.handleChange}
                isDisabled={isLoading}
              />
            </FormControl>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="passwordPolicy.requireLowercase" mb="0">
                {t('settings.security.requireLowercase')}
              </FormLabel>
              <Switch
                id="passwordPolicy.requireLowercase"
                name="passwordPolicy.requireLowercase"
                isChecked={formik.values.passwordPolicy.requireLowercase}
                onChange={formik.handleChange}
                isDisabled={isLoading}
              />
            </FormControl>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="passwordPolicy.requireNumbers" mb="0">
                {t('settings.security.requireNumbers')}
              </FormLabel>
              <Switch
                id="passwordPolicy.requireNumbers"
                name="passwordPolicy.requireNumbers"
                isChecked={formik.values.passwordPolicy.requireNumbers}
                onChange={formik.handleChange}
                isDisabled={isLoading}
              />
            </FormControl>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="passwordPolicy.requireSpecialChars" mb="0">
                {t('settings.security.requireSpecialChars')}
              </FormLabel>
              <Switch
                id="passwordPolicy.requireSpecialChars"
                name="passwordPolicy.requireSpecialChars"
                isChecked={formik.values.passwordPolicy.requireSpecialChars}
                onChange={formik.handleChange}
                isDisabled={isLoading}
              />
            </FormControl>
          </SimpleGrid>
          
          <Divider my={4} />
          
          <Text fontSize="lg" fontWeight="bold">
            {t('settings.security.ipWhitelist')}
          </Text>
          
          <Text fontSize="sm" color="gray.500">
            {t('settings.security.ipWhitelistDescription')}
          </Text>
          
          <HStack spacing={4}>
            <FormControl>
              <Input
                placeholder={t('settings.security.ipAddressPlaceholder')}
                value={newIpAddress}
                onChange={(e) => setNewIpAddress(e.target.value)}
                isDisabled={isLoading}
              />
            </FormControl>
            <IconButton
              icon={<AddIcon />}
              aria-label={t('settings.security.addIpAddress')}
              onClick={handleAddIpAddress}
              isDisabled={isLoading || !newIpAddress}
            />
          </HStack>
          
          <Box>
            {formik.values.ipWhitelist.length > 0 ? (
              <Flex flexWrap="wrap" gap={2}>
                {formik.values.ipWhitelist.map((ip) => (
                  <Tag key={ip} size="md" borderRadius="full" variant="solid" colorScheme="brand">
                    <TagLabel>{ip}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveIpAddress(ip)} />
                  </Tag>
                ))}
              </Flex>
            ) : (
              <Text color="gray.500" fontSize="sm">
                {t('settings.security.noIpAddresses')}
              </Text>
            )}
          </Box>
          
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

export default SecuritySettings;
