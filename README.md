# Datalayer
Datalayer is a simple AngularJS service abstraction to consume data from a
RESTful Api

## Install
----
You can download it by:
* Using npm and running `npm run datalayer`
* Download manually and include the `<script type="text/javascript" src="./dist/datalayer.min.js">`

## Starter guide

## Code examples

## Using events

## Modify
If your backend dont support RESTful you can easily alter the ajax call to
better fit your use cases.

```javascript
function datalayer($rootScope, $http, $q) {

  Resource.find = function(filter) {
    var defer = $q.defer();

    /**
     * Add your $http call here
     * return a promise
     */
  };


}
```
