import React from 'react';
import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps,
  Icon,
  Spinner
} from '@chakra-ui/react';
import { IconType } from 'react-icons';

export interface ButtonProps extends ChakraButtonProps {
  isLoading?: boolean;
  leftIcon?: IconType;
  rightIcon?: IconType;
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  colorScheme?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading,
  leftIcon,
  rightIcon,
  variant = 'solid',
  colorScheme = 'brand',
  size = 'md',
  ...rest
}) => {
  return (
    <ChakraButton
      variant={variant}
      colorScheme={colorScheme}
      size={size}
      isLoading={isLoading}
      leftIcon={leftIcon ? <Icon as={leftIcon} /> : undefined}
      rightIcon={rightIcon ? <Icon as={rightIcon} /> : undefined}
      _hover={{
        transform: 'translateY(-1px)',
        boxShadow: 'md'
      }}
      _active={{
        transform: 'translateY(0)',
        boxShadow: 'none'
      }}
      {...rest}
    >
      {children}
    </ChakraButton>
  );
};

export default Button;
