import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const { width, height } = Dimensions.get('window');

const QRDisplay = ({ 
  gym, 
  gyms, 
  settings, 
  onShowSettings, 
  onShowSetup, 
  onShowGymSelector,
  onShowLocationManager,
  onShakeSimulate 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Show setup if no gym
  if (!gym) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Gym Access</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={onShowSettings}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🏋️‍♂️</Text>
            </View>
            <Text style={styles.emptyTitle}>No Gym Membership</Text>
            <Text style={styles.emptyDescription}>
              Add your gym membership QR code for instant access at the gym entrance
            </Text>
            
            <TouchableOpacity style={styles.setupButton} onPress={onShowSetup}>
              <Text style={styles.setupButtonText}>Add Membership</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.hintCard}>
            <Text style={styles.hintText}>
              💡 Use widgets and notifications for quick access to your QR code!
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const qrSize = Math.min(width, height) * 0.6;

  // Check if gym has location set
  const hasLocation = gym.coordinates && gym.coordinates.latitude && gym.coordinates.longitude;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header with Gym Info */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{gym.name}</Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitle}>Membership Card</Text>
              {hasLocation && (
                <View style={styles.locationIndicator}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>Location Set</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={onShowSettings}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Membership Card */}
      <View style={styles.cardContainer}>
        <View style={styles.membershipCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardGymName}>{gym.name}</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <Text style={styles.cardTime}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrSection}>
            <View style={styles.qrFrame}>
              {/* Corner Brackets */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* QR Code */}
              <View style={styles.qrCodeContainer}>
                {gym.qrCode ? (
                  <QRCode
                    value={gym.qrCode}
                    size={qrSize * 0.85}
                    color="#1a1a1a"
                    backgroundColor="#ffffff"
                    logoSize={0}
                  />
                ) : (
                  <View style={styles.qrPlaceholder}>
                    <Text style={styles.qrPlaceholderIcon}>📱</Text>
                    <Text style={styles.qrPlaceholderText}>No QR Data</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <Text style={styles.cardInstruction}>
              Present this QR code at gym entrance
            </Text>
            {gym.qrCode && (
              <TouchableOpacity 
                style={styles.viewDataButton}
                onPress={() => Alert.alert('Membership Data', gym.qrCode)}
              >
                <Text style={styles.viewDataText}>View Data</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Location Status Card */}
        {hasLocation && (
          <View style={styles.locationStatusCard}>
            <View style={styles.locationStatusRow}>
              <Text style={styles.locationStatusIcon}>📍</Text>
              <View style={styles.locationStatusInfo}>
                <Text style={styles.locationStatusTitle}>Auto-access enabled</Text>
                <Text style={styles.locationStatusSubtitle}>
                  QR will show automatically when within {gym.proximityDistance || 100}m of gym
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.locationSettingsButton}
                onPress={() => onShowLocationManager && onShowLocationManager()}
              >
                <Text style={styles.locationSettingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Access Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>⚡ Quick Access Methods</Text>
          <Text style={styles.tipsText}>
            • Use the home screen widget for instant access{'\n'}
            • Tap notifications to open QR immediately{'\n'}
            • Long press app icon for shortcuts{'\n'}
            {hasLocation && '• Auto-display when near your gym'}
          </Text>
        </View>
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        {gyms.length > 1 && (
          <TouchableOpacity style={styles.action} onPress={onShowGymSelector}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>🔄</Text>
            </View>
            <Text style={styles.actionText}>Switch Gym</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.action} onPress={onShowSetup}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>➕</Text>
          </View>
          <Text style={styles.actionText}>Add Gym</Text>
        </TouchableOpacity>

        {onShowLocationManager && (
          <TouchableOpacity style={styles.action} onPress={() => onShowLocationManager()}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>📍</Text>
            </View>
            <Text style={styles.actionText}>Location</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.action} onPress={onShakeSimulate}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>🚀</Text>
          </View>
          <Text style={styles.actionText}>Quick Test</Text>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  locationIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  locationText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  setupButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    borderWidth: 1,
    borderColor: '#333',
  },
  hintText: {
    color: '#007AFF',
    fontSize: 14,
    lineHeight: 20,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  membershipCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardGymName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  cardTime: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrFrame: {
    position: 'relative',
    padding: 20,
    backgroundColor: '#333',
    borderRadius: 16,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
  },
  qrCodeContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    borderStyle: 'dashed',
  },
  qrPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  qrPlaceholderText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
  },
  cardFooter: {
    alignItems: 'center',
  },
  cardInstruction: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  viewDataButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDataText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  locationStatusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderLeftWidth: 4,
  },
  locationStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationStatusIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  locationStatusInfo: {
    flex: 1,
  },
  locationStatusTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationStatusSubtitle: {
    color: '#999',
    fontSize: 12,
    lineHeight: 16,
  },
  locationSettingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationSettingsIcon: {
    fontSize: 14,
  },
  tipsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  tipsTitle: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    color: '#ccc',
    fontSize: 12,
    lineHeight: 18,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 32,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  action: {
    alignItems: 'center',
    padding: 12,
    minWidth: 60,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default QRDisplay;