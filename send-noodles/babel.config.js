module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated/plugin MUST be listed last — this is a hard
    // requirement from the Reanimated docs, not a style choice.
    plugins: ['react-native-reanimated/plugin'],
  };
};
