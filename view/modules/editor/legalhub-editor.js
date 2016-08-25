/*
	LEGALHUB Editor
*/

var legalHubEditor = function(el, schema){
	var lhe = this;
	this.ie = (typeof document.selection != "undefined" && document.selection.type != "Control") && true;
	this.w3 = (typeof window.getSelection != "undefined") && true;
	this.element = el;
	this.schema = schema;
	/*
		Transformation Methods
	*/

	this.split = function(context, editor){
		console.log(context);
		lhe.splitNode(lhe.getSelectionAnchor(), context.start, lhe.getBlock(lhe.currentNode));
		return false;
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
			var newData = String.fromCharCode(event.keyCode);
			var prefix = lhe.currentNode.childNodes[0].textContent.substring(0, context.start);
			var suffix = lhe.currentNode.childNodes[0].textContent.substring(context.start);
			lhe.currentNode.replaceChild(document.createTextNode(prefix + newData + suffix), lhe.currentNode.childNodes[0]);
		}
	};

	this.surroundSelection = function(surroundingElement){
		if (window.getSelection) {
			var sel = window.getSelection();
			if (sel.rangeCount) {
				var range = sel.getRangeAt(0).cloneRange();
				range.surroundContents(surroundingElement);
				sel.removeAllRanges();
				sel.addRange(range);
				return false;
			}
		}
		return true;
	}
	
	this.getDeletedElement = function(){
		var span = document.createElement("span");
		span.className = 'del';
		span.setAttribute('type', 'track');
		return span;
	};
	
	this.deleteOrJoin = function(context){
		// false for preventing progpagete actions
		var continues = lhe.deleteEmptyNode(context);
		if(continues){
			if(context.position == 'selection'){
				return lhe.surroundSelection(lhe.getDeletedElement());
			}else{
				// Deletes backward
				if(event.keyCode == 8 && context.position == 'start'){
					return lhe.joinBlocks(lhe.getPreviousBlock(lhe.currentNode), lhe.getBlock(lhe.currentNode));
				// Deletes foreward
				}else if(event.keyCode == 46 && context.position == 'end'){
					return lhe.joinBlocks(lhe.getBlock(lhe.currentNode), lhe.getNextBlock(lhe.currentNode));
				}
				
			}
		}
		return continues;
	};
	
	this.joinBlocks = function(nodeToKeep, nodeToAppend){
		// Transfer all children nodes
		for(var i=0; i<nodeToAppend.childNodes.length; i++){
			nodeToKeep.appendChild(nodeToAppend.childNodes[i]);
		}
		// Transfer all itemrefs
		if(nodeToAppend.hasAttribute('itemref')){
			var itemref = nodeToKeep.hasAttribute('itemref') ? nodeToKeep.getAttribute('itemref') : '';
			itemref += ' ' + nodeToAppend.getAttribute('itemref');
			nodeToKeep.setAttribute('itemref', itemref);
			var refs = itemref.split(' ');
			lhe.removeNode(nodeToAppend);
			for(var i=0; i<refs.length; i++){
				if(refs[i].length > 0){
					var child = document.getElementById(refs[i]);
					if(child){
						lhe.setBlockLevel(child, lhe.getBlockLevel(child) - 1);
						lhe.updateChildrenLevels(child, -1);
					}
				}
			}
		}
		return false;
	};
	
	this.removeNode = function(node){
		// Deletes all current references
		var master = lhe.element.querySelector("[itemref*='" + node.id + "']");
		if(master){
			lhe.unsetItemRef(master, node);
		}
		node.parentElement.removeChild(node);
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
		var newElement = document.createElement(tag);
		lhe.getId(newElement);
		lhe.setEmptyNodeAttributes(newElement);
		return newElement;
	};
	
	/*
		Get element id, if it is not defined, creates a new one.
		If collaboration mode is active, validate against the server is required.
	*/
	this.getId = function(element){
		if(!element.hasAttribute('id') || element.id != undefined){
			element.id = legalHub.tools.guid();
		}
		return element.id;
	};
	
	/*
		Nest block using metadata formats
	*/
	this.nestBlock = function(context){

		var direction = event.shiftKey ? -1 : 1;
		
		var currentLevel = lhe.getBlockLevel(lhe.currentNode);
		var newLevel =  currentLevel + direction;
		
		switch(direction){
		
			// nesting
			case 1:
			
				var previousBlock = lhe.getPreviousBlock(lhe.currentNode);
				
				if(previousBlock){
					var previousBlockLevel = lhe.getBlockLevel(previousBlock);
			
					// Here we force to keep inmediatly nested elements
					if(previousBlockLevel + direction != currentLevel){
						if(currentLevel != previousBlockLevel){
							previousBlock = lhe.getPreviousBlock(lhe.currentNode, currentLevel);
						}
						
						// Here we take off the old references
						var oldParent = lhe.element.querySelector("[itemref*='" + lhe.getId(lhe.currentNode) + "']");
						if(oldParent){
							lhe.unsetItemRef(oldParent, lhe.currentNode);
						}
						// Here we tie up the new structure
						lhe.setItemRef(previousBlock, lhe.currentNode);
						lhe.setBlockLevel(lhe.currentNode, newLevel);
						// We keep the hierarchy linked to the currentElement
						lhe.updateChildrenLevels(lhe.currentNode, direction);
					}
				}					
				break;
				
			// un-nesting
			case -1:
				
				var currentParent = lhe.element.querySelector("[itemref*='" + lhe.getId(lhe.currentNode) + "']");
				
				if(currentParent){
				
					// Here we take off the old references
					lhe.unsetItemRef(currentParent, lhe.currentNode);
					
					var newParent = lhe.element.querySelector("[itemref*='" + lhe.getId(currentParent) + "']");
					if(newParent){
						lhe.setItemRef(newParent, lhe.currentNode);
					}
					
					lhe.setBlockLevel(lhe.currentNode, newLevel);
					lhe.updateChildrenLevels(lhe.currentNode, direction);
					
					// Updates following siblings reference
					var nodes = lhe.getFollowingBlocks(lhe.currentNode, currentLevel);
					
					if(nodes.length>0 && currentParent.hasAttribute('itemref')){
						var refs = currentParent.getAttribute('itemref');
						nodes.forEach(function(node){ 
							refs = refs.replace(node.id, '');
							lhe.setItemRef(lhe.currentNode, node);
						});
						currentParent.setAttribute('itemref', refs.trim());
					}
				}
				break;
		}
	};
	
	this.updateChildrenLevels = function(element, direction){
		if(element.hasAttribute('itemref')){
			var refs = element.getAttribute('itemref').split(' ');
			for(var i=0; i<refs.length; i++){
				if(refs[i].length > 0){
					var child = document.getElementById(refs[i]);
					if(child){
						lhe.setBlockLevel(child, lhe.getBlockLevel(child) + direction);
						lhe.updateChildrenLevels(child, direction);
					}
				}
			}
		}
	};
	
	this.getFollowingBlocks = function(element, level){
		var nodes = [];
		var refNode = element;
		while(refNode = refNode.nextSibling){
			if(level == undefined){
				nodes.push(refNode);	
			}else{
				var refNodeLevel = lhe.getBlockLevel(refNode);
				if(refNodeLevel < level){
					return nodes;
				}else if(refNodeLevel == level){
					nodes.push(refNode);
				}
			}
			
		}
		return nodes;
	};

	this.setItemRef = function(element, childElement, unset){
		var itemref = '';
		if(element.hasAttribute('itemref')){
			itemref = element.getAttribute('itemref').trim();
		}
		if(unset){
			itemref = itemref.replace(lhe.getId(childElement), '');
		}else{
			itemref = lhe.getId(childElement) + ' ' + itemref;
		}
		element.setAttribute('itemref', itemref);
	};
	
	this.unsetItemRef = function(element, childElement){		
		return lhe.setItemRef(element, childElement, true);
	};
	
	this.getBlockLevel = function(element){
		if(element.hasAttribute('level')){
			return parseInt(element.getAttribute('level'));
		}
		return 0;
	};
	
	this.setBlockLevel = function(element, level){
		element.setAttribute('level', level);
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
	
	this.splitNode = function (node, offset, limit){
		// idea from http://jsbin.com/efegiz/2/edit?html,css,js,output
		var parent = limit.parentNode;
		var parentOffset = lhe.getNodeIndex(parent, limit);
	  
		var doc = node.ownerDocument;  
		var leftRange = doc.createRange();
		leftRange.setStart(parent, parentOffset);
		leftRange.setEnd(node, offset);
		var left = leftRange.extractContents();
		limit.id = undefined;
		if(limit.hasAttribute('level')){
			limit.removeAttribute('level');
		}
		lhe.getId(limit);
		parent.insertBefore(left, limit);
	};

	this.getNodeIndex = function(parent, node){
		var index = parent.childNodes.length;
		while (index--) {
			if (node === parent.childNodes[index]) {
				break;
			}
		}
		return index;
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
						// TAB
						9: {
							'start': lhe.nestBlock,
							'middle': lhe.insertChar,
							'end': lhe.insertChar
						},
						// ENTER
						13:{
							'start': lhe.suggestBefore,
							'middle': lhe.split,
							'end': lhe.suggestAfter
						},
						// BACKSPACE
						8: lhe.deleteOrJoin,
						// DELETE
						46: lhe.deleteOrJoin
					}
				}
			}
		},
		inline : {
			elements: ['span'],
			events: {
				/*'on': {
					'keydown':{
						13:{
							'start': lhe.suggestBefore,
							'middle': lhe.split,
							'end': lhe.suggestAfter
						}
					}
				}*/
			}
		}
	};
	
	/* Private members */
	this.events = {};
	this.currentNode;
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
		var context = lhe.getCaretContext();
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
				console.log(context);
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
		var nodeContent = element.innerHTML.replace(/<br>/, '').replace(/\u200C/, '');
		if(nodeContent.length == 0 || element.data == ""){
			element.innerHTML = String.fromCodePoint(0x200C);
			element.setAttribute('empty', 'true');
		}else if(element.hasAttribute('empty')){
			element.removeAttribute('empty');
			element.innerHTML = element.innerHTML.replace(/\u200C/, '');
			lhe.setCaretPosition(element, 1);
		}
	}
	
	this.getSelectedText = function() {
        var text = "";
        if (typeof window.getSelection != "undefined") {
            text = window.getSelection().toString();
        } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
            text = document.selection.createRange().text;
        }
        return text;
    }
	/*
		Identifies caret position and referencing points
	*/
	this.getCaretContext = function() {
		// Nice job: http://jsfiddle.net/stafamus/mzUt7/
		var caretOffsetStart = 0, caretOffsetEnd = 0, position = '';
		if (this.w3) {
			var range = window.getSelection().getRangeAt(0);
			var preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(lhe.getSelectionAnchor());
			caretOffsetEnd = preCaretRange.toString().length;
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			caretOffsetStart = preCaretRange.toString().length;
			
		} else if (this.ie) {
		
			var textRange = document.selection.createRange();
			var preCaretTextRange = document.body.createTextRange();
			preCaretTextRange.moveToElementText(lhe.getSelectionAnchor());
			caretOffsetEnd = preCaretTextRange.text.length;
			preCaretTextRange.setEndPoint("EndToEnd", textRange);
			caretOffsetStart = preCaretTextRange.text.length;
			
		}
		if(lhe.getSelectedText().length>0){
			position = 'selection';
		}else{
			switch(caretOffsetStart){
				case 0:
					position = 'start';
					break;
				case caretOffsetEnd:
					position = 'end';
					break;
				default: 
					position = 'middle';
			}
		}
		return {start: caretOffsetStart, end: caretOffsetEnd, position: position};
	};
	this.getSelectionAnchor = function(){
		return document.getSelection().anchorNode;
	}
	/*
		GetSelectionNode
	*/
	this.getSelectionNode = function() {
		var node = lhe.getSelectionAnchor();
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
			if(element.tagName.toLowerCase() == lhe.config.block.elements[it]){
				return element;
			}
			var node = element.closest(lhe.config.block.elements[it]);
			if(node){
			  return node;
			}
		}
	};
	/*
		Get Previous block
	*/
	this.getNextBlock = function(element, level){
		for(var it=0; it<lhe.config.block.elements.length; it++){
			var node = element.closest(lhe.config.block.elements[it]);
			if(node){
				var sibling = node;
				while(sibling = sibling.nextSibling){
					if(sibling.tagName.toLowerCase() == lhe.config.block.elements[it] 
						&& (level == undefined || level == lhe.getBlockLevel(sibling))){
						return sibling;
					}
				}
			}
		}
	}
	
	/*
		Get Previous block
	*/
	this.getPreviousBlock = function(element, level){
		for(var it=0; it<lhe.config.block.elements.length; it++){
			var node = element.closest(lhe.config.block.elements[it]);
			if(node){
				var sibling = node;
				while(sibling = sibling.previousSibling){
					if(sibling.tagName.toLowerCase() == lhe.config.block.elements[it] 
						&& (level == undefined || level == lhe.getBlockLevel(sibling))){
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
		//lhe.setFirstNode();
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
