var editor;

var lastPosition = 0, lastNumber = 1;

var editorConfig = {
  lineNumbers: false,
  style: 'default'
};
function init(){
  setLineNumbers();
  setPageStyle();
}
function toggleLineNumbers(){
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
    lastPosition = 0;
    lastNumber = 1;
    var elements = editor.element.querySelectorAll("span, p");
    for (var i = 0; i != elements.length; i++) {
      if(elements[i].innerHTML.trim() != '<br>'){
        addClientRectsOverlay(elements[i]);
      }
    }
  }
}
function addClientRectsOverlay(element) {
	var divs = "";
	var scrollTop = document.getElementById('editor').scrollTop + document.body.scrollTop;
	var lineHeight = parseInt($(element).css('line-height')),  divHeight = element.offsetHeight, lines = divHeight / lineHeight;
	if(element.tagName.toLowerCase() == 'span' || lines == 1){
	  var rects = element.getClientRects();
		for (var i = 0; i != rects.length; i++) {
		  var rect = rects[i];
		  var top = rect.top + scrollTop;
		  if(top > lastPosition){
			lastPosition = top;
			divs += '<div class="line-number" style="top:' + top + 'px">' + lastNumber++ + '</div>';
		  }
	  }
	}else{
		var blockOffset = element.getClientRects()[0].top;
		for(var it=0; it<lines; it++){
		  var top = blockOffset + scrollTop + (lineHeight*it);
		  if(top > lastPosition){
			lastPosition = top;
			divs += '<div class="line-number" style="top:' + top + 'px">' + lastNumber++ + '</div>';
		  }
 	   }
	}
	document.getElementById('line-numbers').innerHTML += divs;
}

