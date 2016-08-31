angular.module('legalHub').controller('documentCtrl', function($scope, documentService, collection, version, $state, $sce) {
  $scope.collectionNames = '';
  documentService.getDocument($state.params.id).then(function(document){
    $scope.document = document;
    $scope.collectionNames = '';
    for(var it=0; it<document.collections.length; it++){
      collection.getCollection(document.collections[it], ['title']).then(function(collection){
        if(collection){
          $scope.collectionNames += collection.title;
        }
      });
    }
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
