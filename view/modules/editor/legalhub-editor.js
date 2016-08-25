/*
	LEGALHUB Editor
*/
var legalHubEditor = function(el, schema){
	var lhe = this;
	this.element = el;
	this.schema = schema;
	/*
		Transformation Methods
	*/

	this.split = function(context, editor){
		//console.log(context);
	};

	this.suggest = function(context, direction){
		if(context.tag == '' || lhe.currentNode == undefined){
			return false;
		}
		var newElement = lhe.newElement(context.tag);
		if(direction == 'before'){
			lhe.currentNode.parentNode.insertBefore(newElement, lhe.currentNode);
		}else{
			if(lhe.currentNode.nextSibling){
				lhe.currentNode.parentNode.insertBefore(newElement, lhe.currentNode.nextSibling);
			}else{
				lhe.currentNode.parentNode.appendChild(newElement);
			}
			lhe.setCaretPosition(newElement, 1);
		}
		return newElement;
	};

	this.suggestBefore = function(context){
		lhe.suggest(context, 'before');
	};

	this.suggestAfter = function(context){
		lhe.suggest(context, 'after');
	};

	this.copy = function(context, editor){
		//console.log(context);
	};

	this.insertChar = function(context){
		if(lhe.currentNode.childNodes.length == 1){
			var newData = String.fromCharCode(context.event.keyCode);
			var prefix = lhe.currentNode.childNodes[0].textContent.substring(0, context.start);
			var suffix = lhe.currentNode.childNodes[0].textContent.substring(context.start);
			lhe.currentNode.replaceChild(document.createTextNode(prefix + newData + suffix), lhe.currentNode.childNodes[0]);
		}
	};

	this.deleteEmptyNode = function(context){
		if(lhe.currentNode.hasAttribute('empty')){
			switch(context.keyCode){
				case 8:
					if(lhe.getFirstBlock() == lhe.currentNode){
						return false;
					}
					break;
				case 46:
					if(lhe.getLastBlock() == lhe.currentNode){
						return false;
					}
					break;
			}
			lhe.currentNode.parentNode.removeChild(lhe.currentNode);
			return false;
		}
		return true;
	};

	this.newElement = function(tag, baseElement, link){
		console.log('newElement() '+ tag);
		var newElement = document.createElement(tag);
		newElement.id = legalHub.tools.guid();
		if(link){
			/*var block = lhe.getHeadingBlock(baseElement);
			newElement.setAttribute('level', lhe.getType(block));
			var itemref = '';
			if(block.hasAttribute('itemref')){
				itemref = block.getAttribute('itemref');
			}
			itemref += ' ' + newElement.id;
			block.setAttribute('itemref', itemref);*/
		}
		//baseElement.hasAttribute('itemref')
		//lhe.setType(newElement, tag);
		/*if(lhe.schema[tag].template){
			lhe.schema[tag].template(newElement, baseElement, lhe);
		}*/
		lhe.setEmptyNodeAttributes(newElement);
		return newElement;
	};

	this.linkNodes = function(context){
		var direction = context.event.shiftKey ? -1 : 1;
		var previousBlock = lhe.getPreviousBlock(lhe.currentNode);
		lhe.setItemRef(previousBlock, lhe.currentNode, direction);
	};

	this.setItemRef = function(element, childElement, direction){
		if(!element.hasAttribute('level')){
			element.setAttribute('level', 0);
		}
		var newLevel = parseInt(element.getAttribute('level')) + direction;
		if(newLevel >= 0){
			childElement.setAttribute('level', newLevel);
			var itemref = '';
			if(element.hasAttribute('itemref')){
				itemref = element.getAttribute('itemref');
			}
			itemref += ' ' + childElement.id;
			element.setAttribute('itemref', itemref);
		}
	};

	this.setCaretPosition = function(element, startPos, endPos) {
		if(element != null) {
			if(document.createRange){

				var range = document.createRange();
				/*if(startPos == undefined){
					range.selectNode(element);
				}else{
					range.setStartBefore(element);
					if(endPos != undefined){
						range.setEnd(element, startPos);
					}
				}*/
				range.setStartAfter(element.childNodes[0]);
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);

			}else if(element.createTextRange) {

				var range = element.createTextRange();
				range.move('character', startPos);
				range.select();

			}else{
				if(element.selectionStart){
					element.focus();
					element.setSelectionRange(startPos, endPos);
				}else{
					element.focus();
				}
			}
		}
	};

	/*
		Core config / Schema-less editing
	*/
	this.config = {
		container: {
			elements: ['section', 'table', 'blockquote']
		},
		block : {
			elements: ['p'],
			events: {
				'on': {
					'keydown':{
						9: {
							'start': lhe.linkNodes,
							'middle': lhe.insertChar,
							'end': lhe.insertChar
						},
						13:{
							'start': lhe.suggestBefore,
							'middle': lhe.split,
							'end': lhe.suggestAfter
						},
						8: lhe.deleteEmptyNode,
						46: lhe.deleteEmptyNode
					}
				}
			}
		},
		inline : {
			elements: ['span'],
			events: {
				'on': {
					'keydown':{
						13:{
							'start': lhe.suggestBefore,
							'middle': lhe.split,
							'end': lhe.suggestAfter
						}
					}
				}
			}
		}
	};
	/* Private members */
	this.events = {};
  this.firstNode;
	this.currentNode;
	this.newNode;
	this.currentBlock;
	this.currentContainer;
	/*
		Trigger events based on schemas
	*/
	this.triggerEvent = function(event, context){
		var continues = lhe.triggerCoreEvent('before', event, context);
		var type = context.type;
		if(lhe.schema.events
			&& lhe.schema.events[type]
				&& lhe.schema.events[type].before
					&& lhe.schema.events[type].before[context.eventName]
						&& lhe.schema.events[type].before[context.eventName][context.keyCode]){

			if(typeof lhe.schema.events[type].before[context.eventName][context.keyCode] === 'function'){
				continues = lhe.schema.events[type].before[context.eventName][context.keyCode](context, lhe);
			}else if(lhe.schema.events[type].before[context.eventName][context.keyCode][context.position]){
				continues = lhe.schema.events[type].before[context.eventName][context.keyCode][context.position](context, lhe);
			}
		}
		if(continues){
			if(lhe.schema.events
				&& lhe.schema.events[type]
					&& lhe.schema.events[type].on
						&& lhe.schema.events[type].on[context.eventName]
							&& lhe.schema.events[type].on[context.eventName][context.keyCode]
								&& lhe.schema.events[type].on[context.eventName][context.keyCode][context.position]){
				continues = lhe.schema.events[type].on[context.eventName][context.keyCode][context.position](context, lhe);
			}else{
				continues = lhe.triggerCoreEvent('on', event, context);
			}
			if(continues
				&& lhe.schema.events
					&& lhe.schema.events[type]
						&& lhe.schema.events[type].after
							&& lhe.schema.events[type].after[context.eventName]
								&& lhe.schema.events[type].after[context.eventName][context.keyCode]
									&& lhe.schema.events[type].after[context.eventName][context.keyCode][context.position]){
				continues = lhe.schema.events[type].after[context.eventName][context.keyCode][context.position](context, lhe);

			}
		}
		if(continues){
			continues = lhe.triggerCoreEvent('after', event, context);
		}
		return continues;
	};
	/*
		Core events trigger
	*/
	this.triggerCoreEvent = function(state, event, context){
		var tag = context.tag;
		for(var container in lhe.config){
			if(lhe.config[container].elements.indexOf(tag) >= 0
				&& lhe.config[container].events
					&& lhe.config[container].events[state]
						&& lhe.config[container].events[state][context.eventName]
							&& lhe.config[container].events[state][context.eventName][context.keyCode]){

				if(typeof lhe.config[container].events[state][context.eventName][context.keyCode] == 'function'){
					return lhe.config[container].events[state][context.eventName][context.keyCode](context, lhe);

				}else if(lhe.config[container].events[state][context.eventName][context.keyCode][context.position]){
					return lhe.config[container].events[state][context.eventName][context.keyCode][context.position](context, lhe);
				}
			}
		}
		return true;
	};
	/*
		Set only one time the event context;
	*/
	this.getEventContext = function(event, eventName){
		lhe.currentNode = lhe.getSelectionNode();
		var context = lhe.getCaretPosition();
		context.eventName = eventName;
		context.tag = lhe.currentNode ? lhe.currentNode.tagName.toLowerCase() : '';
		if(context.tag != ''){
			if(lhe.config.container.elements.indexOf(context.tag)>=0){
				context.container = 'container';
			}else if(lhe.config.block.elements.indexOf(context.tag)>=0){
				context.container = 'block';
			}else{
				context.container = 'inline';
			}
		}
		context.type = lhe.currentNode ? lhe.getType(lhe.currentNode) : '';
		context.event = event;
		context.keyCode = event.which || event.keyCode;

		if(event.keyCode == 32 // Space
			|| (event.keyCode >= 48 && event.keyCode <= 90) // a-Z
				|| (event.keyCode >= 96 && event.keyCode <= 111) // Numbers
					|| (event.keyCode >= 186 && event.keyCode <= 222)) { // Symbols
		  context.keyCode = 'a#';
		}
		return context;
	}
	/*
		Initialize editor element events.
		Instead of setting many events listeners for each action.
		We have one dynamic and hierarchical triggering method.
	*/
	this.initEvents = function(){

		var supportedCoreEvents = ['keyup', 'keydown'/*, 'mousedown', 'mouseup'/*, 'click'*/];

		supportedCoreEvents.forEach(function(eventName){
			lhe.events[eventName] = lhe.element.addEventListener(eventName, function(event){
				var context = lhe.getEventContext(event, eventName);
				// Allow some browser behaviors
				// 8 Backspace
				// 33..36: PageUp, PageDown, End, Home
				// 37..40: Left, Up, Right, Down Arrows
				// 46 Delete
				var dontPrevent = [8, 33, 34, 35, 36, 37, 38, 39, 40, 46].indexOf(context.keyCode)>=0 || context.keyCode == 'a#';
				if(!dontPrevent){
					event.preventDefault();
				}
				if(!lhe.triggerEvent(event, context)){
					event.preventDefault();
				}
			});
		});
		// This evens is triggered inmediatly after keyup for empty nodes corrections.
		lhe.events['core.keyup'] = lhe.element.addEventListener('keyup', function(event){
			var context = lhe.getEventContext(event);
			if(context.keyCode == 'a#' || context.keyCode == 8 || context.keyCode == 46){
				lhe.setEmptyNodeAttributes(lhe.currentNode);
			}
		});

	};
	/*
	Sets attributes for empty blocks
	*/
	this.setEmptyNodeAttributes = function(element){
		console.log('setEmptyNodeAttributes');
		var nodeContent = element.innerHTML.replace(/<br>/, '').replace(/\u200C/, '');
		console.log(nodeContent + ' -> ' + nodeContent.length);
		if(nodeContent.length == 0 || element.data == ""){
			element.innerHTML = '&zwnj;';
			element.setAttribute('empty', 'true');
		}else if(element.hasAttribute('empty')){
			element.removeAttribute('empty');
			element.innerHTML = element.innerHTML.replace(/&zwnj;/, '');
			lhe.setCaretPosition(element, 1);
		}
	}
	/*
		GetSelectionNode
	*/
	this.getSelectionNode = function() {
		var node = document.getSelection().anchorNode;
		if(node){
			return (node.nodeType == 3 ? node.parentNode : node);
		}
		return null;
	};
	/*
		Get first block node
	*/
	this.getFirstBlock = function(){
		for(var it=0; it<lhe.config.block.elements.length; it++){
			var node = lhe.element.querySelector(lhe.config.block.elements[it]);
			if(node){
				return node;
			}
		}
	};
	/*
	  Get last block node
	*/
	this.getLastBlock = function(){
		for(var it=0; it<lhe.config.block.elements.length; it++){
			var nodes = lhe.element.querySelectorAll(lhe.config.block.elements[it]);
			if(nodes.length>0){
				return nodes[nodes.length-1];
			}
		}
	}
	/*
		Get closest block
	*/
	this.getBlock = function(element){
		for(var it=0; it<lhe.config.block.elements.length; it++){
			var node = element.closest(lhe.config.block.elements[it]);
			if(node){
			  return node;
			}
		}
	};
	/*
		Get Previous block
	*/
	this.getPreviousBlock = function(element){
		for(var it=0; it<lhe.config.block.elements.length; it++){
			var node = element.closest(lhe.config.block.elements[it]);
			if(node){
				var sibling = node;
				while(sibling = sibling.previousSibling){
					if(sibling.tagName.toLowerCase() == lhe.config.block.elements[it]){
						return sibling;
					}
				}
			}
		}
	}

	this.setTagPosition = function(event){
		console.log("setTagPosition()");
		if(event && lhe.element != event.srcElement && lhe.element.contains(event.srcElement)){
			lhe.currentNode = event.srcElement;
		}else{
			lhe.currentNode = lhe.getSelectionNode();
		}
		if(lhe.currentNode){
			for(var it=0; it<lhe.config.block.length; it++){
				var tag = lhe.config.block[it];
				var element = lhe.currentNode.closest(tag);
				if(element){
					console.log("lhe.currentBlock");
					lhe.currentBlock = element;
				}
			}
			for(var it=0; it<lhe.config.container.length; it++){
				var tag = lhe.config.container[it];
				var element = lhe.currentNode.closest(tag);
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
		if(lhe.currentNode){
			newValue.push(lhe.currentNode.getAttribute('itemtype'));
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
  				if(range.startContainer.data == undefined || range.startContainer.data.trim().length == 0 || range.endOffset == 0){
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
			lhe.currentNode = newChildren[it];
		}
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
  var numbersLeftPosition = (editorConfig.style == 'paper' ? 50 : 60);
	var scrollTop = document.getElementById('editor').scrollTop + document.body.scrollTop;
	var lineHeight = parseInt($(element).css('line-height')),  divHeight = element.offsetHeight, lines = divHeight / lineHeight;
	if(element.tagName.toLowerCase() == 'span' || lines == 1){
	  var rects = element.getClientRects();
		for (var i = 0; i != rects.length; i++) {
		  var rect = rects[i];
		  var top = rect.top + scrollTop;
		  if(top > lastPosition){
			lastPosition = top;
			divs += '<div class="line-number" style="top:' + top + 'px;left:' + numbersLeftPosition +'px;">' + lastNumber++ + '</div>';
		  }
	  }
	}else{
		var blockOffset = element.getClientRects()[0].top;
		for(var it=0; it<lines; it++){
		  var top = blockOffset + scrollTop + (lineHeight*it);
		  if(top > lastPosition){
			lastPosition = top;
			divs += '<div class="line-number" style="top:' + top + 'px;left:' + numbersLeftPosition +'px;">' + lastNumber++ + '</div>';
		  }
 	   }
	}
	document.getElementById('line-numbers').innerHTML += divs;
}
