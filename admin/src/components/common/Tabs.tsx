import React from 'react';
import {
  Tabs as ChakraTabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
  Box,
  Flex,
  Text,
  Icon,
  BoxProps
} from '@chakra-ui/react';
import { IconType } from 'react-icons';

export interface TabItem {
  label: string;
  content: React.ReactNode;
  icon?: IconType;
  count?: number;
}

export interface TabsProps extends BoxProps {
  tabs: TabItem[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  variant?: 'line' | 'enclosed' | 'enclosed-colored' | 'soft-rounded' | 'solid-rounded' | 'unstyled';
  colorScheme?: string;
  isLazy?: boolean;
  isFitted?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultIndex = 0,
  onChange,
  variant = 'line',
  colorScheme = 'brand',
  isLazy = true,
  isFitted = false,
  size = 'md',
  ...rest
}) => {
  const tabBg = useColorModeValue('gray.100', 'gray.700');
  const tabActiveBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const countBg = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box width="100%" {...rest}>
      <ChakraTabs
        variant={variant}
        colorScheme={colorScheme}
        defaultIndex={defaultIndex}
        onChange={onChange}
        isLazy={isLazy}
        size={size}
      >
        <TabList overflowX="auto" overflowY="hidden" borderColor={borderColor}>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              py={3}
              px={4}
              fontWeight="medium"
              borderColor={borderColor}
              _selected={{
                bg: variant === 'enclosed' ? tabActiveBg : undefined,
                borderBottomColor: variant === 'enclosed' ? tabActiveBg : undefined
              }}
              isFitted={isFitted}
            >
              <Flex alignItems="center">
                {tab.icon && <Icon as={tab.icon} mr={2} />}
                <Text>{tab.label}</Text>
                {tab.count !== undefined && (
                  <Flex
                    ml={2}
                    px={2}
                    py={1}
                    borderRadius="full"
                    bg={countBg}
                    fontSize="xs"
                    fontWeight="bold"
                    alignItems="center"
                    justifyContent="center"
                    minW="18px"
                    height="18px"
                  >
                    {tab.count}
                  </Flex>
                )}
              </Flex>
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab, index) => (
            <TabPanel key={index} p={4}>
              {tab.content}
            </TabPanel>
          ))}
        </TabPanels>
      </ChakraTabs>
    </Box>
  );
};

export default Tabs;
