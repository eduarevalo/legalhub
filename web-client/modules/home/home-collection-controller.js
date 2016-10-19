angular.module('legalHub').controller('homeCollectionCtrl', function($scope, $state, collection){
  collection.search({}, ['title', 'count', 'color', 'icon', 'code']).then(
    function(collections){
      $scope.collections = collections;
    }
  );
  $scope.goTo = function(collection){
    $state.go('home.collection', {
      code: collection.code,
      collectionId: collection.id,
      title: collection.title,
      icon: collection.icon
    });
  }
})
