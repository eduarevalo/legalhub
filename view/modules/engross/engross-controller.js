angular.module('legalHub').controller('engrossCtrl', function($timeout, $state, version, $scope){
	$scope.title = $state.params.title;
	$scope.awaiting = [{id: 1, title: 'Amendment 1'}, {id: 2, title: 'Amendment 2'}, {id: 3, title: 'Amendment 3'}, {id: 4, title: 'Amendment 4'}];
	$scope.adopted = [];
	$scope.rejected = [];
  var self = this;
  //version.getVersions($state.params.id).then(function(data){
    //$scope.versions = data;
    $timeout(function(){
      self.init();
    });
  //});

  //Animate
  this.ca = '';

  this.setAnimation = function(animation, target) {
    if (animation === "hinge") {
      animationDuration = 2100;
    }
    else {
      animationDuration = 1200;
    }
    if(angular.element('#'+target)[0]){
		angular.element('#'+target)[0].style.visibility = 'visible';
		angular.element('#'+target).addClass(animation);
	}

    $timeout(function(){
      angular.element('#'+target).removeClass(animation);
    }, animationDuration);
  }
  this.init = function(){
    $scope.awaiting.forEach(function(amendment, index){
      $timeout(function(){
        self.setAnimation(index ==0 ? 'flipInY' : 'fadeInLeft', 'amendment'+index);
      }, index * 500);
    });
  }

})
