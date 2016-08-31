angular.module('legalHub').service('documentService', function($http, API) {
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
    var promise = $http.get(API + 'document/search?' + query.join("&")).then(function(response){
      if(response.data.success){
        return response.data.data;
      }
      return null;
    });
    return promise;
  }
  this.getDocuments = function(collectionId, expectedValues){
    return self.search({collections: collectionId}, expectedValues);
  }
  this.getDocument = function(documentId, expectedValues){
    return self.search({id: documentId}, expectedValues).then(function(data){
      if(data.length>0){
        return data[0];
      }
      return null;
    });
  }
  this.save = function(document){
    return $http.post(API + 'document/save', document).then(function(response){
      if(response.data.success){
        return {success: true, code: response.data.code, id: response.data.id};
      }else{
        return {success: false, error: response.data.error };
      }
    });
  }
})
