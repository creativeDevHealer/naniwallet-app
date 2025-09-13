const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    // Increase timeout for better LDPlayer compatibility
    enhanceMiddleware: (middleware, metroServer) => {
      return middleware;
    },
    // Configure server settings for better emulator support
    host: '0.0.0.0', // Allow connections from any IP
  },
  resolver: {
    // Add resolver configurations if needed
  },
  transformer: {
    // Add transformer configurations if needed
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
