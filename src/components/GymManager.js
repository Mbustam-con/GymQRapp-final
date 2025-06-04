
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';

const GymManager = ({ 
  gyms, 
  activeGymId, 
  onUpdateGym, 
  onDeleteGym, 
  onAddGym, 
  onBack 
}) => {
  const [editingGym, setEditingGym] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', qrCode: '' });

  const handleEditGym = (gym) => {
    setEditForm({
      name: gym.name,
      qrCode: gym.qrCode,
    });
    setEditingGym(gym);
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim() || !editForm.qrCode.trim()) {
      Alert.alert('Invalid Input', 'Please fill in all fields.');
      return;
    }

    const updatedGym = {
      ...editingGym,
      name: editForm.name.trim(),
      qrCode: editForm.qrCode.trim(),
      updatedAt: Date.now(),
    };

    onUpdateGym(updatedGym);
    setEditingGym(null);
    setEditForm({ name: '', qrCode: '' });
  };

  const handleDeleteGym = (gym) => {
    const isActive = gym.id === activeGymId;
    
    Alert.alert(
      'Delete Gym',
      `Are you sure you want to delete "${gym.name}"?${isActive ? '\n\nThis is your active gym.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDeleteGym(gym.id)
        }
      ]
    );
  };

  const handleDuplicateGym = (gym) => {
    Alert.alert(
      'Duplicate Gym',
      `Create a copy of "${gym.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Duplicate', 
          onPress: () => {
            const duplicatedGym = {
              ...gym,
              id: Date.now().toString(),
              name: `${gym.name} (Copy)`,
              createdAt: Date.now(),
            };
            onUpdateGym(duplicatedGym);
          }
        }
      ]
    );
  };

  const renderGymItem = (gym) => {
    const isActive = gym.id === activeGymId;

    return (
      <View key={gym.id} style={[styles.gymItem, isActive && styles.activeGymItem]}>
        <View style={styles.gymHeader}>
          <View style={styles.gymInfo}>
            <Text style={[styles.gymName, isActive && styles.activeGymName]}>
              {gym.name}
            </Text>
            <Text style={styles.gymMeta}>
              Created: {new Date(gym.createdAt).toLocaleDateString()}
            </Text>
            {gym.updatedAt && (
              <Text style={styles.gymMeta}>
                Updated: {new Date(gym.updatedAt).toLocaleDateString()}
              </Text>
            )}
            {isActive && (
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>✓ Currently Active</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.qrCodePreview}>
          <Text style={styles.qrLabel}>QR Code Data:</Text>
          <Text style={styles.qrData} numberOfLines={2}>
            {gym.qrCode}
          </Text>
        </View>

        <View style={styles.gymActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditGym(gym)}
          >
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.duplicateButton]}
            onPress={() => handleDuplicateGym(gym)}
          >
            <Text style={styles.duplicateButtonText}>📋 Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteGym(gym)}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Gyms</Text>
        <TouchableOpacity onPress={onAddGym} style={styles.addButton}>
          <Text style={styles.addText}>➕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {gyms.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>No Gyms to Manage</Text>
            <Text style={styles.emptySubtitle}>
              Add your first gym to get started
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={onAddGym}>
              <Text style={styles.emptyButtonText}>📍 Add First Gym</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gymsList}>
            {gyms.map(renderGymItem)}
          </View>
        )}

        {/* Stats Section */}
        {gyms.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>📊 Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{gyms.length}</Text>
                <Text style={styles.statLabel}>Total Gyms</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.floor((Date.now() - Math.min(...gyms.map(g => g.createdAt))) / (1000 * 60 * 60 * 24))}
                </Text>
                <Text style={styles.statLabel}>Days Since First</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Management Tips</Text>
          <Text style={styles.tipsText}>
            • Edit gym names and QR codes anytime{'\n'}
            • Duplicate gyms for similar setups{'\n'}
            • Active gym is used for quick access{'\n'}
            • Deleted gyms cannot be recovered
          </Text>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editingGym !== null}
        animationType="slide"
        onRequestClose={() => setEditingGym(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setEditingGym(null)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Gym</Text>
            <TouchableOpacity 
              onPress={handleSaveEdit}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Gym Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                  placeholder="Enter gym name"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>QR Code Data</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={editForm.qrCode}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, qrCode: text }))}
                  placeholder="Paste your QR code data here"
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <Text style={styles.formHint}>
                  This is usually your membership number or barcode data
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  addText: {
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
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gymsList: {
    paddingVertical: 20,
  },
  gymItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  activeGymItem: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  gymHeader: {
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
  activeGymName: {
    color: '#4CAF50',
  },
  gymMeta: {
    color: '#999',
    fontSize: 12,
    marginBottom: 2,
  },
  activeIndicator: {
    marginTop: 8,
  },
  activeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  qrCodePreview: {
    backgroundColor: '#0a0a0a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  qrLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 5,
  },
  qrData: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'Courier',
    lineHeight: 18,
  },
  gymActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  duplicateButton: {
    borderColor: '#FF9500',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  duplicateButtonText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  statsSection: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#007AFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  tipsSection: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  tipsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipsText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSaveButton: {
    padding: 8,
  },
  modalSaveText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalForm: {
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 25,
  },
  formLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  formTextArea: {
    height: 120,
    paddingTop: 12,
  },
  formHint: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
});

export default GymManager;