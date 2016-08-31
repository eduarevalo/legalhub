angular.module('legalHub').service('rendition', function($http, API) {
  this.get = function(type, document){
    return $http.get(API + 'rendition/get?type=' + type + "&id=" + document.id).then(function(response){
      if(response.data.success){
        return {sucess: true, code: response.data.code, id: response.data.id};
      }else{
        return {sucess: false, error: response.data.error };
      }
    });
  }
  this.generate = function(type, document){
    return $http({
      method: 'POST',
      url: API + 'rendition/generate',
      responseType: 'arraybuffer',
      data: {type: type, content: document.content}}).then(function(response){
      if(response.data){
          var blob = new Blob([response.data], { type: 'application/' + type });
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = documentId + '.' + type;
          link.click();
          window.URL.revokeObjectURL(link.href);
      }
    });
  }
  this.diff = function(){
    var source = document.getElementById('editor').querySelector('blockquote').innerHTML.replace(/&nbsp;/g, " ");
    return $http({ method: 'POST', url: API + 'rendition/diff', data: {source: source, target: originalSource}}).then(function(response){
      return response.data;
    });
  }
})
