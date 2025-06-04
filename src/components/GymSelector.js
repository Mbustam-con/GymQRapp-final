
// Simplified GymSelector.js (replace the one you created)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

const GymSelector = ({ 
  gyms, 
  activeGymId, 
  onSelectGym, 
  onAddGym, 
  onManageGyms, 
  onShowSettings 
}) => {
  const handleGymSelect = (gym) => {
    Alert.alert(
      'Switch to ' + gym.name,
      'Use this gym for QR code display?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Switch', 
          onPress: () => onSelectGym(gym.id),
          style: 'default'
        }
      ]
    );
  };

  const renderGymCard = (gym) => {
    const isActive = gym.id === activeGymId;

    return (
      <TouchableOpacity
        key={gym.id}
        style={[styles.gymCard, isActive && styles.activeGymCard]}
        onPress={() => handleGymSelect(gym)}
        activeOpacity={0.7}
      >
        <View style={styles.gymCardHeader}>
          <View style={styles.gymInfo}>
            <Text style={[styles.gymName, isActive && styles.activeGymText]}>
              {gym.name}
            </Text>
            <Text style={styles.gymDetails}>
              Added {new Date(gym.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.gymCardActions}>
            {isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>✅ Active</Text>
              </View>
            )}
            <Text style={[styles.arrow, isActive && styles.activeArrow]}>→</Text>
          </View>
        </View>

        <View style={styles.gymPreview}>
          <Text style={styles.qrPreviewLabel}>QR Code Preview:</Text>
          <Text style={styles.qrPreview} numberOfLines={1}>
            {gym.qrCode.substring(0, 30)}...
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Select Gym</Text>
          <TouchableOpacity 
            style={styles.settingsButton} 
            onPress={onShowSettings}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>
          {gyms.length} gym{gyms.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {gyms.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>No Gyms Added</Text>
            <Text style={styles.emptySubtitle}>
              Add your first gym to get started
            </Text>
          </View>
        ) : (
          <View style={styles.gymsList}>
            {gyms.map(renderGymCard)}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={onAddGym}
          >
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.quickActionText}>Add New Gym</Text>
          </TouchableOpacity>

          {gyms.length > 0 && (
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={onManageGyms}
            >
              <Text style={styles.actionIcon}>✏️</Text>
              <Text style={styles.quickActionText}>Manage Gyms</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Help Text */}
        {gyms.length > 0 && (
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>💡 Quick Tips</Text>
            <Text style={styles.helpText}>
              • Tap a gym to switch to it{'\n'}
              • Active gym shows QR code immediately{'\n'}
              • Use manage to edit or delete gyms{'\n'}
              • Add unlimited gym locations
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.bottomButton, styles.primaryButton]}
          onPress={onAddGym}
        >
          <Text style={styles.bottomButtonTextPrimary}>➕ Add Gym</Text>
        </TouchableOpacity>

        {activeGymId && (
          <TouchableOpacity 
            style={[styles.bottomButton, styles.secondaryButton]}
            onPress={() => onSelectGym(activeGymId)}
          >
            <Text style={styles.bottomButtonTextSecondary}>📱 Show QR</Text>
          </TouchableOpacity>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#999',
    fontSize: 16,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  gymsList: {
    paddingVertical: 20,
  },
  gymCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#333',
  },
  activeGymCard: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  gymCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activeGymText: {
    color: '#4CAF50',
  },
  gymDetails: {
    color: '#999',
    fontSize: 14,
    marginBottom: 2,
  },
  gymCardActions: {
    alignItems: 'flex-end',
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  activeBadgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  arrow: {
    color: '#666',
    fontSize: 24,
  },
  activeArrow: {
    color: '#4CAF50',
  },
  gymPreview: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
  },
  qrPreviewLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 5,
  },
  qrPreview: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Courier',
    backgroundColor: '#0a0a0a',
    padding: 8,
    borderRadius: 5,
  },
  quickActions: {
    paddingVertical: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  helpSection: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  helpTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  helpText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 10,
  },
  bottomButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  bottomButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomButtonTextSecondary: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GymSelector;