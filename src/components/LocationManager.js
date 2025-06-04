import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Switch,
  Linking,
} from 'react-native';
import LocationService from '../services/LocationService';

const LocationManager = ({ 
  gym, 
  onSave, 
  onBack,
  isEditing = false 
}) => {
  const [locationData, setLocationData] = useState({
    enabled: gym?.locationEnabled || false,
    coordinates: gym?.coordinates || null,
    address: gym?.address || '',
    proximityDistance: gym?.proximityDistance || 100,
    autoTrigger: gym?.autoTrigger || true,
  });
  
  const [manualCoords, setManualCoords] = useState({
    latitude: gym?.coordinates?.latitude?.toString() || '',
    longitude: gym?.coordinates?.longitude?.toString() || '',
  });
  
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationMethod, setLocationMethod] = useState('current'); // 'current', 'manual', 'maps'

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
      setLocationData(prev => ({
        ...prev,
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude,
        }
      }));
      
      setManualCoords({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      });
      
      Alert.alert('✅ Location Set', 'Current location has been saved as your gym location.');
    } catch (error) {
      Alert.alert('Error', 'Could not get current location. Please try manual coordinates.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const setManualCoordinates = () => {
    const lat = parseFloat(manualCoords.latitude);
    const lng = parseFloat(manualCoords.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude values.');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Invalid Range', 'Latitude must be between -90 and 90, longitude between -180 and 180.');
      return;
    }
    
    setLocationData(prev => ({
      ...prev,
      coordinates: { latitude: lat, longitude: lng }
    }));
    
    Alert.alert('✅ Coordinates Set', 'Manual coordinates have been saved.');
  };

  const openInGoogleMaps = () => {
    Alert.alert(
      '🗺️ Set Location with Google Maps',
      'Choose how you want to find your gym location:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '🔍 Search Gym Name', 
          onPress: () => searchInMaps()
        },
        { 
          text: '📍 Browse Maps', 
          onPress: () => browseInMaps()
        },
      ]
    );
  };

  const searchInMaps = () => {
    const gymName = gym?.name || 'gym';
    const searchQuery = encodeURIComponent(`${gymName} gym`);
    const mapsUrl = `https://maps.google.com/maps?q=${searchQuery}`;
    
    Alert.alert(
      '📱 Opening Google Maps',
      `Searching for "${gymName}" gyms. After finding your gym:\n\n1. Tap and hold on the exact location\n2. Copy the coordinates from the popup\n3. Come back and enter them manually`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Maps', 
          onPress: () => Linking.openURL(mapsUrl)
        }
      ]
    );
  };

  const browseInMaps = () => {
    const mapsUrl = 'https://maps.google.com/';
    
    Alert.alert(
      '🗺️ Find Your Gym Location',
      'I\'ll open Google Maps. To get coordinates:\n\n1. Navigate to your gym\n2. Tap and hold on the exact entrance\n3. Copy the coordinates (latitude, longitude)\n4. Return here and enter them manually',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Maps', 
          onPress: () => Linking.openURL(mapsUrl)
        }
      ]
    );
  };

  const testProximity = () => {
    if (!locationData.coordinates) {
      Alert.alert('No Location Set', 'Please set a gym location first.');
      return;
    }
    
    Alert.alert(
      '🧪 Testing Proximity',
      'This will check if you\'re currently within range of your gym location.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Test Now', onPress: performProximityTest }
      ]
    );
  };

  const performProximityTest = async () => {
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      const distance = LocationService.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        locationData.coordinates.latitude,
        locationData.coordinates.longitude
      );
      
      const isWithinRange = distance <= locationData.proximityDistance;
      const distanceText = distance < 1000 
        ? `${Math.round(distance)}m` 
        : `${(distance / 1000).toFixed(1)}km`;
      
      Alert.alert(
        isWithinRange ? '✅ Within Range!' : '📍 Outside Range',
        `Distance to gym: ${distanceText}\nProximity setting: ${locationData.proximityDistance}m\n\n${isWithinRange ? 'QR would auto-display here!' : 'You need to be closer for auto-trigger.'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Test Failed', 'Could not get current location for test.');
    }
  };

  const handleSave = () => {
    const updatedGym = {
      ...gym,
      locationEnabled: locationData.enabled,
      coordinates: locationData.coordinates,
      address: locationData.address,
      proximityDistance: locationData.proximityDistance,
      autoTrigger: locationData.autoTrigger,
    };
    
    onSave(updatedGym);
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
          onPress: () => {
            setLocationData(prev => ({
              ...prev,
              coordinates: null,
              address: '',
            }));
            setManualCoords({ latitude: '', longitude: '' });
          }
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
        <Text style={styles.title}>📍 Location Settings</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Gym Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏋️ {gym?.name || 'Gym Location'}</Text>
          
          {/* Enable Location Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Enable Location Features</Text>
              <Text style={styles.toggleDescription}>
                Auto-display QR when near gym
              </Text>
            </View>
            <Switch
              value={locationData.enabled}
              onValueChange={(value) => setLocationData(prev => ({ ...prev, enabled: value }))}
              trackColor={{ false: '#333', true: '#007AFF' }}
              thumbColor={locationData.enabled ? '#fff' : '#666'}
            />
          </View>
        </View>

        {locationData.enabled && (
          <>
            {/* Location Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Current Location</Text>
              
              {locationData.coordinates ? (
                <View style={styles.locationCard}>
                  <View style={styles.locationStatus}>
                    <Text style={styles.statusIcon}>✅</Text>
                    <Text style={styles.statusText}>Location Set</Text>
                  </View>
                  <Text style={styles.coordinates}>
                    📌 {locationData.coordinates.latitude.toFixed(6)}, {locationData.coordinates.longitude.toFixed(6)}
                  </Text>
                  {locationData.address && (
                    <Text style={styles.address}>🏠 {locationData.address}</Text>
                  )}
                  
                  <View style={styles.locationActions}>
                    <TouchableOpacity style={styles.testButton} onPress={testProximity}>
                      <Text style={styles.testButtonText}>🧪 Test Proximity</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.clearButton} onPress={clearLocation}>
                      <Text style={styles.clearButtonText}>🗑️ Clear</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.noLocationCard}>
                  <Text style={styles.noLocationIcon}>📍</Text>
                  <Text style={styles.noLocationTitle}>No Location Set</Text>
                  <Text style={styles.noLocationDescription}>
                    Choose a method below to set your gym location
                  </Text>
                </View>
              )}
            </View>

            {/* Location Setting Methods */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔧 Set Location</Text>
              
              {/* Current Location */}
              <TouchableOpacity 
                style={styles.methodCard} 
                onPress={getCurrentLocation}
                disabled={isGettingLocation}
              >
                <View style={styles.methodIconContainer}>
                  <Text style={styles.methodIcon}>📱</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>Use Current Location</Text>
                  <Text style={styles.methodDescription}>
                    {isGettingLocation ? 'Getting location...' : 'Set gym location to where you are now'}
                  </Text>
                </View>
                <Text style={styles.methodArrow}>→</Text>
              </TouchableOpacity>

              {/* Google Maps */}
              <TouchableOpacity style={styles.methodCard} onPress={openInGoogleMaps}>
                <View style={styles.methodIconContainer}>
                  <Text style={styles.methodIcon}>🗺️</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>Find with Google Maps</Text>
                  <Text style={styles.methodDescription}>
                    Search and browse maps to find your gym
                  </Text>
                </View>
                <Text style={styles.methodArrow}>→</Text>
              </TouchableOpacity>

              {/* Manual Coordinates */}
              <View style={styles.methodCard}>
                <View style={styles.methodIconContainer}>
                  <Text style={styles.methodIcon}>📐</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>Manual Coordinates</Text>
                  <Text style={styles.methodDescription}>
                    Enter latitude and longitude directly
                  </Text>
                  
                  <View style={styles.coordInputs}>
                    <View style={styles.coordGroup}>
                      <Text style={styles.coordLabel}>Latitude:</Text>
                      <TextInput
                        style={styles.coordInput}
                        value={manualCoords.latitude}
                        onChangeText={(text) => setManualCoords(prev => ({ ...prev, latitude: text }))}
                        placeholder="40.7128"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <View style={styles.coordGroup}>
                      <Text style={styles.coordLabel}>Longitude:</Text>
                      <TextInput
                        style={styles.coordInput}
                        value={manualCoords.longitude}
                        onChangeText={(text) => setManualCoords(prev => ({ ...prev, longitude: text }))}
                        placeholder="-74.0060"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.setCoordButton} onPress={setManualCoordinates}>
                    <Text style={styles.setCoordButtonText}>Set Coordinates</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Proximity Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚙️ Proximity Settings</Text>
              
              <View style={styles.proximityCard}>
                <Text style={styles.proximityLabel}>
                  Detection Distance: {locationData.proximityDistance}m
                </Text>
                <Text style={styles.proximityDescription}>
                  How close you need to be for auto-trigger
                </Text>
                
                <View style={styles.distanceOptions}>
                  {[25, 50, 100, 200, 500].map(distance => (
                    <TouchableOpacity
                      key={distance}
                      style={[
                        styles.distanceOption,
                        locationData.proximityDistance === distance && styles.distanceOptionActive
                      ]}
                      onPress={() => setLocationData(prev => ({ ...prev, proximityDistance: distance }))}
                    >
                      <Text style={[
                        styles.distanceOptionText,
                        locationData.proximityDistance === distance && styles.distanceOptionTextActive
                      ]}>
                        {distance}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Auto Trigger Toggle */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Auto-trigger QR Display</Text>
                  <Text style={styles.toggleDescription}>
                    Automatically show QR when near gym
                  </Text>
                </View>
                <Switch
                  value={locationData.autoTrigger}
                  onValueChange={(value) => setLocationData(prev => ({ ...prev, autoTrigger: value }))}
                  trackColor={{ false: '#333', true: '#007AFF' }}
                  thumbColor={locationData.autoTrigger ? '#fff' : '#666'}
                />
              </View>
            </View>

            {/* Help Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Tips</Text>
              <View style={styles.helpCard}>
                <Text style={styles.helpText}>
                  <Text style={styles.bold}>Getting Coordinates from Google Maps:</Text>{'\n'}
                  1. Open Google Maps in browser/app{'\n'}
                  2. Search for your gym or navigate to it{'\n'}
                  3. Tap and hold on the exact entrance{'\n'}
                  4. Copy the coordinates that appear{'\n'}
                  5. Paste them in the manual fields above{'\n\n'}
                  <Text style={styles.bold}>Best Practices:</Text>{'\n'}
                  • Set location at the gym entrance for accuracy{'\n'}
                  • Test proximity before leaving the gym{'\n'}
                  • 100m works well for most gyms{'\n'}
                  • Larger gyms may need 200m+ distance
                </Text>
              </View>
            </View>
          </>
        )}
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
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDescription: {
    color: '#999',
    fontSize: 14,
    lineHeight: 18,
  },
  locationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  coordinates: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  address: {
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  noLocationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  noLocationIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noLocationTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noLocationDescription: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  methodCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodIcon: {
    fontSize: 20,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodDescription: {
    color: '#999',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
  },
  methodArrow: {
    color: '#666',
    fontSize: 20,
    marginLeft: 12,
  },
  coordInputs: {
    marginTop: 12,
  },
  coordGroup: {
    marginBottom: 12,
  },
  coordLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  coordInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#555',
  },
  setCoordButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  setCoordButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  proximityCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  proximityLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  proximityDescription: {
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
  },
  distanceOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceOption: {
    flex: 1,
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  distanceOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  distanceOptionText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600',
  },
  distanceOptionTextActive: {
    color: '#fff',
  },
  helpCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  helpText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  bold: {
    color: '#fff',
    fontWeight: '600',
  },
});