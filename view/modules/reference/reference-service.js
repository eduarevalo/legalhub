angular.module('legalHub').service('referenceService', function($http, API){
  this.getProvision = function(params){
	var query = [];
    for (var key in params) {
      if(params[key].length>0){
        query.push(key + "=" + encodeURIComponent(params[key]));
      }
    }
    var promise = $http.get(API + 'reference/provision?'+query.join("&")).then(function(response){
      if(response.data.success){
        return response.data.data;
      }
      return null;
    });
    return promise;
  }
  this.getProperties = function(params, properties){
	var query = [];
    for (var key in params) {
      if(params[key].length>0){
        query.push(key + "=" + encodeURIComponent(params[key]));
      }
    }
    var promise = $http.get(API + 'reference/properties?'+query.join("&")).then(function(response){
      if(response.data.success){
        return response.data.data;
      }
      return null;
    });
    return promise;
  }
})
