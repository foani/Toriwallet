import React from 'react';
import { Flex, Spinner, Text, Box, useColorModeValue } from '@chakra-ui/react';

interface LoadingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullscreen?: boolean;
  transparent?: boolean;
  height?: string | number;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullscreen = false,
  transparent = false,
  height
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const spinnerColor = useColorModeValue('brand.500', 'brand.300');
  
  if (fullscreen) {
    return (
      <Flex
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg={transparent ? 'rgba(255, 255, 255, 0.7)' : bgColor}
        zIndex={9999}
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color={spinnerColor}
          size={size}
        />
        {text && (
          <Text mt={4} fontSize="md" fontWeight="medium">
            {text}
          </Text>
        )}
      </Flex>
    );
  }
  
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      py={8}
      height={height}
      width="100%"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color={spinnerColor}
        size={size}
      />
      {text && (
        <Text mt={4} fontSize="md" fontWeight="medium">
          {text}
        </Text>
      )}
    </Flex>
  );
};

export const LoadingOverlay: React.FC<{ isLoading: boolean; text?: string }> = ({
  isLoading,
  text
}) => {
  if (!isLoading) return null;
  
  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(255, 255, 255, 0.7)"
      zIndex={10}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="brand.500"
        size="md"
      />
      {text && (
        <Text mt={4} fontSize="md" fontWeight="medium">
          {text}
        </Text>
      )}
    </Box>
  );
};

export default Loading;
