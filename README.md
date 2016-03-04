# Datalayer
Datalayer is a simple AngularJS service abstraction to consume data from a RESTful Api.
The code base is very simple to change and adapt to your backend in case it doesnt support RESTful.

## Install
You can download it by:
* Using npm and running `npm install datalayer`
* Download manually and include the `<script type="text/javascript" src="./path/to/your/datalayer.min.js">`

## Usage
`datalayer({ url: '<string>', model: '<string>', version: '<sctring>', id_reference: '<string>' })`

### Arguments
* **url:** Base url point to API
  * `Default`: ./
  * `Required`: false
* **model:** Represents the resource of the api
  * `Default`: null
  * `Required`: true
* **version:** The version of the API
  * `Default`: v1
  * `Required`: false
* **id_reference:** Which field represents the unique identifier
  * `Default`: id
  * `Required`: false

### Returns `<class>` Resource
Returns the class `Resource` with the default actions attached

#### Resource.find
**Params:** <object> ex: `{ age: { $gt: 15 } }`  
**Returns:** <array> Resource

#### Resource.get
**Params:** <object> ex: `{ id: <number> }`  
**Returns:** <object> ex: `{ name: 'John', age: '28' }`

#### Resource.all
**Params:** none  
**Returns:** <array> Resource

#### Resource.delete
**Params:** <object> ex: `{ id: <number> }`  
**Returns:** null

## Starter guide
```javascript
angular.module('app', ['datalayerModule'])
.controller('Controller', function (datalayer) {
  var User = datalayer({ model: 'users' });
});
```

## Code examples
```javascript
var User = datalayer({ model: 'users' });

var john = new User();
var carlos = User.get({ id: 10 });

john.name = 'John';
john.surname = 'Howard';
john.age = '28';

carlos.age = 29;

john.$save();   // insert
carlos.$save(); // update

User.find()
  .then(function (users) {
    for (var i = 0, len = users.length; i < len; i++) {
      if (users[i].age > 70) {
        users[i].status = 'inactive';
      }

      users[i].$save();   // update
    }
  })
  .catch(function (error) {
    console.log(error);
  });

User.delete({ id: 20 });  // delete
```

## Using events
@ TODO

## Modify
If your backend don't support RESTful you can easily alter the ajax call to
better fit your use case.

```javascript
function datalayer($rootScope, $http, $q) {

  Resource.find = function(filter) {
    var defer = $q.defer();

    /**
     * Add your $http call here
     * return a promise
     */

    return defer.promise;
  };

  Resource.get = function () {
    var defer = $q.defer();

    /**
     * Add your $http call here
     * return a promise
     */

    return defer.promise;
  };

  ...
}
```
