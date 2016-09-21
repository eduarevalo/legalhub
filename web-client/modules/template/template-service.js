angular.module('legalHub').service('template', function($http, API){
  this.getContent = function(templateId){
    var promise = $http.get(API + 'template/content?id='+templateId).then(function(response){
      if(response.data.success){
        return response.data.data[0];
      }
      return null;
    });
    return promise;
  }
  this.getTemplates = function(templateId){
    var promise = $http.get(API + 'template/get?id='+templateId).then(function(response){
      if(response.data.success){
        return response.data.data;
      }
      return null;
    });
    return promise;
  }
})
