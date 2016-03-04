# Datalayer
Datalayer is a simple AngularJS service abstraction to consume data from a
RESTful Api.
The code base is very simple to change and adapt to your backend in case it doesnt support RESTful.

## Install
You can download it by:
* Using npm and running `npm run datalayer`
* Download manually and include the `<script type="text/javascript" src="./dist/datalayer.min.js">`

## Usage
`datalayer({ url: '<string>', model: '<string>', version: '<sctring>', id_reference: '<string>' })`

### Arguments
1. **url:** Base url point to API
  * Default: `./`
  * Required: `false`

2. **model:** Represents the resource of the api
  * Default: null
  * Required: true

3. **version:** The version of the API
  * Default: `v1`
  * Required: false

4. **id_reference:** Which field represents the unique identifier
  * Default: `id`
  * Required: false

### Returns `<class>` Resource
Returns the class `Resource` with the default actions attached

#### Resource.find
**Params:** <object> ex: `{ age: { $gt: 15 } }`

**Returns:** <array> Resource

#### Resource.get
**Params:** <object> ex: `{ id: <number> }`

**Returns:** <object> ex: `{ name: 'John', age: '28' }``

#### Resource.delete
**Params:** <object> ex: `{ id: <number> }`

**Returns:** null

## Starter guide
```javascript
var Task = datalayer({ model: 'task'});
var User = datalayer({ model: 'user' });

var cleaning = new Task();
var alex = new User();
var john = new User();

john.name = 'John something';
john.email = 'john@dummy.com'
john.age = '27';

john.$save();

```

## Code examples

## Using events

## Modify
If your backend don't support RESTful you can easily alter the ajax call to
better fit your use cases.

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
