angular.module('legalHub').service('rendition', function($http, API) {
  this.get = function(type, documentId){
    return $http.get(API + 'rendition/get?type=' + type + "&id=" + documentId).then(function(response){
      if(response.data.success){
        return {sucess: true, code: response.data.code, id: response.data.id};
      }else{
        return {sucess: false, error: response.data.error };
      }
    });
  }
})
