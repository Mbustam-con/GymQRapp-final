import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Vibration,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import PushNotification from 'react-native-push-notification';

// Import components
import QRDisplay from './src/components/QRDisplay';
import SettingsPanel from './src/components/SettingsPanel';
import LocationSetup from './src/components/LocationSetup';
import GymSelector from './src/components/GymSelector';
import GymManager from './src/components/GymManager';
import LocationManager from './src/components/LocationManager';

// Import services
import StorageService from './src/services/StorageService';

const App = () => {
  const [currentView, setCurrentView] = useState('qr');
  const [gyms, setGyms] = useState([]);
  const [activeGymId, setActiveGymId] = useState(null);
  const [editingGym, setEditingGym] = useState(null);
  const [settings, setSettings] = useState({
    shakeEnabled: false, // Disabled since we're not using react-native-shake
    vibrationEnabled: true,
    autoSwitchToQR: true,
    quickAccess: true,
    enableQuickNotifications: true,
    enableLocationNotifications: true,
    enableWorkoutReminders: false,
  });

  useEffect(() => {
    initializeApp();
    setupNotifications();
  }, []);

  const initializeApp = async () => {
    try {
      await requestPermissions();
      
      const savedGyms = await StorageService.getGyms();
      const savedActiveGymId = await StorageService.getActiveGym();
      const savedSettings = await StorageService.getSettings();
      
      setGyms(savedGyms || []);
      setActiveGymId(savedActiveGymId);
      
      if (savedSettings) {
        setSettings(savedSettings);
      }
      
      // If no gyms, show setup
      if (!savedGyms || savedGyms.length === 0) {
        setCurrentView('setup');
      }
    } catch (error) {
      console.error('App initialization error:', error);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ];

        // Request notification permission on Android 13+
        if (Platform.Version >= 33) {
          permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }

        const results = await PermissionsAndroid.requestMultiple(permissions);
        console.log('Permission results:', results);
      } catch (error) {
        console.error('Permission request error:', error);
      }
    }
  };

  const setupNotifications = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        if (notification.userInteraction) {
          // User tapped the notification
          if (notification.userInfo?.action === 'show_qr') {
            setCurrentView('qr');
          }
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

    if (Platform.OS === 'android') {
      PushNotification.createChannel({
        channelId: 'gym-qr-channel',
        channelName: 'Gym QR Notifications',
        channelDescription: 'Quick access notifications for your gym QR code',
        soundName: 'default',
        importance: 4,
        vibrate: true,
      });
    }
  };

  const handleSaveGym = async (gymData) => {
    try {
      let updatedGyms;
      
      if (editingGym) {
        // Update existing gym
        await StorageService.updateGym(editingGym.id, gymData);
        updatedGyms = await StorageService.getGyms();
        setEditingGym(null);
      } else {
        // Add new gym
        const newGym = await StorageService.addGym(gymData);
        updatedGyms = await StorageService.getGyms();
        
        // Set as active if it's the first gym
        if (!activeGymId) {
          setActiveGymId(newGym.id);
          await StorageService.setActiveGym(newGym.id);
        }
      }
      
      setGyms(updatedGyms);
      setCurrentView('qr');
    } catch (error) {
      console.error('Error saving gym:', error);
      Alert.alert('Error', 'Failed to save gym information.');
    }
  };

  const handleSelectGym = async (gymId) => {
    setActiveGymId(gymId);
    await StorageService.setActiveGym(gymId);
    setCurrentView('qr');
  };

  const handleDeleteGym = async (gymId) => {
    try {
      const updatedGyms = await StorageService.deleteGym(gymId);
      setGyms(updatedGyms);
      
      // If deleted gym was active, clear active gym
      if (activeGymId === gymId) {
        const newActiveId = updatedGyms.length > 0 ? updatedGyms[0].id : null;
        setActiveGymId(newActiveId);
        await StorageService.setActiveGym(newActiveId);
      }
      
      // If no gyms left, go to setup
      if (updatedGyms.length === 0) {
        setCurrentView('setup');
      } else {
        setCurrentView('qr');
      }
    } catch (error) {
      console.error('Error deleting gym:', error);
      Alert.alert('Error', 'Failed to delete gym.');
    }
  };

  const handleSaveSettings = async (newSettings) => {
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
  };

  const handleTestShake = () => {
    if (settings.vibrationEnabled) {
      Vibration.vibrate([100, 50, 100]);
    }
    
    Alert.alert(
      '📱 Quick Access Test',
      'This simulates quick QR access. Use the widget or notification for instant access!',
      [{ text: 'OK' }]
    );
  };

  const getActiveGym = () => {
    return gyms.find(gym => gym.id === activeGymId) || null;
  };

  // Navigation functions
  const showQR = () => setCurrentView('qr');
  const showSettings = () => setCurrentView('settings');
  const showSetup = () => {
    setEditingGym(null);
    setCurrentView('setup');
  };
  const showGymSelector = () => setCurrentView('gymSelector');
  const showGymManager = () => setCurrentView('gymManager');
  const showLocationManager = (gym = null) => {
    setEditingGym(gym || getActiveGym());
    setCurrentView('locationManager');
  };

  const activeGym = getActiveGym();

  // Render current view
  switch (currentView) {
    case 'settings':
      return (
        <SettingsPanel
          settings={settings}
          gyms={gyms}
          activeGym={activeGym}
          onSaveSettings={handleSaveSettings}
          onBack={showQR}
          onEditGym={showSetup}
          onTestShake={handleTestShake}
          onDeleteGym={handleDeleteGym}
        />
      );

    case 'setup':
      return (
        <LocationSetup
          onSave={handleSaveGym}
          onBack={gyms.length > 0 ? showQR : null}
        />
      );

    case 'gymSelector':
      return (
        <GymSelector
          gyms={gyms}
          activeGymId={activeGymId}
          onSelectGym={handleSelectGym}
          onAddGym={showSetup}
          onManageGyms={showGymManager}
          onShowSettings={showSettings}
        />
      );

    case 'gymManager':
      return (
        <GymManager
          gyms={gyms}
          activeGymId={activeGymId}
          onUpdateGym={async (gym) => {
            await StorageService.updateGym(gym.id, gym);
            const updatedGyms = await StorageService.getGyms();
            setGyms(updatedGyms);
          }}
          onDeleteGym={handleDeleteGym}
          onAddGym={showSetup}
          onBack={showGymSelector}
        />
      );

    case 'locationManager':
      return (
        <LocationManager
          gym={editingGym}
          onSave={async (updatedGym) => {
            if (updatedGym.id) {
              await StorageService.updateGym(updatedGym.id, updatedGym);
              const updatedGyms = await StorageService.getGyms();
              setGyms(updatedGyms);
            }
            setCurrentView('qr');
          }}
          onBack={() => setCurrentView('qr')}
          isEditing={!!editingGym}
        />
      );

    default: // 'qr'
      return (
        <QRDisplay
          gym={activeGym}
          gyms={gyms}
          settings={settings}
          onShowSettings={showSettings}
          onShowSetup={showSetup}
          onShowGymSelector={showGymSelector}
          onShowLocationManager={() => showLocationManager(activeGym)}
          onShakeSimulate={handleTestShake}
        />
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default App;