angular.module('legalHub').controller('uploadManagerCtrl', function ($scope, Upload, $timeout, API, collection, $state) {
  var self = this;
  self.collectionId = $state.params.collectionId;
  collection.search().then(function(data){
    $scope.collections = data;
    $scope.formData = { collection: self.collectionId.length > 0 ? self.collectionId : data[0].id };
  });
  $scope.uploadFiles = function(files, errFiles) {
    $scope.files = files;
    $scope.errFiles = errFiles;
    angular.forEach(files, function(file) {
      file.upload = Upload.upload({
        url: API + 'document/upload',
        data: {
          file: file,
          collection: $scope.formData.collection
        }
      });

      file.upload.then(function (response) {
        $timeout(function () {
          file.result = response.data;
        });
      }, function (response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
        }, function (evt) {
          file.progress = Math.min(100, parseInt(100.0 *
            evt.loaded / evt.total));
          });
        });
      }
    })
