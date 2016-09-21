angular.module('legalHub').service('engrossService', function($http, API) {
  this.engross = function(originalDocument, engrossingDocuments){
	var query = 'original=' + encodeURIComponent(originalDocument);
	for(var it=0; it<engrossingDocuments.length; it++){
		query += "&engrossing=" + encodeURIComponent(engrossingDocuments[it]);
	}
    var promise = $http.get(API + 'engross/preview?' + query).then(function(response){
      if(response.data.success){
        return response.data.data;
      }
      return null;
    });
    return promise;
  }
})
