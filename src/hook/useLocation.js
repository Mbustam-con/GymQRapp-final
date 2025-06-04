import { useState, useEffect } from 'react';
import LocationService from '../services/LocationService';

const useLocation = (gymCoordinates, proximityDistance = 100, enabled = true) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isNearGym, setIsNearGym] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (!enabled || !gymCoordinates) {
      return;
    }

    let locationInterval = null;

    const startTracking = async () => {
      try {
        const hasPermission = await LocationService.requestLocationPermission();
        if (!hasPermission) {
          setLocationError('Location permission denied');
          return;
        }

        // Get initial location
        try {
          const initialLocation = await LocationService.getCurrentLocation();
          setCurrentLocation(initialLocation);
          checkProximity(initialLocation);
        } catch (error) {
          console.warn('Could not get initial location:', error);
        }

        // Set up periodic location checking (every 30 seconds for battery optimization)
        locationInterval = setInterval(async () => {
          try {
            const location = await LocationService.getCurrentLocation();
            setCurrentLocation(location);
            checkProximity(location);
          } catch (error) {
            console.warn('Location update error:', error);
          }
        }, 30000); // 30 seconds

      } catch (error) {
        setLocationError(error.message);
      }
    };

    const checkProximity = (location) => {
      if (!location || !gymCoordinates) return;

      const isNear = LocationService.isNearLocation(
        location.latitude,
        location.longitude,
        gymCoordinates.latitude,
        gymCoordinates.longitude,
        proximityDistance
      );

      setIsNearGym(isNear);
    };

    startTracking();

    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [gymCoordinates, proximityDistance, enabled]);

  return {
    currentLocation,
    isNearGym,
    locationError,
  };
};

export default useLocation;