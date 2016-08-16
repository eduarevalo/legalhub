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
  this.generate = function(type, documentId){
    var content = '<div>'+document.getElementById('editor').innerHTML.replace(/&nbsp;/g, " ")+'</div>';
    return $http({ method: 'POST', url: API + 'rendition/generate', responseType: 'arraybuffer', data: {type: type, content: content}}).then(function(response){
      if(response.data){
        var blob = new Blob([response.data], {
			type: 'application/xml'
		});

		var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = documentId + '.' + type;
        link.click();
        window.URL.revokeObjectURL(link.href);

      }
    });
  }
})
