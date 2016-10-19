angular.module('legalHub').service('userService', function($http, API) {
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
    var promise = $http.get(API + 'user/search?' + query.join("&")).then(function(response){
      if(response.data.success){
        return response.data.data;
      }
      return null;
    });
    return promise;
  }
  this.getUser = function(userId, expectedValues){
    return self.search({id: userId}, expectedValues).then(function(data){
      if(data.length>0){
        return data[0];
      }
      return null;
    });
  }
})
