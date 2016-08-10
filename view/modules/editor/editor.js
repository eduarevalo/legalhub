var lastPosition = -2000, lastNumber = 1, initialOffsetTop = 207;
var editorConfig = {
  lineNumbers: false,
  style: 'default'
};
function init(){
  setLineNumbers();
  setPageStyle();
}
function toggleLineNumbers(){
  initialOffsetTop = editorConfig.style == 'default' ? 207 : 160;
  editorConfig.lineNumbers = !editorConfig.lineNumbers;
  setLineNumbers();
}
function setPageStyle(style){
  if(style){
    editorConfig.style = style;
  }
  document.getElementById('page-container').className = editorConfig.style;
  setLineNumbers();
}
function setLineNumbers(){
  document.getElementById('line-numbers').style.display = editorConfig.lineNumbers ? 'block' : 'none';
  document.getElementById('line-numbers').innerHTML = '';
  if(editorConfig.lineNumbers){
    lastPosition = -2000;
    lastNumber = 1;
    var elements = document.querySelectorAll("#editor span");
    for (var i = 0; i != elements.length; i++) {
      if(elements[i].innerHTML.trim() != '<br>'){
        addClientRectsOverlay(elements[i]);
      }
    }
  }
}
function addClientRectsOverlay(element) {
  var rects = element.getClientRects();
  var divs = "";
	for (var i = 0; i != rects.length; i++) {
      var rect = rects[i];
      var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      var top = rect.top - initialOffsetTop;
      if(top > lastPosition){
        lastPosition = top;
        divs += '<div class="line-number" style="top:' + top + 'px">' + lastNumber++ + '</div>';
      }
  }
  document.getElementById('line-numbers').innerHTML += divs;
}
