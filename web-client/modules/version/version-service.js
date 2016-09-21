angular.module('legalHub').service('version', function($http, API){
  this.getLastVersion = function(documentId, rendition){
	var query = rendition && rendition.length>0 ? '&rendition=' + encodeURIComponent(rendition): '';
    var promise = $http.get(API + 'version/content?documentId='+encodeURIComponent(documentId) + query).then(function(response){
      if(response.data.success){
        return response.data.data;
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
