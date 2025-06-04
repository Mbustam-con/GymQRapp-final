import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import LocationService from '../services/LocationService';

const LocationSetup = ({ onSave, onBack }) => {
  const [gymName, setGymName] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleSave = async () => {
    // Validate inputs
    if (!gymName.trim()) {
      Alert.alert('Missing Information', 'Please enter your gym name.');
      return;
    }
    
    if (!qrCode.trim()) {
      Alert.alert('Missing Information', 'Please enter your gym QR code data or upload an image.');
      return;
    }

    setIsLoading(true);
    
    try {
      const gymData = {
        name: gymName.trim(),
        qrCode: qrCode.trim(),
        createdAt: Date.now(),
        image: selectedImage,
        // Initialize location settings
        locationEnabled: coordinates ? true : false,
        coordinates: coordinates,
        address: '',
        proximityDistance: 100,
        autoTrigger: true,
      };

      console.log('Saving gym data:', gymData);
      
      // Call the save function
      await onSave(gymData);
      
    } catch (error) {
      console.error('Error saving gym:', error);
      Alert.alert('Error', 'Failed to save gym information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const hasPermission = await LocationService.requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location permission is needed to set your gym location.');
        setIsGettingLocation(false);
        return;
      }

      const location = await LocationService.getCurrentLocation();
      setCoordinates({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      Alert.alert('Location Set', 'Current location has been saved as your gym location.');
    } catch (error) {
      Alert.alert('Error', 'Could not get current location. Please try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const clearLocation = () => {
    Alert.alert(
      'Clear Location?',
      'This will remove the location data for this gym.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => setCoordinates(null)
        }
      ]
    );
  };

  const fillSampleData = () => {
    Alert.alert(
      'Use Sample Data?',
      'This will fill in sample data for testing purposes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Fill Sample', 
          onPress: () => {
            setGymName('My Local Gym');
            setQrCode('SAMPLE-GYM-QR-CODE-123456789-MEMBERSHIP');
            setSelectedImage(null);
          }
        }
      ]
    );
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select QR Code Image',
      'Choose how you want to add your gym QR code:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '📷 Take Photo', onPress: openCamera },
        { text: '🖼️ Choose from Gallery', onPress: openGallery },
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }
      
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedImage(asset);
        extractQRFromImage(asset);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }
      
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedImage(asset);
        extractQRFromImage(asset);
      }
    });
  };

  const extractQRFromImage = (imageAsset) => {
    // For now, we'll simulate QR extraction
    // In a real app, you'd use a QR code reading library here
    Alert.alert(
      'QR Code Detection',
      'QR code extraction from images requires additional setup. For now, please enter the QR code data manually.',
      [
        { text: 'OK', onPress: () => {
          // Simulate extracted data for demo
          setQrCode(`EXTRACTED-FROM-IMAGE-${Date.now()}`);
        }}
      ]
    );
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Add New Gym</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🏋️</Text>
            <Text style={styles.subtitle}>
              Set up your gym QR code for quick access
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gym Name *</Text>
              <TextInput
                style={styles.input}
                value={gymName}
                onChangeText={setGymName}
                placeholder="Enter your gym name (e.g., Gold's Gym)"
                placeholderTextColor="#666"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Gym Location Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gym Location (Recommended)</Text>
              <TouchableOpacity
                style={[styles.locationButton, coordinates && styles.locationButtonActive]}
                onPress={getCurrentLocation}
                disabled={isGettingLocation}
              >
                <Text style={styles.locationIcon}>
                  {coordinates ? "📍" : "🌍"}
                </Text>
                <View style={styles.locationButtonContent}>
                  <Text style={[styles.locationButtonText, coordinates && styles.locationButtonTextActive]}>
                    {isGettingLocation 
                      ? 'Getting Current Location...' 
                      : coordinates 
                        ? 'Location Set ✓' 
                        : 'Set Current Location'
                    }
                  </Text>
                  {coordinates && (
                    <Text style={styles.locationCoords}>
                      {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                    </Text>
                  )}
                </View>
                {coordinates && (
                  <TouchableOpacity onPress={clearLocation} style={styles.clearLocationButton}>
                    <Text style={styles.clearLocationText}>✕</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              <Text style={styles.helpText}>
                📍 This enables automatic QR display when you're near your gym. You can set this up later in settings if not at gym now.
              </Text>
            </View>

            {/* Image Upload Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>QR Code Image (Optional)</Text>
              
              {selectedImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imageUploadButton} onPress={showImagePicker}>
                  <Text style={styles.imageUploadIcon}>📷</Text>
                  <Text style={styles.imageUploadText}>Upload QR Code Image</Text>
                  <Text style={styles.imageUploadSubtext}>Take photo or choose from gallery</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>QR Code Data *</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={qrCode}
                onChangeText={setQrCode}
                placeholder="Paste your gym QR code data here&#10;or use the camera button above to scan"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                returnKeyType="done"
              />
              <Text style={styles.helpText}>
                💡 This is usually your membership number, barcode data, or the text content of your gym's QR code
              </Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.sampleButton} onPress={fillSampleData}>
                <Text style={styles.sampleButtonText}>📝 Use Sample Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.scanButton} onPress={showImagePicker}>
                <Text style={styles.scanButtonText}>📱 Scan QR Code</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? '💾 Saving...' : '✅ Save Gym'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>ℹ️ How to get your QR code data:</Text>
            <View style={styles.helpBox}>
              <Text style={styles.helpContent}>
                <Text style={styles.bold}>Method 1:</Text> Use the camera button above to take a photo of your gym's QR code{'\n\n'}
                <Text style={styles.bold}>Method 2:</Text> Copy the membership number from your gym app or membership card{'\n\n'}
                <Text style={styles.bold}>Method 3:</Text> Ask gym staff for your membership number or QR code content{'\n\n'}
                <Text style={styles.bold}>Method 4:</Text> Use sample data for testing, then update later in settings{'\n\n'}
                <Text style={styles.bold}>📍 Location Tip:</Text> You can set the location later through Settings → Location if you're not at the gym right now.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 50,
    marginBottom: 15,
  },
  subtitle: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  multilineInput: {
    height: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  // Location Button Styles
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  locationButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  locationButtonContent: {
    flex: 1,
  },
  locationButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationButtonTextActive: {
    color: '#4CAF50',
  },
  locationCoords: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  clearLocationButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearLocationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#ff3b30',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageUploadButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  imageUploadIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  imageUploadText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  imageUploadSubtext: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
  },
  helpText: {
    color: '#666',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  sampleButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  sampleButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  scanButton: {
    flex: 1,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#333',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  helpSection: {
    marginTop: 20,
  },
  helpTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  helpBox: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
  },
  helpContent: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#fff',
  },
});

export default LocationSetup;