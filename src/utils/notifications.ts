import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { devLog } from './logger';

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    devLog('Registering for push notifications on device...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    devLog('Existing permission status:', existingStatus);
    if (existingStatus !== 'granted') {
      devLog('Requesting new permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      devLog('New permission status:', finalStatus);
    }
    if (finalStatus !== 'granted') {
      devLog('Permission not granted, alerting user.');
      alert('Failed to get push token for push notification!');
      return;
    }
    try {
      // projectId is required for EAS Build
      token = (await Notifications.getExpoPushTokenAsync({ projectId: process.env.EXPO_PUBLIC_PUSH_ID })).data;
      devLog('Expo Push Token obtained:', token);
    } catch (error) {
      console.error('Error getting Expo Push Token:', error);
      alert('Error getting push token. See console for details.');
      return;
    }
  } else {
    devLog('Not on a physical device, alerting user.');
    alert('Must use physical device for Push Notifications');
  }

  return token;
}


export async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is a test notification from your app.',
      data: { data: {
        route: 'schedule'
      } },
    },
    trigger: null, 
  });
}

