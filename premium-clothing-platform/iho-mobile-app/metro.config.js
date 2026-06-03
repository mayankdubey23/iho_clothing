const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Yahan input path ko "./src/global.css" kar diya hai
module.exports = withNativeWind(config, { input: "./src/global.css" });