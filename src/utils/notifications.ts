import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Registers the device for push notifications and returns the Expo Push Token.
 * Requests necessary permissions if not already granted.
 * @returns {Promise<string | undefined>} The Expo Push Token if successful, otherwise undefined.
 */
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
    console.log('Registering for push notifications on device...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    console.log('Existing permission status:', existingStatus);
    if (existingStatus !== 'granted') {
      console.log('Requesting new permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('New permission status:', finalStatus);
    }
    if (finalStatus !== 'granted') {
      console.log('Permission not granted, alerting user.');
      alert('Failed to get push token for push notification!');
      return;
    }
    try {
      // projectId is required for EAS Build
      token = (await Notifications.getExpoPushTokenAsync({ projectId: '19c11133-81b6-44cb-908b-61cf473cbbc9' })).data;
      console.log('Expo Push Token obtained:', token);
    } catch (error) {
      console.error('Error getting Expo Push Token:', error);
      alert('Error getting push token. See console for details.');
      return;
    }
  } else {
    console.log('Not on a physical device, alerting user.');
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Schedules a test push notification to be displayed immediately.
 */
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

