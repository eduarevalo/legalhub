angular.module('legalHub').service('collection', function($http, API) {
  var self = this;
  this.search = function(form, expectedValues){
    var query = [];
    for (var key in form) {
      if(form[key].length>0){
        query.push(key + "=" + encodeURIComponent(form[key]));
      }
    }
    if(expectedValues){
      query.push("$projection=" + encodeURIComponent(expectedValues.join(',')));
    }
    var promise = $http.get(API + 'collection/search?' + query.join("&")).then(function(response){
      if(response.data.success){
        return response.data.data;
      }
      return null;
    });
    return promise;
  }
  this.getCollection = function(collectionId, expectedValues){
    return self.search({id: collectionId}, expectedValues).then(function(collections){
      if(collections.length>0){
        return collections[0];
      }
      return null;
    });
  }
  this.save = function(collection){
    return $http.post(API + 'collection/save', collection).then(function(response){
      if(response.data.success){
        return {sucess: true, code: response.data.code, id: response.data.id};
      }else{
        return {sucess: false, error: response.data.error };
      }
    });
  }
})
