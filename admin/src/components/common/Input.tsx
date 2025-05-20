import React from 'react';
import {
  FormControl,
  FormLabel,
  Input as ChakraInput,
  InputProps as ChakraInputProps,
  FormErrorMessage,
  Textarea,
  TextareaProps,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  FormHelperText,
  useColorModeValue
} from '@chakra-ui/react';

export interface InputProps extends ChakraInputProps {
  label?: string;
  name: string;
  error?: string;
  helper?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  isRequired?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  error,
  helper,
  leftElement,
  rightElement,
  isRequired,
  ...rest
}) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const focusBorderColor = useColorModeValue('brand.500', 'brand.300');
  
  return (
    <FormControl isInvalid={!!error} isRequired={isRequired} mb={4}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <InputGroup>
        {leftElement && <InputLeftElement pointerEvents="none">{leftElement}</InputLeftElement>}
        <ChakraInput
          id={name}
          name={name}
          bg={bg}
          borderColor={borderColor}
          focusBorderColor={focusBorderColor}
          _hover={{ borderColor: borderColor }}
          pl={leftElement ? 10 : undefined}
          pr={rightElement ? 10 : undefined}
          {...rest}
        />
        {rightElement && <InputRightElement>{rightElement}</InputRightElement>}
      </InputGroup>
      {error ? (
        <FormErrorMessage>{error}</FormErrorMessage>
      ) : helper ? (
        <FormHelperText>{helper}</FormHelperText>
      ) : null}
    </FormControl>
  );
};

export interface TextareaInputProps extends TextareaProps {
  label?: string;
  name: string;
  error?: string;
  helper?: string;
  isRequired?: boolean;
}

export const TextareaInput: React.FC<TextareaInputProps> = ({
  label,
  name,
  error,
  helper,
  isRequired,
  ...rest
}) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const focusBorderColor = useColorModeValue('brand.500', 'brand.300');
  
  return (
    <FormControl isInvalid={!!error} isRequired={isRequired} mb={4}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Textarea
        id={name}
        name={name}
        bg={bg}
        borderColor={borderColor}
        focusBorderColor={focusBorderColor}
        _hover={{ borderColor: borderColor }}
        {...rest}
      />
      {error ? (
        <FormErrorMessage>{error}</FormErrorMessage>
      ) : helper ? (
        <FormHelperText>{helper}</FormHelperText>
      ) : null}
    </FormControl>
  );
};

export default Input;
