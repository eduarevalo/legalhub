angular.module('legalHub').controller('newDocumentCtrl', function($scope, $state, $timeout, version, rendition, $sce) {
  $scope.mode ='new';
  $scope.documentId =  '57acca5446d29b1c7cdd7266'/*/'57abdd6bc46e79118c8b6143'/**/;
  $scope.goToNew = function(){
	$scope.mode = 'new';
	$timeout(function() {
	  $scope.$apply();
	});
  }
  $scope.getHtml = function(html){
	  html = '<section itemtype="body"><p itemtype="text" empty="true">&nbsp;</p></section>';
    return $sce.trustAsHtml(html);
  };
  $scope.goToTemplate = function(templateId){
    version.getLastVersion($scope.documentId).then(function(version){
      $scope.content = version.content;
	  $scope.mode = 'edit';
  	  $timeout(function() {
          init();
		  editor = new legalHubEditor( document.getElementById('editor'), schema );
          $scope.$apply();
  		});
    });
  }
  $scope.getRendition = function(type){
	rendition.get(type, $scope.documentId);
  }
$scope.diff = function(){
    rendition.diff().then(function(data){
      $('#editor blockquote').html(data);
    });
  }
})
