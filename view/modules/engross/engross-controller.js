angular.module('legalHub').controller('engrossCtrl', function($timeout, $state, version, $scope){
	$scope.totalSteps = 3;
	$scope.currentStep = 1;
	$scope.title = $state.params.title;
	$scope.totalConflicts = 0;
	$scope.awaiting = [{
			id: 1, title: 'Amendment 1', amendments: 25, conflicts: 2
		}, {
			id: 2, title: 'Amendment 2', amendments: 9, conflicts: 0
		}, {
			id: 3, title: 'Amendment 3', amendments: 36, conflicts: 8
		}, {
			id: 4, title: 'Amendment 4', amendments: 41, conflicts: 0
		}];
	$scope.adopted = [];
	$scope.rejected = [];
  var self = this;
  //version.getVersions($state.params.id).then(function(data){
    //$scope.versions = data;
    $timeout(function(){
      self.init();
    });
  //});

	$scope.nextStep = function(){
		$scope.currentStep++;
		$scope.refreshStep();
		self.init();
	}

	$scope.previousStep = function(){
		$scope.currentStep--;
		$scope.refreshStep();
		self.init();
	}
	$scope.refreshStep = function(){
		if($scope.currentStep == 2){
			$scope.totalConflicts = 0;
			for(var i=0; i<$scope.adopted.length; i++){
				$scope.totalConflicts += $scope.adopted[i].conflicts;
			}
		}
	}

	$scope.move = function(id, sourceStack, targetStack){
		var fromStack;
		var toStack;
		switch(sourceStack){
			case 'awaiting-stack':
				fromStack = $scope.awaiting;
				break;
			case 'adopted-stack':
					fromStack = $scope.adopted;
					break;
			case 'rejected-stack':
				fromStack = $scope.rejected;
				break;
		}
		switch(targetStack){
			case 'awaiting-stack':
				toStack = $scope.awaiting;
				break;
			case 'adopted-stack':
				toStack = $scope.adopted;
				break;
			case 'rejected-stack':
				toStack = $scope.rejected;
				break;
		}
		for(var i=0; i<fromStack.length; i++){
			if(fromStack[i].id == id){
				var element = fromStack[i];
				fromStack.splice(i, 1);
				toStack.push(element);
				$scope.$apply();
				return;
			}
		}
	}

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
				if(index==0){
					startDragAndDrop();
				}
        self.setAnimation(index ==0 ? 'flipInY' : 'fadeInLeft', 'amendment'+index);
      }, index * 500);
    });
  }

})
