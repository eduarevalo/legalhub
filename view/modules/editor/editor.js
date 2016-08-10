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
  $('link[href*="editor/css"]').attr('disabled', 'disabled');
  $('link[href*="editor/css/common"]').removeAttr('disabled');
  $('link[href*="editor/css/'+ editorConfig.style+'"]').removeAttr('disabled');
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

var legalHubEditor = function(el, schema, events, config){
	var lhe = this;
	this.element = el;
	this.schema = schema;
	this.eventsConfig = events || {};
	this.config = config || {
		block : ['p'],
		inline : ['span'],
		content: ['section', 'table', 'blockquote']
	};
	this.events = {};
	this.initEvents = function(){
		var keyEvents = [];
		for(var elementName in this.eventsConfig){
			keyEvents = keyEvents.concat(Object.keys(this.eventsConfig[elementName]));
		}
		keyEvents.filter(function(item, pos, self) {
			return self.indexOf(item) == pos;
		}).forEach(function(eventName){
			lhe.events[eventName] = lhe.element.addEventListener(eventName, function(event){
				if(event.keyCode === 13){
					event.preventDefault();
				}
				var node = lhe.getSelectionStart();
				var tag = node.getAttribute('itemtype');
				if(lhe.eventsConfig[tag] && lhe.eventsConfig[tag][eventName] && lhe.eventsConfig[tag][eventName][event.keyCode]){
					var position = lhe.getCaretPosition();
					console.log(position);
					switch(position.position){
						case 'start':
							return lhe.eventsConfig[tag][eventName][event.keyCode].start({}, node, node);
						case 'end':
							return lhe.eventsConfig[tag][eventName][event.keyCode].end({}, node, node);
						default:
							return lhe.eventsConfig[tag][eventName][event.keyCode].middle({}, node, node);
					}
				}
				return true;
			});
		})
	};
	this.getSelectionStart = function() {
		var node = document.getSelection().anchorNode;
		return (node.nodeType == 3 ? node.parentNode : node);
	};
	this.getCaretPosition = function() {
	  var caretPos = 0,
		sel, range;
	  if (window.getSelection) {
		sel = window.getSelection();
		if (sel.rangeCount) {
		  range = sel.getRangeAt(0);
		  if (range.endContainer === range.startContainer) {
			if(range.endOffset === range.startOffset){
				var position = 'middle';
				if(range.startContainer.data.trim().length == 0){
					position = 'start';
				}else if(range.endOffset == range.endContainer.length){
					position = 'end';
				}
				return { selectedText: '', start: range.startOffset, end: range.endOffset, position: position};
			}
		  }
		}
	  } /*else if (document.selection && document.selection.createRange) {
		range = document.selection.createRange();
		if (range.parentElement() == editableDiv) {
		  var tempEl = document.createElement("span");
		  editableDiv.insertBefore(tempEl, editableDiv.firstChild);
		  var tempRange = range.duplicate();
		  tempRange.moveToElementText(tempEl);
		  tempRange.setEndPoint("EndToEnd", range);
		  caretPos = tempRange.text.length;
		}
	  }*/
	  return caretPos;
	};
	(this.init = function(){
		lhe.initEvents();
	})();
};