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
          var self = this;
          var updateRequest = angular.copy(config.request.$update);

          if (!this[config.id_reference]) {
            config.request.$save.data = this;

            if (conf) {
              angular.extend(config.request.$save, conf);
            }

            $http( config.request.$save )
              .then(function(result) {
                // self.id = result.data;
                angular.extend(self, result.data || {});

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
            updateRequest.data = this;
            updateRequest.url += '/' + this.id;

            if (conf) {
              angular.extend(updateRequest, conf);
            }

            $http( updateRequest )
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
        var getRequest = {}, regex;

        if (!params.id) {
          defer.reject('Expecting id for the operation');
        }

        if (checkType(params.id) === 'array'){
          angular.forEach(params.id, function (id) {
            getRequest = angular.copy(config.request.get);
            getRequest.url += '/' + id;

            if (conf) {
              anguar.extend(getRequest, conf);
            }

            promises.push( $http(getRequest) );
          });
        } else {

          getRequest = angular.copy(config.request.get);
          getRequest.url += '/' + id;


          if (conf) {
            anguar.extend(getRequest, conf);
          }

          promises.push( $http( getRequest ) );
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
        var request = angular.copy(config.request.delete);

        if (params && !params.id) {
          defer.reject({error: 'Expecting id for the operation'});
        }

        request.url += '/' + params.id;

        if (conf) {
          angular.extend(request, conf);
        }

        $http( request )
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
