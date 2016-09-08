var drake;
var startDragAndDrop = function(){
  drake = dragula([
    document.getElementById('awaiting-stack'),
    document.getElementById('adopted-stack'),
    document.getElementById('rejected-stack')
  ],{
    //removeOnSpill: true
  });
  drake.on('drop', function(el, target, source, sibling){
    if(el.parentNode){
      var sourceStack = source.id;
      var targetStack = el.parentNode.id;
      var amendmentId = el.hasAttribute('amendment-id') ? el.getAttribute('amendment-id') : '';
      if(amendmentId){
        var scope = angular.element(el).scope();
        if(scope){
          scope.move(amendmentId, sourceStack, targetStack);
        }
      }
    }
  });
}
