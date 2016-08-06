# Datalayer
Datalayer is a simple AngularJS service abstraction to consume data from a RESTful Api.
The code base is very simple to change and adapt to your backend in case it is not RESTful.

## Install
You can download it by:
* Using npm and running `npm install angular-datalayer --save`
* Download manually and include the `<script type="text/javascript" src="./path/to/your/datalayer.min.js">`

## Starter guide
```javascript
angular
  .module('app', ['angular-datalayer'])
  .controller('Controller', function (datalayer) {
    var User = datalayer({ model: 'users' });
  });
```
or

```javascript
var dataLayer = require('angular-datalayer');

angular
  .module('app', [
    dataLayer
  ])
  .controller('Controller', function (datalayer) {

  });

```

## Usage
`datalayer({ url: '<string>', model: '<string>', version: '<sctring>', id_reference: '<string>' })`

### Configuration Json
You can in any point modify ajax calls by specifying the request attribute the desire configurations following the angularjs $http [configuration json](https://docs.angularjs.org/api/ng/service/$http#usage). Please check the documention before adding any change.

```javascript
{
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
    }
  }
};
```

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

#### Resource.query(query, isArray = true, [config])
**Params:** `<object>` query ex: `{ age: { $gt: 15 } }`  
**Params:** `<boolean>` isArray [optional] default: true  
**Params:** `<object>` config [optional]  
**Returns:** `<array>` Resource

#### Resource.get(option, [config])
**Params:** `<object>` option ex: `{ id: <number> }`  
**Params:** `<object>` config [optional]  
**Returns:** `<object>`|`<Array>` Resource

#### Resource.all([config])
**Params:** `<object>` config [optional]  
**Returns:** `<array>` Resource

#### Resource.delete(option, [config])
**Params:** `<object>` option ex: `{ id: <number> }`  
**Params:** `<object>` config [optional]  
**Returns:** `null`


## Code examples
```javascript
var User = datalayer({ model: 'users' });

var john = new User();
var carlos = User.get({ id: 10 });

john.name = 'John';
john.surname = 'Howard';
john.age = '28';

carlos.age = 29;

john.$save()
.then(function (data) {
  console.log(data);
});
/**
 * Will print
 * {
 * 	id: 1,
 * 	name: 'John',
 * 	surname: 'Howard',
 * 	age: 28
 * }
 */

carlos
  .$save()
  .then(function (data) {
    ...
  });

User.get({ id: [10, 11, 12] })
.then(function (users){
 for (var i = 0, len = users.length; i < len; i++) {
  if (users[i].gender === 'male') {
   users[i].status = 'inactive';
  }

  users[i].$save();   // update
 }
});

User.query({ gender: { $eq: 'male' } })
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

### Using events
Datalayer by default dispatch two main events, **dl-save** and **dl-[model].save**, when a save or update operation occours. We can listen to a particular model events, lets say `dl-task.save` or when a save operations happened `dl-save`.  

```javascript
angular.moduel('app')
.controller('Controller1', function (scope, datalayer){
 var Task = datalayer({ model: 'task' });
 var subscriptionId = Task.$on('dl-task.save', onSave);

 function onSave(task) {
  alert('Task ' + task.name + ' created')!
 }

 scope.$on('$destroy', function() {
    Task.$off(subscriptionId);
 });
});

angular.moduel('app')
.controller('Controller2', function (scope, datalayer){
 var ref = datalayer({ model: 'task' });
 var subscriptionId = ref.$on('dl-save', onSave);

 function onSave(data) {
  alert('Something has been saved', data);
 }

 scope.$on('$destroy', function() {
    ref.$off(subscriptionId);
 });
});
```

### Handling Pagination
lets say the api return a json not a array:

**option 1**  
Preserving the total

```javascript
{
 total: 150,
 items: [{...}, {...}]
}
```

```javascript
var User = datalayer({ model: 'users' });

User.query({ gender: { $eq: 'male' }, page: 1, limit: 10 }, false)
.then(function (users){
 for (var i = 0, len = users.items.length; i < len; i++) {
  users.items[i] = new User(users.items[i])
 }
});
```

**option 2**
Using $http transformResponse option  
```javascript
var User = datalayer({ model: 'users' });

User.query({ gender: { $eq: 'male' }, page: 1, limit: 10 }, false, {
 transformResponse: function (data){
  if (data && data.items) {
   return data.items;
  }
 }
})
.then(function (users){

});
```
