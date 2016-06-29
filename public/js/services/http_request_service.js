theApp.service('httpRequestInterceptor', function (store) {
  return {
    request: function (config) {

      config.headers['Authorization'] = store.get('token');

      return config;
    }
  };
});