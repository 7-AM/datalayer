(function() {

  angular
    .module('datalayerModule', [])
    .factory('datalayer', datalayer);

  // @TODO [X] Make $http call from config json
  // @TODO [X] Set default request for each method
  // @TODO [X] Change Api method find to query
  // @TODO [X] Implement Resource.all
  // @TODO [ ] Resource.get support for array of ids
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
            url: config.url + '/' + config.version + '/' + config.model,
            method: 'GET',
            params: ''
          },
          get: {
            url: config.url + '/' + config.version + '/' + config.model,
            method: 'GET'
          },
          all: {
            url: config.url + '/' + config.version + '/' + config.model,
            method: 'GET'
          },
          $save: {
            url: config.url + '/' + config.version + '/' + config.model,
            method: 'POST'
          },
          $update: {
            url: config.url + '/' + config.version + '/' + config.model,
            method: 'PUT'
          },
          delete: {
            url: config.url + '/' + config.version + '/' + config.model,
            method: 'DELETE'
          }
        }
      };

      angular.extend(config, configuration || {});

      function Resource(data) {
        angular.extend(this || {}, data);
      }

      Resource.prototype = {
        $save: function() {
          var defer = $q.defer();
          var self = this;

          if (!this[config.id_reference]) {
            config.request.$save.data = this;

            // $http.post(config.url + config.version + '/' + config.model, this)
            $http( config.request.$save )
              .then(function(result) {
                self.id = result.data;

                Resource.$trigger('dl-save', self);
                Resource.$trigger('dl-' + config.model + '.save', self);

                defer.resolve('Saved sucessfully!');
              }, function(error) {
                Resource.$trigger('dl-save', error);
                Resource.$trigger('dl-' + config.model + '.save', error);

                defer.reject(error);
              });

          }
          else {
            config.request.$update.data = this;

            // $http.put(config.url + config.version + '/' + config.model + '/' + this.id, this)
            $http( config.request.$update )
              .then(function(data) {
                Resource.$trigger('dl-save', self);
                Resource.$trigger('dl-' + config.model + '.save', self);

                defer.resolve('updated sucessfully');
              }, function(error) {
                Resource.$trigger('dl-save', error);
                Resource.$trigger('dl-' + config.model + '.save', error);

                defer.reject(error);
              });
          }

          return defer.promise;
        }
      };

      Resource.query = function(filter, config) {
        var defer = $q.defer();
        var data = {
          objects: [],
          totalCount: 0
        };

        if (config) {
          angular.extend(config.request.query, config);
        }
        else {
          config.request.query.params = JSON.stringify(filter);
        }

        // $http.get(config.url + config.version + '/' + config.model + '/find', {
        //     params: {
        //       query: JSON.stringify(filter)
        //     }
        //   })
        $http( config.request.query )
          .then(function(result) {
            data.totalCount = result.data.totalCount;

            angular.forEach(result.data.objects, function(object) {
              data.objects.push(new Resource(object));
            });

            defer.resolve(data);
          }, function(error) {
            defer.reject(error);
          });

        return defer.promise;
      };

      Resource.get = function(params, config) {
        var defer = $q.defer();

        if (!params.id) {
          defer.reject('Expecting id for the operation');
        }

        if (config) {
          anguar.extend(config.request.get, config);
        }
        else {
          config.request.get.url += '/' + params.id;
        }

        // $http.get(config.url + config.version + '/' + config.model + '/' + params.id)
        $http( config.request.get )
          .then(function(result) {

            defer.resolve(new Resource(result.data));

          }, function(error) {
            defer.reject(error);
          });

        return defer.promise;
      };

      Resource.all = function () {
        var defer = $q.defer();
        var data = [];

        // $http.get(config.url + config.version + '/' + config.model)
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

      Resource.delete = function(params, config) {
        var defer = $q.defer();

        if (params && !params.id) {
          defer.reject('Expecting id for the operation');
        }

        if (config) {
          angular.extend(config.request.$delete, config);
        }
        else {
          config.request.$delete.url += '/' + params.id;
        }


        // $http.delete(config.url + config.version + '/' + config.model + '/', params.id)
        $http( config.request.$delete )
          .then(function(data) {
            self.publish('dl-save', self);
            self.publish('dl-' + config.model + '.delete', self);

            defer.resolve(data);
          }, function(error) {
            self.publish('dl-save', self);
            self.publish('dl-' + config.model + '.delete', self);
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
