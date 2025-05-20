import React from 'react';
import {
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Checkbox,
  Flex,
  Divider,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { Formik, Form, Field, FieldProps } from 'formik';
import {
  Network,
  NetworkCreateRequest,
  NetworkType,
  NetworkStatus,
  NetworkUpdateRequest
} from '@/types';
import { Button } from '@/components/common';
import { useTranslation } from 'react-i18next';
import {
  networkCreateValidationSchema,
  networkUpdateValidationSchema
} from '@/utils/validation';

interface NetworkFormProps {
  network?: Network;
  onSubmit: (values: NetworkCreateRequest | NetworkUpdateRequest) => Promise<void>;
  isLoading: boolean;
  isEdit?: boolean;
}

const NetworkForm: React.FC<NetworkFormProps> = ({
  network,
  onSubmit,
  isLoading,
  isEdit = false
}) => {
  const { t } = useTranslation();
  const dividerColor = useColorModeValue('gray.200', 'gray.700');
  
  const initialValues: NetworkCreateRequest = {
    name: network?.name || '',
    type: network?.type || NetworkType.CATENA,
    chainId: network?.chainId || '',
    rpcUrl: network?.rpcUrl || '',
    symbol: network?.symbol || '',
    blockExplorerUrl: network?.blockExplorerUrl || '',
    iconUrl: network?.iconUrl || '',
    status: network?.status || NetworkStatus.INACTIVE,
    isTestnet: network?.isTestnet || false,
    isDefaultNetwork: network?.isDefaultNetwork || false
  };
  
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={isEdit ? networkUpdateValidationSchema : networkCreateValidationSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, isValid, dirty }) => (
        <Form>
          <VStack spacing={6} align="stretch">
            <Text fontSize="xl" fontWeight="bold">
              {t('networks.basicInfo')}
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Field name="name">
                {({ field, form }: FieldProps) => (
                  <FormControl isInvalid={!!errors.name && touched.name} isRequired>
                    <FormLabel htmlFor="name">{t('networks.networkName')}</FormLabel>
                    <Input
                      {...field}
                      id="name"
                      placeholder={t('networks.networkNamePlaceholder')}
                      isReadOnly={isEdit && network?.type === NetworkType.CATENA}
                    />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              
              <Field name="type">
                {({ field, form }: FieldProps) => (
                  <FormControl isInvalid={!!errors.type && touched.type} isRequired>
                    <FormLabel htmlFor="type">{t('networks.networkType')}</FormLabel>
                    <Select
                      {...field}
                      id="type"
                      isDisabled={isEdit}
                    >
                      {Object.values(NetworkType).map((type) => (
                        <option key={type} value={type}>
                          {type.toUpperCase()}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.type}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              
              <Field name="chainId">
                {({ field, form }: FieldProps) => (
                  <FormControl isInvalid={!!errors.chainId && touched.chainId} isRequired>
                    <FormLabel htmlFor="chainId">{t('networks.chainId')}</FormLabel>
                    <Input
                      {...field}
                      id="chainId"
                      placeholder={t('networks.chainIdPlaceholder')}
                      isReadOnly={isEdit}
                    />
                    <FormErrorMessage>{errors.chainId}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              
              <Field name="symbol">
                {({ field, form }: FieldProps) => (
                  <FormControl isInvalid={!!errors.symbol && touched.symbol} isRequired>
                    <FormLabel htmlFor="symbol">{t('networks.symbol')}</FormLabel>
                    <Input
                      {...field}
                      id="symbol"
                      placeholder={t('networks.symbolPlaceholder')}
                      isReadOnly={isEdit && network?.type === NetworkType.CATENA}
                    />
                    <FormErrorMessage>{errors.symbol}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
            </SimpleGrid>
            
            <Divider borderColor={dividerColor} my={2} />
            
            <Text fontSize="xl" fontWeight="bold">
              {t('networks.connectionInfo')}
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Field name="rpcUrl">
                {({ field, form }: FieldProps) => (
                  <FormControl isInvalid={!!errors.rpcUrl && touched.rpcUrl} isRequired>
                    <FormLabel htmlFor="rpcUrl">{t('networks.rpcUrl')}</FormLabel>
                    <Input
                      {...field}
                      id="rpcUrl"
                      placeholder={t('networks.rpcUrlPlaceholder')}
                    />
                    <FormErrorMessage>{errors.rpcUrl}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              
              <Field name="blockExplorerUrl">
                {({ field, form }: FieldProps) => (
                  <FormControl
                    isInvalid={!!errors.blockExplorerUrl && touched.blockExplorerUrl}
                    isRequired
                  >
                    <FormLabel htmlFor="blockExplorerUrl">
                      {t('networks.blockExplorerUrl')}
                    </FormLabel>
                    <Input
                      {...field}
                      id="blockExplorerUrl"
                      placeholder={t('networks.blockExplorerUrlPlaceholder')}
                    />
                    <FormErrorMessage>{errors.blockExplorerUrl}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              
              <Field name="iconUrl">
                {({ field, form }: FieldProps) => (
                  <FormControl isInvalid={!!errors.iconUrl && touched.iconUrl}>
                    <FormLabel htmlFor="iconUrl">{t('networks.iconUrl')}</FormLabel>
                    <Input
                      {...field}
                      id="iconUrl"
                      placeholder={t('networks.iconUrlPlaceholder')}
                    />
                    <FormErrorMessage>{errors.iconUrl}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
            </SimpleGrid>
            
            <Divider borderColor={dividerColor} my={2} />
            
            <Text fontSize="xl" fontWeight="bold">
              {t('networks.configuration')}
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Field name="status">
                {({ field, form }: FieldProps) => (
                  <FormControl isInvalid={!!errors.status && touched.status} isRequired>
                    <FormLabel htmlFor="status">{t('networks.status')}</FormLabel>
                    <Select
                      {...field}
                      id="status"
                    >
                      {Object.values(NetworkStatus).map((status) => (
                        <option key={status} value={status}>
                          {t(`networks.${status.toLowerCase()}`)}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.status}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              
              <Flex direction="column" justifyContent="flex-end" height="100%">
                <Flex direction="column" gap={4}>
                  <Field name="isTestnet">
                    {({ field, form }: FieldProps) => (
                      <FormControl>
                        <Checkbox
                          {...field}
                          isChecked={field.value}
                          isDisabled={isEdit}
                        >
                          {t('networks.isTestnet')}
                        </Checkbox>
                      </FormControl>
                    )}
                  </Field>
                  
                  <Field name="isDefaultNetwork">
                    {({ field, form }: FieldProps) => (
                      <FormControl>
                        <Checkbox
                          {...field}
                          isChecked={field.value}
                        >
                          {t('networks.isDefaultNetwork')}
                        </Checkbox>
                      </FormControl>
                    )}
                  </Field>
                </Flex>
              </Flex>
            </SimpleGrid>
            
            <Flex justify="flex-end" mt={4}>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={isLoading}
                isDisabled={isEdit ? !dirty : !isValid || !dirty}
              >
                {isEdit ? t('common.save') : t('common.create')}
              </Button>
            </Flex>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default NetworkForm;
