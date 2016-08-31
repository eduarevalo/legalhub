/*
	LEGALHUB Editor
*/

var legalHubEditor = function(el){
	var lhe = this;
	this.ie = (typeof document.selection != "undefined" && document.selection.type != "Control") && true;
	this.w3 = (typeof window.getSelection != "undefined") && true;
	this.element = el;
	this.setElement = function(el){
		this.element = el;
		this.init();
	}
	this.showLineNumbers = false;
	this.lineNumbersElement;
	this.schema = {};
	this.minNLPScore = 0.8;
	this.trackingChangesMode = false;
	this.setSchema = function(schema){
		this.schema = schema || {};
	}
	this.isSchemaLess = function(){
		return Object.keys(this.schema).length === 0;
	}
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
		var newElement = lhe.newElement(context.tag, true);
		if(lhe.trackingChangesMode || lhe.isContextualTrackingChanges()){
			lhe.addTrackingAttributes(newElement, 'add');
		}
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
			var textContent = lhe.getTextContent(lhe.currentNode.childNodes[0]);
			var prefix = textContent.substring(0, context.start);
			var suffix = textContent.substring(context.start);
			lhe.currentNode.replaceChild(document.createTextNode(prefix + newData + suffix), lhe.currentNode.childNodes[0]);
		}
	};

	this.setBlockFormat = function(style){
		lhe.getBlock(lhe.currentNode).className = style;
	};

	this.setFormat = function(style){
		var span = document.createElement("span");
		span.className = style;
		span.setAttribute('type', 'format');
		return lhe.surroundSelection(span);
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

	this.isContextualTrackingChanges = function(node){
		var contextNode = node;
		if(node == undefined){
			contextNode = lhe.currentNode;
		}
		var parentNode = contextNode;
		while(parentNode != lhe.element){
			var type = lhe.getType(parentNode);
			if(type !== null && lhe.schema[type] && lhe.schema[type].trackChanges === true){
				return true;
			}
			parentNode = parentNode.parentNode;
		}
		return false;
	}

	this.addTrackingAttributes = function(node, type){
		node.setAttribute('track', type);
	}

	this.getDeletedElement = function(innerHTML){
		var span = document.createElement("span");
		lhe.addTrackingAttributes(span, 'del');
		if(innerHTML){
			span.innerHTML = innerHTML;
		}
		return span;
	};

	this.getAddedElement = function(innerHTML){
		var span = document.createElement("span");
		lhe.addTrackingAttributes(span, 'add');
		if(innerHTML){
			span.innerHTML = innerHTML;
		}
		return span;
	};

	this.isTrackingNode = function(node, type){
		var parentNode = node.nodeType == 3 ? node.parentNode : node;
		while(parentNode != lhe.element){
			if(parentNode.hasAttribute('track') && (type == undefined || parentNode.getAttribute('track') == type)){
				return true;
			}
			parentNode = parentNode.parentNode;
		}
		return false;
	}

	this.isAddTrackingNode = function(node){
		return lhe.isTrackingNode(node, 'add');
	}

	this.isDeleteTrackingNode = function(node){
		return lhe.isTrackingNode(node, 'add');
	}

	this.trackAddChanges = function(context){
		var textNode = lhe.getSelectionAnchor();
		if(lhe.isAddTrackingNode(textNode)){
			return true;
		}
		if(lhe.trackingChangesMode || lhe.isContextualTrackingChanges()){
			var newData = lhe.getAddedElement(String.fromCharCode(event.keyCode));
			var textContent = lhe.getTextContent(textNode);
			var prefix = document.createTextNode(textContent.substring(0, context.start));
			var suffix = document.createTextNode(textContent.substring(context.start));
			var parentNode = textNode.parentNode;
			parentNode.replaceChild(suffix, textNode);
			parentNode.insertBefore(newData, suffix);
			parentNode.insertBefore(prefix, newData);
			lhe.setCaretPosition(newData, 1);
			return false;
		}
		return true;
	}

	this.trackDeleteChanges = function(context, foreward){
		var textNode = lhe.getSelectionAnchor();
		if(lhe.isAddTrackingNode(textNode)){
			return true;
		}
		if(lhe.trackingChangesMode || lhe.isContextualTrackingChanges()){
			console.log(context.start);
			var textContent = lhe.getTextContent(textNode);
			var newData = lhe.getDeletedElement(foreward ? textContent.substring(context.start, context.start+1) : textContent.substring(context.start-1, context.start));
			var prefix = document.createTextNode(textContent.substring(0, context.start + (foreward ? 0 : -1)));
			var suffix = document.createTextNode(textContent.substring(context.start + (foreward ? 1 : 0)));
			var parentNode = textNode.parentNode;
			parentNode.replaceChild(suffix, textNode);
			parentNode.insertBefore(newData, suffix);
			parentNode.insertBefore(prefix, newData);
			if(foreward){
				lhe.setCaretPosition(suffix, 0);
			}else{
				lhe.setCaretPosition(prefix, 'end');
			}
			return false;
		}
		return true;
	}

	this.deleteInSibling = function(context, node, sibling, foreward){
		var textNode = lhe.getTextNode(sibling);
		var textContent = lhe.getTextContent(textNode);
		var newText = document.createTextNode(foreward ? textContent.substring(1) : textContent.substring(textContent.length - 1));
		textNode.parentNode.replaceChild(newText, textNode);
		var charToAppend = foreward ? textContent.charAt(0) : textContent.charAt(textContent.length);
		node.innerHTML = foreward ? node.innerHTML + charToAppend : charToAppend + node.innerHTML;
		lhe.setCaretPosition(newText, foreward ? 0 : 'end');
		return false;
	}

	this.deleteOrJoin = function(context){
		console.log('deleteOrJoin()');
		// false for preventing progpagete actions
		var continues = lhe.deleteEmptyNode(context);
		if(continues){
			if(context.position == 'selection'){
				if(lhe.trackingChangesMode || lhe.isContextualTrackingChanges()){
					return lhe.surroundSelection(lhe.getDeletedElement());
				}
			}else{
				// Deletes backward
				if(event.keyCode == 8 && context.position == 'start'){
					if(lhe.isTrackingNode(lhe.currentNode)){

					}else if(context.container == 'block'){
						return lhe.joinBlocks(lhe.getPreviousBlock(lhe.currentNode), lhe.getBlock(lhe.currentNode));
					}
				// Deletes foreward
				}else if(event.keyCode == 46 && context.position == 'end'){
					if(lhe.isTrackingNode(lhe.currentNode)){
						return lhe.deleteInSibling(context, lhe.currentNode, lhe.currentNode.nextSibling, true);
					}else if(context.container == 'block'){
						return lhe.joinBlocks(lhe.getBlock(lhe.currentNode), lhe.getNextBlock(lhe.currentNode));
					}
				}else{
					return lhe.trackDeleteChanges(context, event.keyCode == 46);
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
			lhe.unsetItemRef(master, node.id);
		}
		node.parentElement.removeChild(node);
	};
	this.isEmpty = function(node){
		return node.hasAttribute('empty');
	};
	this.deleteEmptyNode = function(context){
		if(lhe.isEmpty(lhe.currentNode)){
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

	this.newDocument = function(){
		var node = lhe.newElement(lhe.config.container.elements[0]);
		var paragraph = lhe.newElement(lhe.config.block.elements[0], true);
		node.appendChild(paragraph);
		return node;
	}

	this.newTable = function(rows, cols, header){
		var table = document.createElement('table');
		lhe.getId(table);
		for(var it=0;it<rows;it++){
			if(header && it==0){
				var th = document.createElement('tr');
				for(var it2=0; it2<cols;it2++){
					th.appendChild(lhe.newElement('th', true));
				}
				table.appendChild(th);
			}
			var tr = document.createElement('tr');
			for(var it2=0; it2<cols;it2++){
				tr.appendChild(lhe.newElement('td', true));
			}
			table.appendChild(tr);
		}
		return table;
	}

	this.newElement = function(tag, emptyOrHtml){
		var newElement = document.createElement(tag);
		lhe.getId(newElement);
		if(emptyOrHtml != undefined){
			if(emptyOrHtml === true){
				lhe.setEmptyNodeAttributes(newElement);
			}else if(emptyOrHtml !== false){
				newElement.innerHTML = emptyOrHtml;
			}
		}
		return newElement;
	};

	this.newFloatingElement = function(type){
		var element = document.createElement('div');
		element.setAttribute('float', true);
		element.setAttribute('type', type);
		return element;
	}

	this.newElementByType = function(type, emptyOrHtml){
		var element = lhe.newElement(lhe.schema[type].tag ? lhe.schema[type].tag : (lhe.schema[type].type ? lhe.config[lhe.schema[type].type].elements[0] : lhe.config.block.elements[0]), emptyOrHtml);
		lhe.setType(type, element);
		return element;
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
	this.nestBlock = function(p1, p2){

		var currentNode = lhe.currentNode, direction;
		if(p1.nodeType == 1){
			currentNode = p1;
			direction = p2;
		}else{
			direction = event.shiftKey ? -1 : 1;
		}

		var currentLevel = lhe.getBlockLevel(currentNode);
		var newLevel =  currentLevel + direction;

		switch(direction){

			// nesting
			case 1:

				var previousBlock = lhe.getPreviousBlock(currentNode);

				if(previousBlock){
					var previousBlockLevel = lhe.getBlockLevel(previousBlock);

					// Here we force to keep inmediatly nested elements
					if(previousBlockLevel + direction != currentLevel){
						if(currentLevel != previousBlockLevel){
							previousBlock = lhe.getPreviousBlock(currentNode, currentLevel);
						}

						var currentId = lhe.getId(currentNode);
						// Here we take off the old references
						var oldParent = lhe.element.querySelector("[itemref*='" + currentId + "']");
						if(oldParent){
							lhe.unsetItemRef(oldParent, currentId);
						}
						// Here we tie up the new structure
						lhe.setItemRef(previousBlock, currentId);
						lhe.setBlockLevel(currentNode, newLevel);
						// We keep the hierarchy linked to the currentElement
						lhe.updateChildrenLevels(currentNode, direction);
					}
				}
				break;

			// un-nesting
			case -1:

				var currentParent = lhe.element.querySelector("[itemref*='" + lhe.getId(currentNode) + "']");

				if(currentParent){

					var currentId = lhe.getId(currentNode);
					// Here we take off the old references
					lhe.unsetItemRef(currentParent, currentId);

					var newParent = lhe.element.querySelector("[itemref*='" + lhe.getId(currentParent) + "']");
					if(newParent){
						lhe.setItemRef(newParent, currentId);
					}

					lhe.setBlockLevel(currentNode, newLevel);
					lhe.updateChildrenLevels(currentNode, direction);

					// Updates following siblings reference
					var nodes = lhe.getFollowingBlocks(currentNode, currentLevel);

					if(nodes.length>0 && currentParent.hasAttribute('itemref')){
						var refs = currentParent.getAttribute('itemref');
						nodes.forEach(function(node){
							var id = lhe.getId(node);
							refs = refs.replace(id, '');
							lhe.setItemRef(currentNode, id);
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

	this.setItemRef = function(element, id, unset){
		if(id && id.nodeType == 1){
			id = id.id;
		}
		var itemref = '';
		if(element.hasAttribute('itemref')){
			itemref = element.getAttribute('itemref').trim();
		}
		if(unset){
			itemref = itemref.replace(id, '');
		}else{
			itemref = id + ' ' + itemref;
		}
		element.setAttribute('itemref', itemref);
	};

	this.unsetItemRef = function(element, id){
		return lhe.setItemRef(element, id, true);
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

				element = lhe.getTextNode(element);
				element.parentNode.focus();
				if(startPos == 'end'){
					startPos = element.length;
				}
				var caret = startPos;
				var range = document.createRange();
				/*if(caret == 0){
					range.setStartBefore(element);
				}else{*/
					range.setStart(element, caret);
					range.setEnd(element, caret);
				//}
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
			elements: ['section', 'div', 'table', 'tr', 'th', 'td']
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
						46: lhe.deleteOrJoin,
						'a#': lhe.trackAddChanges
					}
				}
			}
		},
		inline : {
			elements: ['span'],
			events: {
				'on': {
					'keydown':{
						/*13:{
							'start': lhe.suggestBefore,
							'middle': lhe.split,
							'end': lhe.suggestAfter
						}*/
						// BACKSPACE
						8: lhe.deleteOrJoin,
						// DELETE
						46: lhe.deleteOrJoin,
					}
				}
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
	this.triggerEvent = function(context){
		var type = context.type;
		var continues = lhe.triggerCoreEvent('before', context);
		if(type
			&& lhe.schema[type]
				&& lhe.schema[type].before
					&& lhe.schema[type].before[context.eventName]
						&& lhe.schema[type].before[context.eventName][context.keyCode]){

			if(typeof lhe.schema[type].before[context.eventName][context.keyCode] === 'function'){
				continues = lhe.schema[type].before[context.eventName][context.keyCode](context, lhe);
			}else if(lhe.schema[type].before[context.eventName][context.keyCode][context.position]){
				continues = lhe.schema[type].before[context.eventName][context.keyCode][context.position](context, lhe);
			}
		}
		if(continues){
			if(type
				&& lhe.schema[type]
					&& lhe.schema[type].on
						&& lhe.schema[type].on[context.eventName]
							&& lhe.schema[type].on[context.eventName][context.keyCode]
								&& lhe.schema[type].on[context.eventName][context.keyCode][context.position]){
				continues = lhe.schema[type].on[context.eventName][context.keyCode][context.position](context, lhe);
			}else{
				continues = lhe.triggerCoreEvent('on', context);
			}
			if(continues
				&& type
					&& lhe.schema[type]
						&& lhe.schema[type].after
							&& lhe.schema[type].after[context.eventName]
								&& lhe.schema[type].after[context.eventName][context.keyCode]
									&& lhe.schema[type].after[context.eventName][context.keyCode][context.position]){
				continues = lhe.schema[type].after[context.eventName][context.keyCode][context.position](context, lhe);

			}
		}
		if(continues){
			continues = lhe.triggerCoreEvent('after', context);
		}
		return continues;
	};
	/*
		Core events trigger
	*/
	this.triggerCoreEvent = function(state, context){
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
	this.getEventContext = function(event, eventName, node){
		var context = lhe.getCaretContext();
		context.eventName = eventName;
		context.keyCode = event.which || event.keyCode;
		lhe.setContextType(context, node);
		if(event.keyCode == 32 // Space
			|| (event.keyCode >= 48 && event.keyCode <= 90) // a-Z
				|| (event.keyCode >= 96 && event.keyCode <= 111) // Numbers
					|| (event.keyCode >= 186 && event.keyCode <= 222)) { // Symbols
		  context.keyCode = 'a#';
		}

		// Schema Update Actions
		if(!lhe.isSchemaLess()){
			lhe.setCurrentLevelTypes();
		}

		return context;
	}
	this.setContextType = function(context, node){
		var contextNode = node;
		if(node == undefined){
			contextNode = lhe.currentNode;
		}
		context.tag = contextNode ? contextNode.tagName.toLowerCase() : '';
		if(context.tag != ''){
			if(lhe.config.container.elements.indexOf(context.tag)>=0){
				context.container = 'container';
			}else if(lhe.config.block.elements.indexOf(context.tag)>=0){
				context.container = 'block';
			}else{
				context.container = 'inline';
			}
		}
		context.type = contextNode ? lhe.getType(contextNode) : null;
	}


	this.getTextContent = function(node){
		return node.textContent;
	}

	this.getTextNode = function(node){
		while(node.nodeType != 3){
			node = node.firstChild;
		}
		return node;
	}
	/*
		Initialize editor element events.
		Instead of setting many events listeners for each action.
		We have one dynamic and hierarchical triggering method.
	*/
	this.initEvents = function(){

		var supportedCoreEvents = [/*'keyup',*/ 'keydown'/*, 'mousedown', 'mouseup'/*/, 'click'];

		supportedCoreEvents.forEach(function(eventName){
			lhe.events[eventName] = lhe.element.addEventListener(eventName, function(event){
				lhe.currentNode = lhe.getSelectionNode();
				console.log('change scope');
				var context = lhe.getEventContext(event, eventName);
				//console.log(context);
				// Allow some browser behaviors
				// 8 Backspace
				// 33..36: PageUp, PageDown, End, Home
				// 37..40: Left, Up, Right, Down Arrows
				// 46 Delete
				var dontPrevent = [8, 33, 34, 35, 36, 37, 38, 39, 40, 46].indexOf(context.keyCode)>=0 || context.keyCode == 'a#';
				if(!dontPrevent){
					event.preventDefault();
				}
				if(!lhe.triggerEvent(context)){
					event.preventDefault();
				}else{
					dontPrevent = true;
					var parentNode = lhe.currentNode.parentNode;
					while(parentNode != lhe.element && dontPrevent){
						lhe.setContextType(context, parentNode);
						if(context.type !== null){
							dontPrevent = lhe.triggerEvent(context);
						}
						parentNode = parentNode.parentNode;
					}
					if(!dontPrevent){
						event.preventDefault();
					}
				}
			});
		});
		/*
		 This evens is triggered inmediatly after keyup:
		 Purposes:
			- Empty nodes corrections.
			- Nlp methods
		*/
		lhe.events['core.keyup'] = lhe.element.addEventListener('keyup', function(event){
			var context = lhe.getEventContext(event);
			// Empty nodes
			if(context.keyCode == 'a#' || context.keyCode == 8 || context.keyCode == 46){
				lhe.setEmptyNodeAttributes(lhe.currentNode);
			}
			// Suggest Markup. Only on space keyCode event.
			if(event.keyCode == 32){
				if(context.type == null){
					var scores = {};
					var textNode;
					for(var key in lhe.schema){
						if(lhe.schema[key].nlp && lhe.schema[key].nlp.tagging){
							if(textNode == undefined){
								textNode = lhe.getTextContent(lhe.currentNode);
							}
							if(lhe.validateNLPTriggers(lhe.schema[key].nlp.tagging.triggers, textNode)){
								scores[key] = lhe.schema[key].nlp.tagging.score ? lhe.schema[key].nlp.tagging.score(context, textNode) : lhe.minNLPScore;
							}
						}
					}
					if(Object.keys(scores).length > 0){
						lhe.suggestMarkup(scores);
					}
				}else if(lhe.schema[context.type].nlp && lhe.schema[context.type].nlp.processors){
					var textNode;
					for(var it=0; it<lhe.schema[context.type].nlp.processors.length; it++){
						var processor = lhe.schema[context.type].nlp.processors[it];
						if(textNode == undefined){
							textNode = lhe.getTextContent(lhe.currentNode);
						}
						if(!lhe.avoidNLPProcessor(lhe.currentNode, processor.name)){
							if(lhe.validateNLPTriggers(processor.triggers, textNode)){
								lhe.setNLPProcessor(lhe.currentNode, processor.name);
								processor.fn(context, textNode, lhe);
							}
						}
					}
				}
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
			lhe.setCaretPosition(element, 'end');
		}
	}

	this.setNLPProcessor = function(node, name){
		var processors = [];
		if(node.hasAttribute('processors')){
			processors = node.getAttribute('processors').trim().split(' ');
		}
		processors.push(name);
		node.setAttribute('processors', processors.join(' '));
	}

	this.avoidNLPProcessor = function(node, name){
		var processors = [];
		if(node.hasAttribute('processors')){
			processors = node.getAttribute('processors').trim().split(' ');
		}
		return processors.indexOf(name) > -1;
	}

	this.validateNLPTriggers = function(triggers, text){
		for(var key in triggers){
			switch(key){
				case 'wordsCountMax':
					if(text.trim().split(' ').length > triggers[key]){
						return false;
					}
					break;
				case 'wordsCountMin':
					if(text.trim().split(' ').length < triggers[key]){
						return false;
					}
					break;
				case 'expression':
					if(!triggers[key].test(text)){
						return false;
					}
					break;
				default:
					return false;
			}
		}
		return true;
	};

	this.suggestMarkup = function(scores){
		if(Object.keys(scores).length == 1){
			var type = Object.keys(scores)[0];
			if(scores[type] >= lhe.minNLPScore){
				lhe.setType(type);
			}
		}else{
				// Multiple options
		}
	};

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
			var sel = window.getSelection && window.getSelection();
			if (sel) {
				var range = sel.getRangeAt(0);
				var preCaretRange = range.cloneRange();
				preCaretRange.selectNodeContents(lhe.getSelectionAnchor());
				caretOffsetEnd = preCaretRange.toString().length;
				preCaretRange.setEnd(range.endContainer, range.endOffset);
				caretOffsetStart = preCaretRange.toString().replace(/\u200C/, '').length;
			}
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


	this.isInline = function(node){
		return lhe.config.inline.elements.indexOf(node.tagName.toLowerCase())>=0;
	}
	this.isBlock = function(node){
		return lhe.config.block.elements.indexOf(node.tagName.toLowerCase())>=0;
	}
	this.isContainer = function(node){
		return lhe.config.container.elements.indexOf(node.tagName.toLowerCase())>=0;
	}
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
		if(element == lhe.element){
			return true;
		}
		var sibling = element;
		while(sibling = sibling.previousSibling){
			if(lhe.config.block.elements.indexOf(sibling.tagName.toLowerCase()) > -1
				&& (level == undefined || level == lhe.getBlockLevel(sibling))){
					return sibling;
			}
		}
		return lhe.getPreviousBlock(element.parentNode, level);
	}

	this.getContainer = function(element){
		for(var it=0; it<lhe.config.container.elements.length; it++){
			if(element.tagName.toLowerCase() == lhe.config.block.elements[it]){
				return element;
			}
			var node = element.closest(lhe.config.container.elements[it]);
			if(node){
				return node;
			}
		}
	};

	/*this.setTagPosition = function(event){
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
	};*/


	/*
		SchemaBased Methods

	*/
	this.setCurrentLevelTypes = function(){
		var optionsDropDown = document.getElementById('current-level-options');
		if(optionsDropDown){
			var currentLevel = lhe.getBlockLevel(lhe.currentNode);
			var options = [];
			for(var key in lhe.schema){
				if(lhe.schema[key].level == undefined || lhe.schema[key].level == currentLevel){
					options.push('<li><a onclick="editor.setBlockType(\''+key+'\');">' + key.toUpperCase() +'</a></li>');
				}
			}
			optionsDropDown.innerHTML = options.join('');
		}
	};
	this.setBlockType = function(type, node){
		if(node == undefined){
			node = lhe.currentNode;
		}
		return lhe.setType(type, lhe.getBlock(node));
	}
	/*
		Set a new schema type
	*/
	this.setType = function(type, node){
		if(node == undefined){
			node = lhe.currentNode;
		}
		lhe.setElementType(node, type);
		if(lhe.schema[type].transform){
			return lhe.schema[type].transform(lhe);
		}
		return true;
	};
	/*
		Set type attribute
	*/
	this.setElementType = function(element, type){
		if(element){
			element.setAttribute('itemtype', type);
		}
	};
	/*
		Get Type attribute
	*/
	this.getType = function(element){
		return element && element.hasAttribute('itemtype') ? element.getAttribute('itemtype') : null;
	};

	this.getChildByType = function(node, type){
		return node.querySelector("[itemtype='"+type+"']");
	}

	this.getPreviousByType = function(element, type){
		if(element == lhe.element){
			return null;
		}
		if(lhe.getType(element) == type){
				return element;
		}
		var sibling = element;
		while(sibling = sibling.previousSibling){
			if(lhe.getType(sibling) == type){
				return sibling;
			}
		}
		return lhe.getPreviousByType(element.parentNode, type);
	}

	this.applyTemplate = function(node, template){
		var options = '';
		for(var i=0; i<template.length;i++){
			options += '<span itemtype="' + template[i]+ '" empty="true">'+String.fromCodePoint(0x200C)+'</span>';
		}
		node.innerHTML = options;
		return true;
	}
	this.insertBlockAfter = function(newNode){
		var currentBlock = lhe.getBlock(lhe.currentNode);
		if(currentBlock.nextSibling){
			currentBlock.parentNode.insertBefore(newNode, currentBlock.nextSibling);
		}else{
			currentBlock.parentNode.appendChild(newNode);
		}
	};
	this.insertElementAfter = function(newNode, containerType){
		var anchorElement = lhe.currentNode;
		if(containerType == 'block' || lhe.isBlock(newNode)){
			anchorElement = lhe.getBlock(lhe.currentNode);
		}else if(containerType == 'container' || lhe.isContainer(newNode)){
			anchorElement = lhe.getContainer(lhe.currentNode);
		}
		if(anchorElement.nextSibling){
			anchorElement.parentNode.insertBefore(newNode, anchorElement.nextSibling);
		}else{
			anchorElement.parentNode.appendChild(newNode);
		}
	};
	this.insertTableAfter = function(rows, cols, header){
		lhe.insertBlockAfter(lhe.newTable(rows, cols, header));
	}

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

  this.insidetrackingChangesBlock = function(){
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

	this.getHtml = function(clean){
		var content = lhe.element.innerHTML;
		if(clean){
			content = content.replace(/\u200C/, '');
		}
		return content;
	}

	/* Line numbers */
	this.initLineNumbersContainer = function(){
		if(lhe.lineNumbersElement == undefined){
			lhe.lineNumbersElement = lhe.newFloatingElement('lineNumbers');
			lhe.element.appendChild(lhe.lineNumbersElement);
		}
	}
	this.toggleLineNumbers = function(){
		lhe.initLineNumbersContainer();
		this.showLineNumbers = !this.showLineNumbers;
		if(this.showLineNumbers){
			lhe.refreshLineNumbers();
		}else{
			lhe.lineNumbersElement.innerHTML = '';
		}
	}
	this.refreshLineNumbers = function(){
		lhe.initLineNumbersContainer();
		lhe.lineNumbersElement.innerHTML = '';
		var lastPosition = 0;
		var lastNumber = 1;
		var elements = editor.element.querySelectorAll("span, p, th, td");
		for (var it2 = 0; it2 < elements.length; it2++) {

			if(!lhe.isEmpty(elements[it2])){

				var element = elements[it2];
				var divs = "";
				var lineHeight = parseInt($(element).css('line-height')),  divHeight = element.offsetHeight, lines = divHeight / lineHeight;
				if(element.tagName.toLowerCase() == 'span' || Math.floor(lines) == 1){
					var top = $(element).position().top;
					if(top > lastPosition){
						lastPosition = top;
						divs += '<div class="lineNumber" style="top:' + top + 'px;">' + lastNumber++ + '</div>';
					}
				}else{
					var blockOffset = $(element).position().top;
					for(var it=0; it<lines; it++){
						var top = blockOffset  + (lineHeight*it);
						if(top > lastPosition){
							lastPosition = top;
							divs += '<div class="lineNumber" style="top:' + top + 'px;">' + lastNumber++ + '</div>';
						}
					}
				}
				lhe.lineNumbersElement.innerHTML += divs;

			}
		}
	}

	/*
		Initialize actions
	*/
	if(lhe.element){
		lhe.initEvents();
	}

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

var editorConfig = {
  style: 'default'
};
function init(){
  setPageStyle();
}
function setPageStyle(style){
  if(style){
    editorConfig.style = style;
  }
  $('link[href*="editor/css"]').attr('disabled', 'disabled');
  $('link[href*="editor/css/common"]').removeAttr('disabled');
  $('link[href*="editor/css/legislative"]').removeAttr('disabled');
  $('link[href*="editor/css/'+ editorConfig.style+'"]').removeAttr('disabled');
	if(editor)
		editor.refreshLineNumbers();
}
