angular.module('legalHub').controller('documentCtrl', function($scope, document, version, $state, $sce) {
  document.getDocument($state.params.id).then(function(document){
    $scope.document = document;
  });
  version.getLastVersion($state.params.id).then(function(version){
    $scope.content = version.content;
  });
  $scope.getHtml = function(html){
    return $sce.trustAsHtml(html);
  };
  $scope.goToVersions = function(document){
    $state.go('versions', {id: document.id, code: document.code});
  }
})
