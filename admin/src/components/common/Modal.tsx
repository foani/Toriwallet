import React from 'react';
import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useColorModeValue,
  Box,
  ModalProps as ChakraModalProps
} from '@chakra-ui/react';

export interface ModalProps extends Omit<ChakraModalProps, 'children'> {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonProps?: React.ComponentProps<typeof Button>;
  cancelButtonProps?: React.ComponentProps<typeof Button>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  isCentered?: boolean;
  hideFooter?: boolean;
  hideCloseButton?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  title,
  isOpen,
  onClose,
  onConfirm,
  confirmText = '확인',
  cancelText = '취소',
  confirmButtonProps,
  cancelButtonProps,
  size = 'md',
  isCentered = false,
  hideFooter = false,
  hideCloseButton = false,
  isLoading = false,
  children,
  ...rest
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <ChakraModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      isCentered={isCentered}
      {...rest}
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent bg={bgColor} borderColor={borderColor} borderWidth="1px">
        <ModalHeader>{title}</ModalHeader>
        {!hideCloseButton && <ModalCloseButton />}
        <ModalBody>
          <Box position="relative">
            {children}
          </Box>
        </ModalBody>
        {!hideFooter && (
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={onClose}
              isDisabled={isLoading}
              {...cancelButtonProps}
            >
              {cancelText}
            </Button>
            {onConfirm && (
              <Button
                colorScheme="brand"
                onClick={onConfirm}
                isLoading={isLoading}
                {...confirmButtonProps}
              >
                {confirmText}
              </Button>
            )}
          </ModalFooter>
        )}
      </ModalContent>
    </ChakraModal>
  );
};

export default Modal;
