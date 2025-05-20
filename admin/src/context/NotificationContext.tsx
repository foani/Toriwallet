import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  useToast, 
  ToastId, 
  UseToastOptions,
  Box,
  Flex,
  Text,
  CloseButton
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon, WarningTwoIcon } from '@chakra-ui/icons';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  isClosable?: boolean;
  position?: UseToastOptions['position'];
}

interface NotificationContextType {
  showNotification: (type: NotificationType, options: NotificationOptions) => ToastId;
  dismissNotification: (id: ToastId) => void;
  dismissAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();
  const [toastIds, setToastIds] = useState<ToastId[]>([]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="green.500" />;
      case 'warning':
        return <WarningIcon color="orange.500" />;
      case 'error':
        return <WarningTwoIcon color="red.500" />;
      case 'info':
      default:
        return <InfoIcon color="blue.500" />;
    }
  };

  const getStatusColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'green';
      case 'warning':
        return 'orange';
      case 'error':
        return 'red';
      case 'info':
      default:
        return 'blue';
    }
  };

  const showNotification = useCallback(
    (type: NotificationType, options: NotificationOptions) => {
      const {
        title,
        description,
        duration = 5000,
        isClosable = true,
        position = 'top'
      } = options;

      const statusColor = getStatusColor(type);
      const icon = getIcon(type);

      const id = toast({
        position,
        duration,
        isClosable,
        render: ({ onClose }) => (
          <Box
            color="white"
            p={3}
            bg={`${statusColor}.500`}
            borderRadius="md"
            boxShadow="md"
          >
            <Flex alignItems="center">
              <Box mr={3} mt={1}>
                {icon}
              </Box>
              <Box flex="1">
                {title && (
                  <Text fontWeight="bold" mb={description ? 1 : 0}>
                    {title}
                  </Text>
                )}
                {description && <Text>{description}</Text>}
              </Box>
              {isClosable && <CloseButton onClick={onClose} />}
            </Flex>
          </Box>
        )
      });

      setToastIds((prev) => [...prev, id]);
      return id;
    },
    [toast]
  );

  const dismissNotification = useCallback(
    (id: ToastId) => {
      toast.close(id);
      setToastIds((prev) => prev.filter((toastId) => toastId !== id));
    },
    [toast]
  );

  const dismissAllNotifications = useCallback(() => {
    toastIds.forEach((id) => toast.close(id));
    setToastIds([]);
  }, [toast, toastIds]);

  return (
    <NotificationContext.Provider
      value={{ showNotification, dismissNotification, dismissAllNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
