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
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { Formik, Form, Field, FieldProps } from 'formik';
import {
  User,
  UserCreateRequest,
  UserRole,
  UserStatus,
  UserUpdateRequest
} from '@/types';
import { Button } from '@/components/common';
import { useTranslation } from 'react-i18next';
import {
  userCreateValidationSchema,
  userUpdateValidationSchema
} from '@/utils/validation';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface UserFormProps {
  user?: User;
  onSubmit: (values: UserCreateRequest | UserUpdateRequest) => Promise<void>;
  isLoading: boolean;
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  isLoading,
  isEdit = false
}) => {
  const { t } = useTranslation();
  const dividerColor = useColorModeValue('gray.200', 'gray.700');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  
  const initialValues: UserCreateRequest | UserUpdateRequest = isEdit
    ? {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        role: user?.role || UserRole.VIEWER,
        status: user?.status || UserStatus.ACTIVE
      }
    : {
        email: '',
        firstName: '',
        lastName: '',
        role: UserRole.VIEWER,
        password: '',
        confirmPassword: ''
      };
  
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={isEdit ? userUpdateValidationSchema : userCreateValidationSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, isValid, dirty }) => (
        <Form>
          <VStack spacing={6} align="stretch">
            <Text fontSize="xl" fontWeight="bold">
              {t('users.userInfo')}
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {!isEdit && (
                <Field name="email">
                  {({ field, form }: FieldProps) => (
                    <FormControl isInvalid={!!errors.email && touched.email} isRequired>
                      <FormLabel htmlFor="email">{t('users.email')}</FormLabel>
                      <Input
                        {...field}
                        id="email"
                        placeholder={t('users.emailPlaceholder')}
                        type="email"
                      />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              )}
              
              <Field name="firstName">
                {({ field, form }: FieldProps) => (
                  <FormControl isInvalid={!!errors.firstName && touched.firstName} isRequired>
                    <FormLabel htmlFor="firstName">{t('users.firstName')}</FormLabel>
                    <Input
                      {...field}
                      id="firstName"
                      placeholder={t('users.firstNamePlaceholder')}
                    />
                    <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              
              <Field name="lastName">
                {({ field, form }: FieldProps) => (
                  <FormControl isInvalid={!!errors.lastName && touched.lastName} isRequired>
                    <FormLabel htmlFor="lastName">{t('users.lastName')}</FormLabel>
                    <Input
                      {...field}
                      id="lastName"
                      placeholder={t('users.lastNamePlaceholder')}
                    />
                    <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              
              <Field name="role">
                {({ field, form }: FieldProps) => (
                  <FormControl isInvalid={!!errors.role && touched.role} isRequired>
                    <FormLabel htmlFor="role">{t('users.role')}</FormLabel>
                    <Select
                      {...field}
                      id="role"
                    >
                      {Object.values(UserRole).map((role) => (
                        <option key={role} value={role}>
                          {t(`users.${role.toLowerCase()}`)}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.role}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              
              {isEdit && (
                <Field name="status">
                  {({ field, form }: FieldProps) => (
                    <FormControl isInvalid={!!errors.status && touched.status} isRequired>
                      <FormLabel htmlFor="status">{t('users.status')}</FormLabel>
                      <Select
                        {...field}
                        id="status"
                      >
                        {Object.values(UserStatus).map((status) => (
                          <option key={status} value={status}>
                            {t(`users.${status.toLowerCase()}`)}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{errors.status}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              )}
            </SimpleGrid>
            
            {!isEdit && (
              <>
                <Divider borderColor={dividerColor} my={2} />
                
                <Text fontSize="xl" fontWeight="bold">
                  {t('users.password')}
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Field name="password">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!errors.password && touched.password} isRequired>
                        <FormLabel htmlFor="password">{t('users.password')}</FormLabel>
                        <InputGroup>
                          <Input
                            {...field}
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('users.passwordPlaceholder')}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              icon={showPassword ? <FiEyeOff /> : <FiEye />}
                              variant="ghost"
                              size="sm"
                              onClick={handleTogglePassword}
                            />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>{errors.password}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  
                  <Field name="confirmPassword">
                    {({ field, form }: FieldProps) => (
                      <FormControl
                        isInvalid={!!errors.confirmPassword && touched.confirmPassword}
                        isRequired
                      >
                        <FormLabel htmlFor="confirmPassword">
                          {t('users.confirmPassword')}
                        </FormLabel>
                        <InputGroup>
                          <Input
                            {...field}
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder={t('users.confirmPasswordPlaceholder')}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={
                                showConfirmPassword ? 'Hide password' : 'Show password'
                              }
                              icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                              variant="ghost"
                              size="sm"
                              onClick={handleToggleConfirmPassword}
                            />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </SimpleGrid>
              </>
            )}
            
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

export default UserForm;
