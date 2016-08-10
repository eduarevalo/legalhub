angular.module('legalHub').controller('newDocumentCtrl', function($scope, $state, $timeout, version, $sce) {
  $scope.mode ='new';
  $scope.goToNew = function(){
	$scope.mode = 'new';
	$timeout(function() {
	  $scope.$apply();
	});
  }
  $scope.getHtml = function(html){
    return $sce.trustAsHtml(html);
  };
  $scope.goToTemplate = function(templateId){
	   version.getLastVersion(/*'57a9f8d1dec2d81eecfd4436'*/'57aa8b1830ecae0f0c247357').then(function(version){
      $scope.content = version.content;
	    $scope.mode = 'edit';
  	  $timeout(function() {
          init();
          $scope.$apply();
  		});
    });
  }
})
