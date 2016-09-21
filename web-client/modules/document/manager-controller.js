angular.module('legalHub').controller('documentManagerCtrl', function($scope, documentService, $timeout) {
  $scope.mode = 'add';
  $scope.isModelModified = false;
  $scope.searchModel = { code :'', title: '', description: ''};
  $scope.createModel = { code :''};
  $scope.documents = [];
  $scope.resetDocuments = function(){
    $scope.documents = [];
  };
  $scope.resetSearch = function(){
    $scope.documents = [];
    $scope.searchModel = { code :'', title: '', description: ''};
  }
  $scope.resetCreate = function(){
    $scope.documents = [];
    $scope.createModel = { code :''};
  }
  $scope.search = function() {
    documentService.search($scope.searchModel).then(function(response){
      $scope.documents = response.data;
      $timeout(function() {
        $scope.$apply();
      });
    }, function(response){
      $scope.resetDocuments();
      console.log(response);
    });
  }
  $scope.create = function(){
    $scope.goToEdit();
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
    documentService.getDocument(id).then(function(response){
      if(response.data && response.data.length>0){
        $scope.createModel = response.data[0];
        $scope.goToEdit();
      }else{
        alert('Oupps! Document not found.');
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
      $http.post(API + 'collection/save', $scope.createModel).then(
        function(response){
          if(response.data.success){
            $scope.createModel.code = response.data.code;
            $scope.createModel.id = response.data.id;
            $scope.isModelModified = false;
            growlService.growl('Saved');
          }else{
            growlService.growl(response.data.error);
          }
        }, function(response){
          console.log(response);
        }
      );
    }
  }
  $scope.validate = function(){
    return true;
  }
})
