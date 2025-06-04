import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';

const SettingsPanel = ({ 
  settings, 
  gyms, 
  activeGym, 
  onSaveSettings, 
  onBack, 
  onEditGym, 
  onTestShake,
  onDeleteGym,
  onTestNotification 
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSaveSettings(localSettings);
    Alert.alert('Settings Saved', 'Your preferences have been updated.');
  };

  const updateSetting = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteGym = (gym) => {
    Alert.alert(
      'Remove Membership',
      `Remove "${gym.name}" from your saved memberships?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => onDeleteGym(gym.id)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Memberships Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Your Memberships</Text>
          
          {gyms.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏋️‍♂️</Text>
              <Text style={styles.emptyTitle}>No Memberships</Text>
              <Text style={styles.emptyDescription}>Add your first gym membership to get started</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={onEditGym}>
                <Text style={styles.addFirstButtonText}>Add Membership</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {gyms.map((gym) => (
                <View key={gym.id} style={[
                  styles.gymCard,
                  activeGym && activeGym.id === gym.id && styles.activeGymCard
                ]}>
                  <View style={styles.gymCardLeft}>
                    <View style={styles.gymIconContainer}>
                      <Text style={styles.gymIcon}>🏋️</Text>
                    </View>
                    <View style={styles.gymInfo}>
                      <Text style={styles.gymName}>
                        {gym.name}
                        {activeGym && activeGym.id === gym.id && (
                          <Text style={styles.activeLabel}> • Active</Text>
                        )}
                      </Text>
                      <Text style={styles.gymDate}>
                        Added {new Date(gym.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.gymOptionsButton}
                    onPress={() => handleDeleteGym(gym)}
                  >
                    <Text style={styles.gymOptionsIcon}>⋯</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity style={styles.addButton} onPress={onEditGym}>
                <View style={styles.addButtonIcon}>
                  <Text style={styles.addButtonPlus}>+</Text>
                </View>
                <Text style={styles.addButtonText}>Add Another Membership</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Quick Access Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Access</Text>
          <View style={styles.settingsCard}>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📳</Text>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Vibration Feedback</Text>
                  <Text style={styles.settingDescription}>Vibrate when actions are triggered</Text>
                </View>
              </View>
              <Switch
                value={localSettings.vibrationEnabled}
                onValueChange={(value) => updateSetting('vibrationEnabled', value)}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor={localSettings.vibrationEnabled ? '#fff' : '#666'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🚀</Text>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Auto Display</Text>
                  <Text style={styles.settingDescription}>Automatically show QR when triggered</Text>
                </View>
              </View>
              <Switch
                value={localSettings.autoDisplay}
                onValueChange={(value) => updateSetting('autoDisplay', value)}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor={localSettings.autoDisplay ? '#fff' : '#666'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <TouchableOpacity style={styles.testButton} onPress={onTestShake}>
                <Text style={styles.settingIcon}>🧪</Text>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Test Quick Access</Text>
                  <Text style={styles.settingDescription}>Try out the quick access features</Text>
                </View>
                <Text style={styles.testButtonText}>Test</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Location Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📍</Text>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Location-Based Features</Text>
                  <Text style={styles.settingDescription}>Enable automatic QR display near gym</Text>
                </View>
              </View>
              <Switch
                value={localSettings.locationEnabled}
                onValueChange={(value) => updateSetting('locationEnabled', value)}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor={localSettings.locationEnabled ? '#fff' : '#666'}
              />
            </View>
            
            {localSettings.locationEnabled && (
              <View style={styles.proximitySection}>
                <Text style={styles.proximityLabel}>
                  Proximity Distance: {localSettings.proximityDistance}m
                </Text>
                <Text style={styles.proximityDescription}>
                  How close to gym before auto-trigger
                </Text>
                <View style={styles.proximityButtons}>
                  <TouchableOpacity 
                    style={[styles.proximityButton, localSettings.proximityDistance === 25 && styles.proximityButtonActive]}
                    onPress={() => updateSetting('proximityDistance', 25)}
                  >
                    <Text style={[styles.proximityButtonText, localSettings.proximityDistance === 25 && styles.proximityButtonTextActive]}>25m</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.proximityButton, localSettings.proximityDistance === 50 && styles.proximityButtonActive]}
                    onPress={() => updateSetting('proximityDistance', 50)}
                  >
                    <Text style={[styles.proximityButtonText, localSettings.proximityDistance === 50 && styles.proximityButtonTextActive]}>50m</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.proximityButton, localSettings.proximityDistance === 100 && styles.proximityButtonActive]}
                    onPress={() => updateSetting('proximityDistance', 100)}
                  >
                    <Text style={[styles.proximityButtonText, localSettings.proximityDistance === 100 && styles.proximityButtonTextActive]}>100m</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.proximityButton, localSettings.proximityDistance === 200 && styles.proximityButtonActive]}
                    onPress={() => updateSetting('proximityDistance', 200)}
                  >
                    <Text style={[styles.proximityButtonText, localSettings.proximityDistance === 200 && styles.proximityButtonTextActive]}>200m</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🚀</Text>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Quick Access Notifications</Text>
                  <Text style={styles.settingDescription}>Show notification for instant QR access</Text>
                </View>
              </View>
              <Switch
                value={localSettings.enableQuickNotifications}
                onValueChange={(value) => updateSetting('enableQuickNotifications', value)}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor={localSettings.enableQuickNotifications ? '#fff' : '#666'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <TouchableOpacity style={styles.testButton} onPress={onTestNotification}>
                <Text style={styles.settingIcon}>🧪</Text>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Test Notifications</Text>
                  <Text style={styles.settingDescription}>Try different notification types</Text>
                </View>
                <Text style={styles.testButtonText}>Test</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <View style={styles.infoCard}>
            <Text style={styles.aboutTitle}>Gym QR Access</Text>
            <Text style={styles.aboutDescription}>
              Modern gym membership access with smart features
            </Text>
            <View style={styles.featuresContainer}>
              <Text style={styles.featureText}>✓ Multiple gym support</Text>
              <Text style={styles.featureText}>✓ Location-based access</Text>
              <Text style={styles.featureText}>✓ Quick access methods</Text>
              <Text style={styles.featureText}>✓ Secure local storage</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  gymCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  activeGymCard: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  gymCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gymIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gymIcon: {
    fontSize: 20,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  activeLabel: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  gymDate: {
    fontSize: 12,
    color: '#999',
  },
  gymOptionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gymOptionsIcon: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  addButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addButtonPlus: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  addButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  settingsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 18,
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  proximitySection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  proximityLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  proximityDescription: {
    color: '#999',
    fontSize: 13,
    marginBottom: 12,
  },
  proximityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  proximityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  proximityButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  proximityButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  proximityButtonTextActive: {
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresContainer: {
    alignItems: 'flex-start',
  },
  featureText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 6,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SettingsPanel;