import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  GYMS: '@gyms_list',
  SETTINGS: '@app_settings',
  ACTIVE_GYM: '@active_gym_id',
};

class StorageService {
  static async saveGyms(gyms) {
    try {
      await AsyncStorage.setItem(KEYS.GYMS, JSON.stringify(gyms));
    } catch (error) {
      console.error('Error saving gyms:', error);
    }
  }

  static async getGyms() {
    try {
      const data = await AsyncStorage.getItem(KEYS.GYMS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting gyms:', error);
      return [];
    }
  }

  static async addGym(gymData) {
    try {
      const gyms = await this.getGyms();
      const newGym = {
        ...gymData,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      const updatedGyms = [...gyms, newGym];
      await this.saveGyms(updatedGyms);
      return newGym;
    } catch (error) {
      console.error('Error adding gym:', error);
      throw error;
    }
  }

  static async deleteGym(gymId) {
    try {
      const gyms = await this.getGyms();
      const updatedGyms = gyms.filter(gym => gym.id !== gymId);
      await this.saveGyms(updatedGyms);
      return updatedGyms;
    } catch (error) {
      console.error('Error deleting gym:', error);
      throw error;
    }
  }

  static async updateGym(gymId, updates) {
    try {
      const gyms = await this.getGyms();
      const updatedGyms = gyms.map(gym => 
        gym.id === gymId ? { ...gym, ...updates } : gym
      );
      await this.saveGyms(updatedGyms);
      return updatedGyms.find(g => g.id === gymId);
    } catch (error) {
      console.error('Error updating gym:', error);
      throw error;
    }
  }

  static async setActiveGym(gymId) {
    try {
      await AsyncStorage.setItem(KEYS.ACTIVE_GYM, gymId);
    } catch (error) {
      console.error('Error setting active gym:', error);
    }
  }

  static async getActiveGym() {
    try {
      return await AsyncStorage.getItem(KEYS.ACTIVE_GYM);
    } catch (error) {
      console.error('Error getting active gym:', error);
      return null;
    }
  }

  static async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  static async getSettings() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }
}

export default StorageService;