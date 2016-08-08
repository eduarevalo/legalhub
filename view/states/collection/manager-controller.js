angular.module('legalHub').controller('collectionManagerCtrl', function($scope, $timeout, collection, growlService) {
  $scope.mode = 'add';
  $scope.isModelModified = false;
  $scope.searchModel = { code :'', title: '', description: ''};
  $scope.createModel = { code :''};
  $scope.collections = [];
  $scope.resetCollections = function(){
    $scope.collections = [];
  };
  $scope.resetSearch = function(){
    $scope.collections = [];
    $scope.searchModel = { code :'', title: '', description: ''};
  }
  $scope.resetCreate = function(){
    $scope.collections = [];
    $scope.createModel = { code :''};
  }
  $scope.search = function() {
    collection.search($scope.searchModel, ['id', 'code', 'title', 'description', 'count']).then(
      function(collections){
        $scope.collections = collections;
        $timeout(function() {
          $scope.$apply();
        });
      }, function(response){
        $scope.resetCollections();
        console.log(response);
      }
    );
  };
  $scope.create = function(){
    if($scope.createModel.code.trim().length>0){
      var query = 'code=' + encodeURIComponent($scope.createModel.code.trim());
      $http.get(API + 'collection/search?' + query).then(
        function(response){
          if(response.data.length == 0){
            $scope.goToEdit();
          }else{
            alert('ya existe un workspace con este codigo');
          }
        }, function(response){
          console.log(response);
        }
      );
    }else{
      $scope.goToEdit();
    }
  }
$scope.goToEdit = function(){
  $scope.mode = 'edit';
  $timeout(function() {
    $scope.$apply();
  });
}
$scope.goToSearch = function(){
  $scope.mode = 'search';
  $scope.resetCreate();
  $timeout(function() {
    $scope.$apply();
  });
}
$scope.edit = function(id){
  collection.getCollection(id).then(
    function(collection){
      if(collection){
        $scope.createModel = collection;
        $scope.goToEdit();
      }else{
        alert('Ouups!, Collection not found.');
      }
    }, function(response){
      console.log(response);
    });
  }
  $scope.changeModel = function() {
    $scope.isModelModified = true;
  }
  $scope.save = function(){
    if($scope.validate()){
      collection.save($scope.createModel).then(function(response){
        if(response.success){
          $scope.createModel.code = response.code;
          $scope.createModel.id = response.id;
          $scope.isModelModified = false;
          growlService.growl('Saved');
        }else{
          growlService.growl(response.error);
        }}, function(response){
          console.log(response);
        }
      );
    }
  }
  $scope.validate = function(){
    return true;
  }
})