var legalHubEditor = function(el, schema, events, config){
	var lhe = this;
	this.element = el;
	this.schema = schema;
	this.eventsConfig = events || {};
	this.config = config || {};
	this.events = {};
    this.firstNode;
	this.currentTag;
	this.currentBlock;
	this.currentContainer;
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
				if(event.keyCode === 8 && lhe.insideTrackChangesBlock()){
					event.preventDefault();
				}
				lhe.currentTag = lhe.getSelectionStart();
				var tag = lhe.currentTag.getAttribute('itemtype');
				if(event.keyCode >= 48 && event.keyCode <= 90) {
					if(lhe.schema[tag] && lhe.schema[tag].type == 'container'){
						event.preventDefault();
						return false;
					}
				}
				if(lhe.currentTag == lhe.firstNode){
				  console.log('firstNode');
				}
				var position = lhe.getCaretPosition();
				position.tag = tag;
				position.event = eventName;
				position.keyCode = event.keyCode;
				if(event.keyCode >= 65 && event.keyCode <= 90) {
				  position.keyCode = 'az';
				}
				console.log(position);
				if(lhe.eventsConfig[tag] && lhe.eventsConfig[tag][eventName] && lhe.eventsConfig[tag][eventName][position.keyCode]){
					switch(position.position){
						case 'select':
							if(lhe.eventsConfig[tag][eventName][position.keyCode].select){
							  return lhe.eventsConfig[tag][eventName][position.keyCode].select(position, lhe.currentTag, lhe);
							}
							break;
						case 'start':
							if(lhe.eventsConfig[tag][eventName][position.keyCode].start){
							  return lhe.eventsConfig[tag][eventName][position.keyCode].start(position, lhe.currentTag, lhe);
							}
							break;
						case 'end':
							if(lhe.eventsConfig[tag][eventName][position.keyCode].end){
								return lhe.eventsConfig[tag][eventName][position.keyCode].end(position, lhe.currentTag, lhe);
							}
							break;
						case 'middle':
							if(lhe.eventsConfig[tag][eventName][position.keyCode].middle){
							  return lhe.eventsConfig[tag][eventName][position.keyCode].middle(position, lhe.currentTag, lhe);
							}
							break;
					}
				}
				return true;
			});
		})
		lhe.events['core_mousedown'] = lhe.element.addEventListener('mousedown', lhe.setTagPosition);
		lhe.events['core_keydown'] = lhe.element.addEventListener('keydown', lhe.setTagPosition);
		lhe.events['core_mouseup'] = lhe.element.addEventListener('mouseup', lhe.updateBreadcrumb);
		lhe.events['core_keyup'] = lhe.element.addEventListener('keyup', function(event){
			if(event.keyCode>=33 && event.keyCode<=40){
				lhe.updateBreadcrumb();
			}
			var element = lhe.getSelectionStart();
			if(element.hasAttribute('empty')){
				if(element.innerHTML.trim().length > 0){
					element.removeAttribute('empty');
				}
			}
		});
	};
	this.setTagPosition = function(event){
		console.log("setTagPosition()");
		if(event && lhe.element != event.srcElement && lhe.element.contains(event.srcElement)){
			lhe.currentTag = event.srcElement;
		}else{
			lhe.currentTag = lhe.getSelectionStart();
		}
		if(lhe.currentTag){
			for(var it=0; it<lhe.config.block.length; it++){
				var tag = lhe.config.block[it];
				var element = lhe.currentTag.closest(tag);
				if(element){
					console.log("lhe.currentBlock");
					lhe.currentBlock = element;
				}
			}
			for(var it=0; it<lhe.config.container.length; it++){
				var tag = lhe.config.container[it];
				var element = lhe.currentTag.closest(tag);
				if(element){
					console.log("lhe.currentContainer");
					lhe.currentContainer = element;
				}
			}
		}
	};
	this.updateBreadcrumb = function(){
		console.log("updateBreadcrumb()");
		var breadcrumb = document.getElementById('contextual-menu');
		var newValue = [];
		if(lhe.currentContainer){
			newValue.push(lhe.currentContainer.getAttribute('itemtype'));
		}
		if(lhe.currentBlock){
			newValue.push(lhe.currentBlock.getAttribute('itemtype'));
		}
		if(lhe.currentTag){
			newValue.push(lhe.currentTag.getAttribute('itemtype'));
		}
		breadcrumb.querySelector(".selected-option").innerHTML = newValue.join(" / ");
		lhe.updateHeadingMenu();
	};
	this.updateHeadingMenu = function(){
		if(lhe.currentBlock && lhe.currentBlock.hasAttribute('itemtype')){
			document.getElementById('heading-menu').querySelector(".selected-option").innerHTML = this.currentBlock.getAttribute('itemtype');
		}else{
			document.getElementById('heading-menu').querySelector(".selected-option").innerHTML = '...';
		}
	}
  this.setFirstNode = function(node){
    if(node === undefined){
      lhe.firstNode = null;
      node = lhe.element;
    }
    if(node.nodeType == 3){
      if(node.data.trim().length>0){
        lhe.firstNode = node.parentNode;
        return;
      }
    }else if(node.nodeType == 1){
      for(var it=0; it<node.childNodes.length; it++){
        lhe.setFirstNode(node.childNodes[it]);
        if(lhe.firstNode){
          return;
        }
      }
    }
  };
  this.getSelectionStart = function() {
	var node = document.getSelection().anchorNode;
	if(node){
		return (node.nodeType == 3 ? node.parentNode : node);
	}
	return null;
  };
  this.insideTrackChangesBlock = function(){
	return this.currentBlock.closest('blockquote');
  };
  this.getHeadingBlock = function(element){
    var mainBlock = this.getBlock(element);
    var nodeType = this.getType(mainBlock);
    if(lhe.schema[nodeType].type == 'heading'){
      return mainBlock;
    }
    for(var it=0; it<lhe.config.block.length; it++){
      while(mainBlock = mainBlock.previousSibling){
        if(mainBlock && mainBlock.tagName.toLowerCase() == lhe.config.block[it]){
          nodeType = lhe.getType(mainBlock);
          if(lhe.schema[nodeType].type == 'heading'){
            return mainBlock;
          }
        }
      }
    }
  };
	this.getBlock = function(element){
    for(var it=0; it<lhe.config.block.length; it++){
        var node = element.closest(lhe.config.block[it]);
        if(node){
          return node;
        }
    }
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
  				if(range.startContainer.data.trim().length == 0 || range.endOffset == 0){
  					position = 'start';
  				}else if(/*range.endOffset == range.endContainer.length &&*/ range.startOffset == range.endOffset && range.startOffset > 0){
  					position = 'end';
  				}
  				return { start: range.startOffset, end: range.endOffset, position: position};
  			}else{
  				return { start: range.startOffset, end: range.endOffset, position: 'select'};
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
	  return {position: caretPos};
	};
	this.initNodes = function(element){
		/*if(element == undefined){
			element = lhe.element;
		}
		if(element.nodeType == 3){
			if(element.data.trim().length == 0){
				element.parentNode.removeChild(element);
			}
		}
		element.childNodes.forEach(function(childNode){
			lhe.initNodes(childNode);
		});*/
	};
	this.setType = function(element, type){
		if(element){
			element.setAttribute('itemtype', type);
		}
	};
	this.getType = function(element){
		return element && element.hasAttribute('itemtype') ? element.getAttribute('itemtype') : null;
	};
	this.insertBlockAfter = function(newNode){
		if(lhe.currentBlock.nextSibling){
			lhe.currentBlock.parentNode.insertBefore(newNode, lhe.currentBlock.nextSibling);
		}else{
			lhe.currentBlock.parentNode.appendChild(newNode);
		}
	};
	this.transform = function(element, type){
		var newChildren = [];
		for(var it=0; it<lhe.schema[type].children.length; it++){
			var newElementTag = lhe.schema[type].children[it];
			var newElement = lhe.newElement(newElementTag, element);
			newChildren.push(newElement);
		}
		element.innerHTML = '';
		for(var it=0;it<newChildren.length;it++){
			element.appendChild(newChildren[it]);
			lhe.currentTag = newChildren[it];
		}
	};
	this.newElement = function(tag, baseElement, link){
    console.log('newElement() '+ tag);
		var newElement = document.createElement(lhe.schema[tag].tag);
    newElement.id = legalHub.tools.guid();
    if(!!link){
      var block = lhe.getHeadingBlock(baseElement);
      newElement.setAttribute('level', lhe.getType(block));
      var itemref = '';
      if(block.hasAttribute('itemref')){
        itemref = block.getAttribute('itemref');
      }
      itemref += ' ' + newElement.id;
      block.setAttribute('itemref', itemref);
    }
    baseElement.hasAttribute('itemref')
		lhe.setType(newElement, tag);
		if(lhe.schema[tag].template){
			lhe.schema[tag].template(newElement, baseElement, lhe);
		}
    if(newElement.innerHTML.length == 0){
			newElement.innerHTML = '&nbsp;';
      newElement.setAttribute('empty', 'true');
		}
		return newElement;
	};
	this.setHeading = function(type){
		console.log("setHeading()");
		lhe.setType(lhe.currentBlock, type);
		lhe.transform(lhe.currentBlock, type);
		//renumber('[itemtype='+type+']', '[itemtype=enum]');
		lhe.updateBreadcrumb();
	};
	this.initHeadings = function(){
		var options = [];
		for(var key in this.schema){
			if(schema[key].type=='heading'){
				options.push('<li><a onclick="editor.setHeading(\''+key+'\');">' + key.toUpperCase() +'</a></li>');
			}
		}
		document.getElementById('heading-options').innerHTML = options.join('');
	};
	(this.init = function(){
		lhe.initHeadings();
		lhe.initEvents();
		lhe.initNodes();
		lhe.setFirstNode();
	})();
};
var legalHub = { tools: {
  nextNumber: function(element, currentValue){
    var value = element.innerHTML;
    var patt = /[A-Za-z0-9]+/;
    var tmpString = value.split('').reverse().join('');
	var firstMatch = patt.exec(tmpString);
	if(firstMatch){
		var match = /[A-Za-z]+/.exec('' + firstMatch);
		if(match){
			//letters
			if(currentValue){
				match = currentValue;
			}
			var newValue = String.fromCharCode(('' + match).charCodeAt(0) + 1);
			element.innerHTML = ('' + tmpString.replace(patt, newValue)).split('').reverse().join('');
			return newValue;
		}else{
			// numbers
			if(currentValue){
				firstMatch = currentValue;
			}else{
				firstMatch = ('' + firstMatch).split('').reverse().join('');
			}
			firstMatch++;
			var newValue = ('' + firstMatch).split('').reverse().join('');
			element.innerHTML = ('' + tmpString.replace(patt, newValue)).split('').reverse().join('');
			return newValue;
		}
	}
	return null;
  },
  isNodeSelected: function(element){
  	var sel = window.getSelection();
  	return sel.containsNode(element, false);
  },
  setCaretPosition: function(element, caretPos) {
    if(element != null) {
		if(document.createRange){
			var range = document.createRange();
			if(caretPos == undefined){
				range.selectNode(element);
			}else{
				range.setStartBefore(element);
				range.setEnd(element, caretPos);
			}
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}else if(element.createTextRange) {
            var range = element.createTextRange();
            range.move('character', caretPos);
            range.select();
        }
        else {
            if(element.selectionStart) {
                element.focus();
                element.setSelectionRange(caretPos, caretPos);
            }
            else
                element.focus();
        }
    }
  },
  getTextNode: function(element, acceptEmpty){
  	if(element.nodeType == 3){
  		if(!!acceptEmpty){
  			return element;
  		}else if(element.data.trim().length>0){
  			return element;
  		}
  	}
  	for(var it=0; it<element.childNodes.length; it++){
  		var node = this.getTextNode(element.childNodes[it], acceptEmpty);
  		if(node){
  			return node;
  		}
  	}
  },
  guid: function() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}}
