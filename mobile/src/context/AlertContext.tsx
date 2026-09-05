import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomAlert, { AlertButton } from '../components/CustomAlert';
import CustomToast from '../components/CustomToast';

interface AlertOptions {
  title: string;
  message: string;
  type?: 'info' | 'error' | 'success' | 'warning' | 'destructive';
  buttons?: AlertButton[];
}

interface ToastOptions {
  message: string;
  title?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
  showToast: (options: string | ToastOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'info' | 'error' | 'success' | 'warning' | 'destructive';
    buttons?: AlertButton[];
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    title?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
  }>({
    visible: false,
    message: '',
  });

  const showAlert = (options: AlertOptions) => {
    setAlertState({
      visible: true,
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      buttons: options.buttons || [{ text: 'OK', style: 'default' }],
    });
  };

  const hideAlert = () => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  const showToast = (options: string | ToastOptions) => {
    if (typeof options === 'string') {
      setToastState({
        visible: true,
        message: options,
        type: 'info',
      });
    } else {
      setToastState({
        visible: true,
        message: options.message,
        title: options.title,
        type: options.type || 'info',
        duration: options.duration || 3000,
      });
    }
  };

  const hideToast = () => {
    setToastState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, showToast }}>
      {children}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttons={alertState.buttons}
        onClose={hideAlert}
      />
      <CustomToast
        visible={toastState.visible}
        message={toastState.message}
        title={toastState.title}
        type={toastState.type}
        duration={toastState.duration}
        onDismiss={hideToast}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
