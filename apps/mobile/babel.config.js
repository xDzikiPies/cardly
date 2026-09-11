module.exports = function (api) {
  api.cache(true);
  return {
    // Reanimated 4 (Expo SDK 57): plugin worklet przeniósł się do react-native-worklets,
    // babel-preset-expo konfiguruje go automatycznie — nie trzeba już dodawać
    // 'react-native-reanimated/plugin' ręcznie (ten wpis jest przestarzały od Reanimated 4).
    presets: ["babel-preset-expo"],
  };
};
