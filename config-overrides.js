module.exports = {
    devServer: (configFunction) => {
      return (proxy, allowedHost) => {
        const config = configFunction(proxy, allowedHost);
        
        // Modern middleware setup
        config.setupMiddlewares = (middlewares, devServer) => {
          if (!devServer) {
            throw new Error('webpack-dev-server is not defined');
          }
          return middlewares;
        };
  
        // Allowed hosts configuration
        config.allowedHosts = [
          'localhost',
          '127.0.0.1',
          '::1',
          '.localhost'
        ];
  
        return config;
      };
    }
  };