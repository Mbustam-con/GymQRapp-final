import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';

class SmartNotificationService {
  static STORAGE_KEYS = {
    NOTIFICATION_SETTINGS: '@notification_settings',
    WORKOUT_PATTERNS: '@workout_patterns',
    LAST_GYM_VISIT: '@last_gym_visit',
  };

  static defaultSettings = {
    locationReminders: true,
    workoutReminders: true,
    quickAccess: true,
    motivationalMessages: true,
    weeklyStats: false,
    reminderTimes: ['09:00', '18:00'], // Default workout reminder times
  };

  static async initialize() {
    // Initialize base notification service
    NotificationService.configure();
    
    // Create additional channels for smart notifications
    if (Platform.OS === 'android') {
      PushNotification.createChannel({
        channelId: 'workout-reminders',
        channelName: 'Workout Reminders',
        channelDescription: 'Smart workout reminders based on your patterns',
        soundName: 'default',
        importance: 4,
        vibrate: true,
      });

      PushNotification.createChannel({
        channelId: 'quick-access',
        channelName: 'Quick Access',
        channelDescription: 'Quick access to your gym QR code',
        soundName: 'default',
        importance: 3,
        vibrate: false,
      });
    }
  }

  static async getNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem(this.STORAGE_KEYS.NOTIFICATION_SETTINGS);
      return settings ? JSON.parse(settings) : this.defaultSettings;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return this.defaultSettings;
    }
  }

  static async saveNotificationSettings(settings) {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.NOTIFICATION_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  static async showLocationBasedReminder(gymName) {
    const settings = await this.getNotificationSettings();
    if (!settings.locationReminders) return;

    PushNotification.localNotification({
      channelId: 'gym-qr-channel',
      title: `Welcome to ${gymName}! 💪`,
      message: 'Your QR code is ready. Tap to display it.',
      smallIcon: 'ic_notification',
      bigText: 'Quick access to your gym QR code. Have a great workout!',
      playSound: true,
      vibrate: true,
      autoCancel: true,
      actions: ['Show QR', 'Dismiss'],
      userInfo: { action: 'show_qr' },
    });
  }

  static async showWorkoutReminder(gymName, isRegularTime = false) {
    const settings = await this.getNotificationSettings();
    if (!settings.workoutReminders) return;

    const messages = isRegularTime ? [
      `Time for your workout at ${gymName}! 🏋️`,
      `Your usual workout time at ${gymName} 💪`,
      `Ready to crush it at ${gymName}? 🔥`,
    ] : [
      `Haven't seen you at ${gymName} lately 🤔`,
      `Your gym QR is ready when you are! 💪`,
      `Time to get back to ${gymName}? 🏃‍♂️`,
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    PushNotification.localNotification({
      channelId: 'workout-reminders',
      title: 'Workout Time!',
      message: message,
      smallIcon: 'ic_notification',
      bigText: 'Your gym QR code is ready to go. Tap for quick access.',
      playSound: true,
      vibrate: true,
      autoCancel: true,
      actions: ['Show QR', 'Remind Later', 'Dismiss'],
      userInfo: { action: 'workout_reminder' },
    });
  }

  static async showQuickAccessNotification() {
    const settings = await this.getNotificationSettings();
    if (!settings.quickAccess) return;

    PushNotification.localNotification({
      channelId: 'quick-access',
      title: 'Quick QR Access',
      message: 'Tap for instant gym QR code display',
      smallIcon: 'ic_notification',
      ongoing: false,
      playSound: false,
      vibrate: false,
      autoCancel: true,
      actions: ['Show QR'],
      userInfo: { action: 'quick_access' },
    });
  }

  static async showMotivationalMessage() {
    const settings = await this.getNotificationSettings();
    if (!settings.motivationalMessages) return;

    const messages = [
      'Every workout counts! 💪',
      'You\'re stronger than yesterday! 🔥',
      'Consistency is key to success! ⭐',
      'Your future self will thank you! 🙌',
      'One rep closer to your goals! 🎯',
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    PushNotification.localNotification({
      channelId: 'workout-reminders',
      title: 'Stay Motivated!',
      message: message,
      smallIcon: 'ic_notification',
      playSound: false,
      vibrate: true,
      autoCancel: true,
    });
  }

  static async recordGymVisit(gymName) {
    try {
      const visitData = {
        gymName,
        timestamp: Date.now(),
        date: new Date().toDateString(),
      };

      // Save last visit
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.LAST_GYM_VISIT,
        JSON.stringify(visitData)
      );

      // Update workout patterns
      const patterns = await this.getWorkoutPatterns();
      const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hour = new Date().getHours();

      patterns.weeklyVisits[today] = (patterns.weeklyVisits[today] || 0) + 1;
      patterns.hourlyVisits[hour] = (patterns.hourlyVisits[hour] || 0) + 1;
      patterns.totalVisits += 1;

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.WORKOUT_PATTERNS,
        JSON.stringify(patterns)
      );

    } catch (error) {
      console.error('Error recording gym visit:', error);
    }
  }

  static async getWorkoutPatterns() {
    try {
      const patterns = await AsyncStorage.getItem(this.STORAGE_KEYS.WORKOUT_PATTERNS);
      return patterns ? JSON.parse(patterns) : {
        weeklyVisits: {}, // Day of week -> visit count
        hourlyVisits: {}, // Hour -> visit count
        totalVisits: 0,
        preferredDays: [],
        preferredTimes: [],
      };
    } catch (error) {
      console.error('Error loading workout patterns:', error);
      return {
        weeklyVisits: {},
        hourlyVisits: {},
        totalVisits: 0,
        preferredDays: [],
        preferredTimes: [],
      };
    }
  }

  static async scheduleSmartReminders() {
    const settings = await this.getNotificationSettings();
    const patterns = await this.getWorkoutPatterns();

    // Cancel existing scheduled notifications
    PushNotification.cancelAllLocalNotifications();

    if (settings.workoutReminders && patterns.totalVisits > 5) {
      // Schedule reminders based on user patterns
      const preferredDays = this.getPreferredWorkoutDays(patterns.weeklyVisits);
      const preferredTimes = this.getPreferredWorkoutTimes(patterns.hourlyVisits);

      preferredDays.forEach(day => {
        preferredTimes.forEach(time => {
          this.scheduleWeeklyReminder(day, time);
        });
      });
    } else {
      // Schedule default reminders
      settings.reminderTimes.forEach(time => {
        this.scheduleDefaultReminder(time);
      });
    }
  }

  static getPreferredWorkoutDays(weeklyVisits) {
    const days = Object.keys(weeklyVisits).map(Number);
    return days.sort((a, b) => weeklyVisits[b] - weeklyVisits[a]).slice(0, 3);
  }

  static getPreferredWorkoutTimes(hourlyVisits) {
    const hours = Object.keys(hourlyVisits).map(Number);
    return hours.sort((a, b) => hourlyVisits[b] - hourlyVisits[a]).slice(0, 2);
  }

  static scheduleWeeklyReminder(dayOfWeek, hour) {
    const now = new Date();
    const reminderDate = new Date();
    
    // Set to next occurrence of this day and hour
    reminderDate.setDate(now.getDate() + ((dayOfWeek + 7 - now.getDay()) % 7));
    reminderDate.setHours(hour, 0, 0, 0);

    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 7);
    }

    PushNotification.localNotificationSchedule({
      channelId: 'workout-reminders',
      title: 'Workout Reminder',
      message: 'Time for your usual workout! 💪',
      date: reminderDate,
      repeatType: 'week',
      actions: ['Show QR', 'Remind Later'],
      userInfo: { action: 'scheduled_reminder' },
    });
  }

  static scheduleDefaultReminder(timeString) {
    const [hour, minute] = timeString.split(':').map(Number);
    const reminderDate = new Date();
    reminderDate.setHours(hour, minute, 0, 0);

    if (reminderDate <= new Date()) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    PushNotification.localNotificationSchedule({
      channelId: 'workout-reminders',
      title: 'Workout Time!',
      message: 'Ready for your workout? 🏋️‍♂️',
      date: reminderDate,
      repeatType: 'day',
      actions: ['Show QR', 'Remind Later'],
      userInfo: { action: 'daily_reminder' },
    });
  }

  // Test functions for settings
  static async testLocationNotification() {
    this.showLocationBasedReminder('Test Gym');
  }

  static async testWorkoutReminder() {
    this.showWorkoutReminder('Test Gym', true);
  }

  static async testQuickAccess() {
    this.showQuickAccessNotification();
  }

  static async testMotivational() {
    this.showMotivationalMessage();
  }
}

export default SmartNotificationService;