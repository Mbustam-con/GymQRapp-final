import PushNotification from 'react-native-push-notification';
import { Platform, AppState } from 'react-native';

class NotificationService {
  static isConfigured = false;

  static configure() {
    if (this.isConfigured) return;

    PushNotification.configure({
      onRegister: function (token) {
        console.log('Notification TOKEN:', token);
      },
      
      onNotification: function (notification) {
        console.log('NOTIFICATION RECEIVED:', notification);
        
        // Handle notification tap - this opens the app to QR screen
        if (notification.userInteraction) {
          // User tapped the notification
          if (notification.data && notification.data.action === 'show_qr') {
            // Navigate to QR screen or trigger QR display
            console.log('User wants to show QR from notification');
            // This will be handled by your main app component
          }
        }
        
        // Required on iOS only (see fetchCompletionHandler docs)
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'gym-qr-channel',
          channelName: 'Gym QR Access',
          channelDescription: 'Quick access to your gym QR code',
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Gym QR channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'location-alerts',
          channelName: 'Location Alerts',
          channelDescription: 'Alerts when you arrive at your gym',
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Location alerts channel created: ${created}`)
      );
    }

    this.isConfigured = true;
  }

  // Show notification when user arrives near gym
  static showNearGymNotification(gymName, distance) {
    this.configure();

    PushNotification.localNotification({
      channelId: 'location-alerts',
      title: `📍 Arrived at ${gymName}`,
      message: `You're ${Math.round(distance)}m away. Tap for instant QR access!`,
      bigText: `Welcome to ${gymName}! Your membership QR code is ready. Tap this notification for instant access.`,
      subText: 'Gym QR App',
      smallIcon: 'ic_notification',
      largeIcon: 'ic_launcher',
      color: '#007AFF',
      vibrate: true,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      autoCancel: true,
      ongoing: false,
      actions: ['🎫 Show QR Code', '🔕 Dismiss'],
      invokeApp: true,
      userInfo: {
        action: 'show_qr',
        gymName: gymName,
        source: 'location_trigger'
      },
    });
  }

  // Show persistent quick access notification
  static showQuickAccessNotification(gymName) {
    this.configure();

    PushNotification.localNotification({
      channelId: 'gym-qr-channel',
      title: '🎫 Quick QR Access',
      message: `Tap for ${gymName} membership QR code`,
      bigText: `Quick access to your ${gymName} membership. Tap to display your QR code instantly.`,
      subText: 'Always Available',
      smallIcon: 'ic_notification',
      color: '#4CAF50',
      vibrate: false,
      playSound: false,
      ongoing: true, // Makes it persistent
      autoCancel: false,
      actions: ['📱 Show QR', '⚙️ Settings'],
      invokeApp: true,
      userInfo: {
        action: 'show_qr',
        gymName: gymName,
        source: 'quick_access'
      },
    });
  }

  // Show notification for shake detection backup
  static showShakeReminderNotification() {
    this.configure();

    PushNotification.localNotification({
      channelId: 'gym-qr-channel',
      title: '📱 Shake Feature Available',
      message: 'Shake your phone anytime for instant QR access',
      smallIcon: 'ic_notification',
      vibrate: true,
      playSound: false,
      autoCancel: true,
      timeoutAfter: 5000,
      userInfo: {
        action: 'shake_reminder'
      },
    });
  }

  // Schedule workout reminders
  static scheduleWorkoutReminder(gymName, reminderTime) {
    this.configure();

    const reminderDate = new Date();
    const [hours, minutes] = reminderTime.split(':');
    reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If time has passed today, schedule for tomorrow
    if (reminderDate <= new Date()) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    PushNotification.localNotificationSchedule({
      channelId: 'gym-qr-channel',
      title: '💪 Workout Time!',
      message: `Ready for ${gymName}? Your QR code is ready!`,
      date: reminderDate,
      repeatType: 'day',
      actions: ['🎫 Show QR', '⏰ Remind Later'],
      userInfo: {
        action: 'show_qr',
        gymName: gymName,
        source: 'workout_reminder'
      },
    });
  }

  // Clear all notifications
  static clearAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Clear specific notification types
  static clearLocationNotifications() {
    // Note: React Native doesn't have great specific notification clearing
    // This is a limitation we work around by using different channels
    console.log('Clearing location notifications...');
  }

  // Test notification (for settings)
  static showTestNotification(gymName = 'Test Gym') {
    this.configure();

    PushNotification.localNotification({
      channelId: 'gym-qr-channel',
      title: '🧪 Test Notification',
      message: `This is how notifications will look for ${gymName}`,
      actions: ['🎫 Show QR'],
      autoCancel: true,
      userInfo: {
        action: 'show_qr',
        gymName: gymName,
        source: 'test'
      },
    });
  }

  // Check if notifications are enabled
  static checkPermissions() {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve(permissions);
      });
    });
  }

  // Request notification permissions
  static requestPermissions() {
    return new Promise((resolve) => {
      PushNotification.requestPermissions()
        .then((permissions) => {
          resolve(permissions);
        })
        .catch((error) => {
          console.error('Notification permission error:', error);
          resolve(false);
        });
    });
  }
}

export default NotificationService;