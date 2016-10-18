(function() {

  angular
    .module('angular-datalayer', [])
    .factory('datalayer', datalayer);

  datalayer.$inject = ['$rootScope', '$http', '$q'];
  // @TODO [ ] Add on readme a paragraph explaining that the library is expecting a json from the api or ajax calls
  function datalayer($rootScope, $http, $q) {
    // pub sub implementation
    var topics = {},
      subUid = -1;

    function ResourceFactory(configuration) {
      var config = {
        url: '.',
        model: '',
        version: 'v1',
        id_reference: 'id',
        request: {
          query: {
            method: 'GET'
          },
          get: {
            method: 'GET'
          },
          all: {
            method: 'GET'
          },
          $save: {
            method: 'POST'
          },
          $update: {
            method: 'PUT'
          },
          delete: {
            method: 'DELETE'
          },
          update: {
            method: 'PATCH'
          }
        }
      };

      angular.extend(config, configuration || {});

      // set defaults
      config.request.query.url = config.url + '/' + config.version + '/' + config.model;
      config.request.get.url = config.url + '/' + config.version + '/' + config.model;
      config.request.all.url = config.url + '/' + config.version + '/' + config.model;
      config.request.$save.url = config.url + '/' + config.version + '/' + config.model;
      config.request.$update.url = config.url + '/' + config.version + '/' + config.model;
      config.request.delete.url = config.url + '/' + config.version + '/' + config.model;
      config.request.update.url = config.url + '/' + config.version + '/' + config.model;

      function checkType(obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
      }

      function Resource(data) {
        angular.extend(this || {}, data);
      }

      Resource.prototype = {
        $save: function(conf) {
          var defer = $q.defer();
          var self = this, regex, url;

          if (!this[config.id_reference]) {
            config.request.$save.data = this;

            if (conf) {
              angular.extend(config.request.$save, conf);
            }

            $http( config.request.$save )
              .then(function(result) {
                self.id = result.data;

                Resource.$trigger('dl-save', self);
                Resource.$trigger('dl-' + config.model + '.save', self);

                defer.resolve(self);
              }, function(error) {
                Resource.$trigger('dl-save', error);
                Resource.$trigger('dl-' + config.model + '.save', error);

                defer.reject(error);
              });

          }
          else {
            regex = new RegExp('\/[0-9]+$');

            config.request.$update.data = this;

            if ( !regex.test(config.request.$update.url) ) {
                config.request.$update.url += '/' + this.id;
            } else {

              url = config.request.$update.url.split('/');

              if (url[url.length-1] !== this.id ) {
                url[url.length-1] = this.id;

                config.request.$update.url = url.join('/');
              }

            }


            if (conf) {
              angular.extend(config.request.$update, conf);
            }

            $http( config.request.$update )
              .then(function(data) {
                Resource.$trigger('dl-save', self);
                Resource.$trigger('dl-' + config.model + '.save', self);

                defer.resolve(self);
              }, function(error) {
                Resource.$trigger('dl-save', error);
                Resource.$trigger('dl-' + config.model + '.save', error);

                defer.reject(error);
              });
          }

          return defer.promise;
        }
      };

      Resource.query = function(filter, isArray, conf) {

        var defer = $q.defer();
        var data = [];

        isArray = typeof isArray !== 'undefined' ? isArray : true;

        config.request.query.params = filter;

        if (conf) {
          angular.extend(config.request.query, conf);
        }

        $http( config.request.query )
          .then(function(result) {
            if (isArray) {
              angular.forEach(result.data, function(object) {
                data.push(new Resource(object));
              });
            }
            else {
              data = result.data;
            }

            defer.resolve(data);
          }, function(error) {
            defer.reject(error);
          });

        return defer.promise;
      };

      Resource.get = function(params, conf) {
        var defer = $q.defer();
        var promises = [];
        var data = [];
        var _config = {}, regex;

        if (!params.id) {
          defer.reject('Expecting id for the operation');
        }

        if (checkType(params.id) === 'array'){
          angular.forEach(params.id, function (id) {
            _config = angular.copy(config.request.get);
            _config.url += '/' + id;

            if (conf) {
              anguar.extend(_config, conf);
            }

            promises.push( $http(_config) );
          });
        }
        else {

          regex = new RegExp('\/[0-9]+$');

          if ( !regex.test(config.request.get.url) ) {
              config.request.get.url += '/' + params.id;
          } else {

            url = config.request.get.url.split('/');

            if (url[url.length-1] !== params.id ) {
              url[url.length-1] = params.id;

              config.request.get.url = url.join('/');
            }

          }


          if (conf) {
            anguar.extend(config.request.get, conf);
          }

          promises.push( $http( config.request.get ) );
        }

        $q.all(promises)
          .then(function (results) {
            if (results.length === 1) {
              data = new Resource(results[0].data);
            }
            else {
              angular.forEach(results, function (result) {
                data.push(new Resource(result.data));
              });
            }

            defer.resolve(data);
          }, function (error) {
            defer.reject(error);
          });

        return defer.promise;
      };

      Resource.all = function (conf) {
        var defer = $q.defer();
        var data = [];

        if (conf) {
          angular.extend(config.request.all, conf);
        }

        $http( config.request.all )
          .then(function (result) {
            angular.forEach(result.data, function (object) {
              data.push( new Resource(object) );
            });
            defer.resolve(data);
          }, function (error) {
            defer.reject(error);
          });

        return defer.promise;
      };

      Resource.delete = function(params, conf) {
        var defer = $q.defer();

        if (params && !params.id) {
          defer.reject({error: 'Expecting id for the operation'});
        }

        // config.request.delete.url += '/' + params.id;

        regex = new RegExp('\/[0-9]+$');

        if ( !regex.test(config.request.delete.url) ) {
            config.request.delete.url += '/' + params.id;
        } else {

          url = config.request.delete.url.split('/');

          if (url[url.length-1] !== params.id ) {
            url[url.length-1] = params.id;

            config.request.delete.url = url.join('/');
          }

        }

        if (conf) {
          angular.extend(config.request.delete, conf);
        }

        // $http.delete(config.url + config.version + '/' + config.model + '/', params.id)
        $http( config.request.delete )
          .then(function(data) {
            Resource.$trigger('dl-delete', data);
            Resource.$trigger('dl-' + config.model + '.delete', data);

            defer.resolve(data);
          }, function(error) {
            Resource.$trigger('dl-delete', self);
            Resource.$trigger('dl-' + config.model + '.delete', error);

            defer.reject(error);
          });

        return defer.promise;
      };

      Resource.update = function(params, conf) {
        var defer = $q.defer();
        var url, request = angular.copy(config.request.update);

        if (params && !params.id) {
          defer.reject({error: 'Expecting id for the operation'});
        }

        var data = angular.copy(params);
        var parseUrl, operation = params.operation;

        delete data.id;
        delete data.operation;

        request.data = data;

        request.url += '/' + params.id;

        if (operation) {
          request.url += '/' + operation;
        }


        if (conf) {
          angular.extend(request, conf);
        }

        $http( request )
          .then(function(data) {
            Resource.$trigger('dl-update', data);
            Resource.$trigger('dl-' + config.model + '.update', data);

            defer.resolve(data);
          }, function(error) {
            Resource.$trigger('dl-update', self);
            Resource.$trigger('dl-' + config.model + '.update', error);

            defer.reject(error);
          });

        return defer.promise;
      };

      Resource.$on = function(topic, func) {
        if (!topics[topic]) {
          topics[topic] = [];
        }

        var token = (++subUid).toString();

        topics[topic].push({
          token: token,
          func: func
        });
        return token;
      };

      Resource.$trigger = function(topic, args) {
        if (!topics[topic]) {
          return false;
        }
        setTimeout(function() {
          var subscribers = topics[topic],
            len = subscribers ? subscribers.length : 0;

          while (len--) {
            // subscribers[len].func(topic, args);
            subscribers[len].func(args);
          }
        }, 0);
        return true;
      };

      Resource.$off = function(token) {
        for (var m in topics) {
          if (topics[m]) {
            for (var i = 0, j = topics[m].length; i < j; i++) {
              if (topics[m][i].token === token) {
                topics[m].splice(i, 1);
                return token;
              }
            }
          }
        }
        return false;
      };

      return Resource;

    }

    return ResourceFactory;
  }

})();
