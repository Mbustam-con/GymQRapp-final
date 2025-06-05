const preset = require('react-native/jest-preset');

module.exports = {
  ...preset,
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-push-notification|@react-native-community/push-notification-ios|react-native-qrcode-svg|react-native-image-picker|@react-native-community/geolocation|@react-native-async-storage/async-storage)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
