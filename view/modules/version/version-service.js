angular.module('legalHub').service('version', function($http, API){
  this.getLastVersion = function(documentId){
    var promise = $http.get(API + 'version/content?id='+documentId).then(function(response){
      if(response.data.success){
        return response.data.data[0];
      }
      return null;
    });
    return promise;
  }
  this.getVersions = function(documentId){
    var promise = $http.get(API + 'version/get?id='+documentId).then(function(response){
      if(response.data.success){
        return response.data.data;
      }
      return null;
    });
    return promise;
  }
})
