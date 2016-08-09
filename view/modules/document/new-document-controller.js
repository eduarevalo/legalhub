angular.module('legalHub').controller('newDocumentCtrl', function($scope, $state, $timeout, version, $sce) {
  $scope.mode ='new';
  $scope.style = 'default';
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
	version.getLastVersion('57a9f8d1dec2d81eecfd4436').then(function(version){
      $scope.content = version.content;
	  $scope.mode = 'edit';
	  $timeout(function() {
		addClientRectsOverlay(document.getElementById('HAB96F11590364A52AB37C389C9E6603A'));
		  $scope.$apply();
		});
    });
  }
  $scope.changeStyle = function(style){
	$scope.style = style;
	$timeout(function() {
	  $scope.$apply();
	});
  }
})
