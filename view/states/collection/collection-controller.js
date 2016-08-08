angular.module('legalHub').controller('collectionCtrl', function($filter, $scope, ngTableParams, document, $state) {
  $scope.title = $state.params.title;
  $scope.icon = $state.params.icon;
  var self = this;
  self.collectionId = $state.params.collectionId;
  document.getDocuments(self.collectionId).then(function(documents){
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
  $scope.goTo = function(document){
    $state.go('document', {id: document.id, code: document.code});
  }
  $scope.goToUpload = function(){
    $state.go('manager.upload', {collectionId: self.collectionId});
  }
})
