import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  InputGroup,
  InputRightElement,
  Icon,
  useColorModeValue,
  Image,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Select,
  useColorMode,
  IconButton,
  FormErrorMessage
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiMoon, FiSun } from 'react-icons/fi';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { useAuth, useLanguage } from '@/context';
import { useTranslation } from 'react-i18next';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

const loginSchema = Yup.object().shape({
  email: Yup.string().email('유효한 이메일을 입력하세요').required('이메일은 필수 항목입니다'),
  password: Yup.string().required('비밀번호는 필수 항목입니다'),
  twoFactorCode: Yup.string()
});

const Login: React.FC = () => {
  const { login, error, loading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/';
  
  const { setLanguage, language, supportedLanguages } = useLanguage();
  const { colorMode, toggleColorMode } = useColorMode();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  
  const formBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleTogglePassword = () => setShowPassword(!showPassword);
  
  const handleSubmit = async (values: {
    email: string;
    password: string;
    twoFactorCode?: string;
  }) => {
    const success = await login({
      email: values.email,
      password: values.password,
      twoFactorCode: values.twoFactorCode
    });
    
    if (success) {
      // 로그인 성공 시 이전 페이지 또는 홈으로 이동
      navigate(from, { replace: true });
    } else if (error?.includes('2FA')) {
      // 2단계 인증이 필요한 경우
      setShowTwoFactor(true);
    }
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };
  
  return (
    <Flex minH="100vh" alignItems="center" justifyContent="center" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box position="absolute" top={4} right={4}>
        <HStack spacing={2}>
          <Select
            size="sm"
            value={language}
            onChange={handleLanguageChange}
            variant="filled"
            width="120px"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </Select>
          <IconButton
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            aria-label="Toggle color mode"
            size="sm"
          />
        </HStack>
      </Box>
      
      <Box
        maxW="400px"
        w="full"
        bg={formBg}
        p={8}
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        boxShadow="lg"
      >
        <VStack spacing={6} align="center" mb={8}>
          <Image
            src="/logo.png"
            alt="TORI Wallet"
            height="60px"
            fallbackSrc="/logo-placeholder.png"
          />
          <Heading fontSize="2xl">{t('common.welcome')}</Heading>
          <Text color="gray.500">{t('login.title')}</Text>
        </VStack>
        
        <Formik
          initialValues={{
            email: '',
            password: '',
            twoFactorCode: ''
          }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <VStack spacing={4}>
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                
                <Field name="email">
                  {({ field }: FieldProps) => (
                    <FormControl isInvalid={!!errors.email && touched.email}>
                      <FormLabel htmlFor="email">{t('common.email')}</FormLabel>
                      <Input
                        {...field}
                        id="email"
                        placeholder="name@company.com"
                        type="email"
                        autoComplete="email"
                      />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                
                <Field name="password">
                  {({ field }: FieldProps) => (
                    <FormControl isInvalid={!!errors.password && touched.password}>
                      <FormLabel htmlFor="password">{t('common.password')}</FormLabel>
                      <InputGroup>
                        <Input
                          {...field}
                          id="password"
                          placeholder="••••••••"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                        />
                        <InputRightElement>
                          <Icon
                            as={showPassword ? FiEyeOff : FiEye}
                            cursor="pointer"
                            onClick={handleTogglePassword}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                
                {showTwoFactor && (
                  <Field name="twoFactorCode">
                    {({ field }: FieldProps) => (
                      <FormControl isInvalid={!!errors.twoFactorCode && touched.twoFactorCode}>
                        <FormLabel htmlFor="twoFactorCode">
                          {t('login.twoFactorCode')}
                        </FormLabel>
                        <Input
                          {...field}
                          id="twoFactorCode"
                          placeholder="000000"
                          type="text"
                          maxLength={6}
                        />
                        <FormErrorMessage>{errors.twoFactorCode}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                )}
                
                <Button
                  type="submit"
                  colorScheme="brand"
                  width="full"
                  size="lg"
                  isLoading={loading}
                  mt={4}
                >
                  {t('common.login')}
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
      </Box>
    </Flex>
  );
};

export default Login;
