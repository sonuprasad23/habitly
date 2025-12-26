import * as LocalAuthentication from 'expo-local-authentication';

export const authenticate = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Hillside',
    fallbackLabel: 'Use passcode',
  });

  return result.success;
};

