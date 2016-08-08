angular.module('legalHub').controller('versionCtrl', function($timeout, $state, version, $scope){
  var self = this;
  version.getVersions($state.params.id).then(function(data){
    $scope.versions = data;
    $timeout(function(){
      self.init();
    });
  });

  //Animate
  this.ca = '';

  this.setAnimation = function(animation, target) {
    if (animation === "hinge") {
      animationDuration = 2100;
    }
    else {
      animationDuration = 1200;
    }
    angular.element('#'+target)[0].style.visibility = 'visible';
    angular.element('#'+target).addClass(animation);

    $timeout(function(){
      angular.element('#'+target).removeClass(animation);
    }, animationDuration);
  }
  this.init = function(){
    $scope.versions.forEach(function(version, index){
      $timeout(function(){
        self.setAnimation(index ==0 ? 'flipInY' : 'fadeInLeft', 'version'+index);
      }, index * 500);
    });
  }

})
