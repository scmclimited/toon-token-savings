module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Suppress source map warnings from plotly.js
      // Find source-map-loader rules and exclude plotly.js
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach((use) => {
            if (use.loader && use.loader.includes('source-map-loader')) {
              // Exclude plotly.js from source map loading
              if (!rule.exclude) {
                rule.exclude = [];
              }
              if (Array.isArray(rule.exclude)) {
                if (!rule.exclude.some(expr => expr.toString().includes('plotly'))) {
                  rule.exclude.push(/node_modules[\\/]plotly\.js/);
                }
              } else {
                rule.exclude = [rule.exclude, /node_modules[\\/]plotly\.js/];
              }
            }
          });
        }
      });

      // Also add ignoreWarnings to suppress the warning at the webpack level
      if (!webpackConfig.ignoreWarnings) {
        webpackConfig.ignoreWarnings = [];
      }
      webpackConfig.ignoreWarnings.push({
        module: /node_modules[\\/]plotly\.js/,
        message: /Failed to parse source map/,
      });

      return webpackConfig;
    },
  },
  devServer: (devServerConfig) => {
    // Remove deprecated options and use the new setupMiddlewares API
    if (devServerConfig.onAfterSetupMiddleware !== undefined) {
      delete devServerConfig.onAfterSetupMiddleware;
    }
    if (devServerConfig.onBeforeSetupMiddleware !== undefined) {
      delete devServerConfig.onBeforeSetupMiddleware;
    }
    
    // Use the new setupMiddlewares API if not already set
    if (!devServerConfig.setupMiddlewares) {
      devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        // Apply any custom middleware setup here if needed
        // For now, just return the middlewares as-is
        return middlewares;
      };
    }
    
    return devServerConfig;
  },
};

