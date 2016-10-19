angular.module('legalHub').controller('documentCtrl', function($timeout, $scope, documentService, collection, version, $state, $sce) {
  $scope.collectionNames = '';
  $scope.documentId = $state.params.id;
  $scope.rendition = '';
  documentService.getDocument($scope.documentId).then(function(document){
    $scope.document = document;
	if($scope.hasRendition('editor')){
		$scope.rendition = '';
	}else if($scope.hasRendition('pdf')){
		$scope.rendition = 'pdf';
	}else if($scope.hasRendition('original')){
		$scope.rendition = 'original';
	}
	
    $scope.collectionNames = '';
    for(var it=0; it<document.collections.length; it++){
      collection.getCollection(document.collections[it], ['title']).then(function(collection){
        if(collection){
          $scope.collectionNames += collection.title;
        }
      });
    }
  });
  $scope.openDocument = function(){
	  version.getLastVersion($scope.documentId, $scope.rendition).then(function(version){
		if(version && version.content){
			$scope.content = version.content;
		}else{
			$scope.filePath = '/' + version.filePath;
			$timeout(function(){
				renderPDF($scope.filePath, document.getElementById('pdf-holder'));
			}, 1000);
		}
	  });
  };
  $scope.openRendition = function(type){
	$scope.rendition = type;
	$scope.openDocument();
  }
  $scope.getHtml = function(html){
    return $sce.trustAsHtml(html);
  };
  $scope.goToVersions = function(document){
    $state.go('home.versions', {id: document.id, code: document.code});
  }
  $scope.hasRendition = function(type){
	if($scope.document){
		for(var it=0; it<$scope.document.renditions.length; it++){
			if($scope.document.renditions[it].rendition.toLowerCase() == type.toLowerCase()){
				return true;
			}
		}
	}
	return false;
  }
  $scope.goToEditDocument = function(d){
	$state.go('new-document', {collectionId: $scope.document.collections[0], documentId: $scope.document.documentId, documentTitle: $scope.document.title});
  }
})
