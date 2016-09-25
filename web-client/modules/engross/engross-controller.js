angular.module('legalHub').controller('engrossCtrl', function($timeout, $state, version, documentService, engrossService, $scope, $sce){
	$scope.totalSteps = 3;
	$scope.currentStep = 1;
	$scope.title = $state.params.title;
	$scope.totalConflicts = 0;
	$scope.engrossedContent = '';
	$scope.awaiting = [/*{
			id: 1, title: 'Amendment 1', amendments: 25, conflicts: 2
		}, {
			id: 2, title: 'Amendment 2', amendments: 9, conflicts: 0
		}, {
			id: 3, title: 'Amendment 3', amendments: 36, conflicts: 8
		}*/];
	$scope.adopted = [];
	$scope.rejected = [];
	var self = this;
	var originalDocumentId = $state.params.id;
	if(originalDocumentId){
		documentService.getAmendmentsByBill(originalDocumentId).then(function(data){
			if(data){
				data.forEach(function(amendment, index){
					documentService.getDocument(amendment.documentId, ['title']).then(function(documentData){
						$scope.awaiting.push({
							id: documentData.id, title: documentData.title, amendments: amendment.links, conflicts: 0
						});
						if(index == data.length - 1){
							$timeout(function(){
								self.init();
							});
						}
					});
				});
			}else{
				$timeout(function(){
					self.init();
				});
			}
		});
	}

	$scope.allowedToGo = function(){
		if($scope.currentStep == 1){
			return $scope.awaiting.length == 0;
		}else if($scope.currentStep == 2){
			$scope.refreshStep();
			if($scope.totalConflicts > 0){
				return false;
			}
		}
		return true;
	}
	
	$scope.nextStep = function(){
		$scope.currentStep++;
		$scope.refreshStep();
	}

	$scope.previousStep = function(){
		$scope.currentStep--;
		$scope.refreshStep();
	}
	$scope.refreshStep = function(){
		switch($scope.currentStep){
			case 1:
				self.init();
				break;
			case 2:
				$scope.analyze();
				break;
			case 3:
				var adoptedIDocuments = [];
				for(var i=0; i<$scope.adopted.length; i++){
					adoptedIDocuments.push($scope.adopted[i].id);
				}
				engrossService.engross(originalDocumentId, adoptedIDocuments).then(function(engrossedVersion){
					if(engrossedVersion){
						$scope.engrossedContent = engrossedVersion.content;
					}
				});
				break;
		}
	}
	$scope.analyze = function(){
		$scope.totalConflicts = 0;
		$scope.adopted.forEach(function(amendment){
			amendment.conflicts = 0;
			amendment.amendments.forEach(function(link){
				if(link.selected == undefined){
					link.selected = true;
					link.details = '';
					link.source = '';
					link.conflicted = false;
				}
				
				if(link.conflicted){
					amendment.conflicts++;
					$scope.totalConflicts++;
				}
			});
			if(amendment.collapsed == undefined){
				amendment.collapsed = amendment.conflicts == 0;
			}
		});
	};
	$scope.confirm = function(){
		alert("Working on...");
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
	
	$scope.getHtml = function(doc){
		return $sce.trustAsHtml(doc);
	};
	
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
