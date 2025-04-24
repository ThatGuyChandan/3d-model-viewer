module.exports = function override(config, env) {
  // Disable source map loading for @mediapipe/tasks-vision
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules\/@mediapipe/,
    use: {
      loader: 'source-map-loader',
      options: {
        filterSourceMappingUrl: (url, resourcePath) => {
          if (/@mediapipe/.test(resourcePath)) {
            return false;
          }
          return true;
        }
      }
    }
  });
  return config;
}; 