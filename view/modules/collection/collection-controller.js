angular.module('legalHub').controller('collectionCtrl', function($filter, $scope, ngTableParams, documentService, $state) {
  $scope.options = {active: false};
  $scope.title = $state.params.title;
  $scope.icon = $state.params.icon;
  var self = this;
  self.collectionId = $state.params.collectionId;
  documentService.getDocuments(self.collectionId).then(function(documents){
    documents.forEach(function(document){ document.selected = false; });
    $scope.documents = documents;
    self.tableSorting = new ngTableParams(
      {
        page: 1,
        count: 10,
        sorting: { name: 'asc' }
      },{
        total: documents.length, // length of data
        getData: function($defer, params) {
          // use build-in angular filter
          var orderedData = params.sorting() ? $filter('orderBy')(documents, params.orderBy()) : data;
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      })
  });
  $scope.activateOptions = function(){
    for(var it=0; it<$scope.documents.length; it++){
      if($scope.documents[it].selected === true){
        $scope.options.active = true;
        return;
      }
    }
    $scope.options.active = false;
  }
  $scope.goToNewDocument = function(templateName){
	   $state.go('new-document', {collectionId: self.collectionId, template: templateName});
  }
  $scope.goToEngrossDocument = function(document){
	$state.go('engross', {id: document.documentId, code: document.code, title: document.title, icon: document.icon});
  }
  $scope.goToEditDocument = function(documentId, title){
    $state.go('new-document', {collectionId: self.collectionId, documentId: documentId, documentTitle: title});
  }
  $scope.goToDocument = function(document){
    $state.go('document', {id: document.id, code: document.code});
  }
  $scope.goToUpload = function(){
    $state.go('manager.upload', {collectionId: self.collectionId});
  }
})
