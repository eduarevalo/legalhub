var insertBlockQuote = function(){
	console.log('insertBlockQuote()');
	var newNode = document.createElement('blockquote');
	newNode.setAttribute('itemtype', 'quote');
	var quoted = ['<p itemtype="section" id="aaaa1" itemref="aaaa2">',
	'<span itemtype="enum">§ 5326.</span>',
	'<span itemtype="heading"> Records of certain domestic coin and currency transactions</span>',
	'</p>',
	'<p itemtype="subsection" id="aaaa2" itemref="aaaa3">',
	'<span itemtype="enum">(a)</span>',
	'<span itemtype="heading"> <inline class="small-caps">In General</inline>.—</span>',
	'</p>',
	'<p itemtype="text" id="aaaa3" level="subsection">',
	'If the Secretary of the Treasury finds, upon the Secretary’s own initiative or at the request of an appropriate Federal or State law enforcement official, that reasonable grounds exist for concluding that additional recordkeeping and reporting requirements are necessary to carry out the purposes of this subtitle and prevent evasions thereof, the Secretary may issue an order requiring any domestic financial institution or nonfinancial trade or business or group of domestic financial institutions or nonfinancial trades or businesses in a geographic area—',
	'</p>'];
	newNode.innerHTML = quoted.join('');
	editor.insertBlockAfter(newNode);
}
var split = function(params, source, editor){
	console.log('split');
	source.setAttribute('flag-split', '');
	var textToTransfer = source.innerHTML.substring(params.start);
	source.innerHTML = source.innerHTML.substring(0, params.start);
	var p = source.closest('p');
	var newNode = p.cloneNode(true);
	var newSource = newNode.querySelector('[flag-split]');
	var textNode = newNode.querySelector('[itemtype=text]');
	if(textNode){
		textNode.parentNode.removeChild(textNode);
	}
	newSource.removeAttribute('flag-split', '');
	newSource.innerHTML = textToTransfer.length == 0 ? '&#160;' : textToTransfer;
	if(p.nextSibling){
		p.parentNode.insertBefore(newNode, p.nextSibling);
	}else{
		p.parentNode.appendChild(newNode);
	}
	//legalHub.tools.nextNumber(newNode.querySelector('[itemtype=enum]'));
	renumber('[itemtype='+p.getAttribute('itemtype')+']', '[itemtype=enum]');
	legalHub.tools.setCaretPosition(newNode);
}
var join = function(params, source, editor){
	console.log('join');
}
var suggest = function(params, source, editor){
	console.log('suggest');
}
var renumber = function(levelSelector, elementSelector){
	var currentNumber = 0;
	var levels = document.getElementById('editor').querySelectorAll(levelSelector);
	for(var it=0; it<levels.length; it++){
		if(it==0){
			currentNumber = levels[it].querySelector(elementSelector).innerHTML;
		}else{
			currentNumber = legalHub.tools.nextNumber(levels[it].querySelector(elementSelector), currentNumber);
		}
	};
}
var transform = function(params, source, editor){
	var p = source.closest('p');
	if(editor.schema[p.getAttribute('itemtype')].next){
		p.setAttribute('itemtype', editor.schema[p.getAttribute('itemtype')].next[0]);
	}
}
var transformLevel = function(params, source, editor){
	var p = source.closest('p');
	if(p.getAttribute('itemtype') == 'section'){
		if(!p.querySelector('[itemtype=enum]')){
			var node = p.querySelector('[itemtype=header]');
			if(node){
				node.setAttribute('itemtype', 'text');
			}
		}
	}
}
var dummy = function(params, source, editor){
	console.log('dummy');
	return false;
}
var newEnum = function(element){
	element.innerHTML = '1. ';
}
var suggestBlockSibling = function(params, source, editor){
console.log("suggestBlockSibling");
	var currentTag = editor.getType(editor.currentBlock);
	var siblings = editor.schema[currentTag].siblings;
	if(siblings && siblings.length>0){
		var newNodeTag = siblings[0];
		var newNode = editor.newElement(newNodeTag, source, true);
		editor.insertBlockAfter(newNode);
		editor.currentTag = newNode;
		legalHub.tools.setCaretPosition(newNode, 0);
		return newNode;
	}
}
var recoverHeaderText =  function(newElement, baseElement, editor){
	var headerTextNode = baseElement.querySelector('[itemtype=header]');
	if(headerTextNode && headerTextNode.innerHTML.length>0){
		newElement.innerHTML = headerTextNode.innerHTML;
	}else if(baseElement.innerHTML.length>0){
		newElement.innerHTML = baseElement.innerHTML;
	}
}
var deleteSelection = function(params, source, editor){
	var newSpan = document.createElement('span');
	var textToCopy = source.innerHTML.substring(params.start, params.end);
	newSpan.innerHTML = textToCopy;
	newSpan.setAttribute('itemtype', 'del');
	var added = '';
	if(params.keyCode == 'az'){
		var newAddSpan = document.createElement('span');
		newAddSpan.setAttribute('itemtype', 'add');
		newAddSpan.innerHTML = String.fromCharCode(event.keyCode);
		added = newAddSpan.outerHTML;
	}
	source.innerHTML = source.innerHTML.substring(0, params.start) + newSpan.outerHTML + added + source.innerHTML.substring(params.end);
	return false;
};
var enterKey = 13;
var backspace = 8;
/*var schema = {
	'section': {
		type: 'container',
		tag: 'p',
		template: '',
		attrs: [],
		inside: ['enum', 'header', 'text'],
		next: ['subsection']
	},
	'enum': {
		type: 'inline',
		tag: 'span',
	},
	'header': {
		type: 'inline',
		tag: 'span'
	},
	'text': {
		type: 'inline',
		tag: 'span'
	}
};*/
/*var schemaEventsConfig = {
	'section': {
		'keydown': {
			// ENTER
			13: {
				start: suggest,
				end: suggest,
				middle: split
			},
			// BACKSPACE
			8: {
				start: join
			},
			// TAB
			9: {
				select: transform
			}
		}
	},
	'header': {
		'keydown': {
			// ENTER
			13: {
				start: suggest,
				end: suggest,
				middle: split
			},
			// BACKSPACE
			8: {
				start: join
			}
		},
		'keyup': {
			// BACKSPACE
			8: {
				start: transformLevel,
				end: transformLevel
			}
		}
	},
	'enum':{
		'keydown': {
			// TAB
			9: {
				select: transform
			}
		}
	}
};*/
var schemaConfig = {
	container: ['section', 'table', 'blockquote'],
	block : ['p'],
	inline : ['span']
};

var schema = {
	'toc': {
		tag: 'section'
	},
	'body':{
		tag:'section'
	},
	'enum': {
		tag: 'span',
		template: newEnum,
	},
	'header': {
		tag: 'span',
		template: recoverHeaderText,
	},
	'text':{
		tag: 'p',
		siblings: ['text']
	},
	'section': {
		tag: 'p',
		type: 'heading',
		level: 0,
		children: ['enum', 'header'/*, 'text'*/],
		siblings: ['text', 'subsection', 'paragraph']
	},
	'subsection': {
		tag: 'p',
		type: 'heading',
		level: 1,
		children: ['enum', 'header'/*, 'text'*/],
		siblings: ['text', 'subsection', 'paragraph']
	},
	'paragraph': {
		tag: 'p',
		type: 'header',
		level: 2,
		children: ['enum', 'header'/*, 'text'*/],
		siblings: ['text', 'subsection', 'paragraph']
	},
	'subparagraph': {
		tag: 'p',
		type: 'heading',
		level: 3,
		children: ['enum', 'header'/*, 'text'*/],
		siblings: ['text', 'subsection', 'paragraph']
	},
	'clause': {
		tag: 'p',
		type: 'heading',
		level: 4
	},
	'subclause': {
		tag: 'p',
		type: 'heading',
		level: 5
	},
	'item': {
		tag: 'p',
		type: 'heading',
		level: 6
	},
	'subitem': {
		tag: 'p',
		type: 'heading',
		level: 7
	},
	'subsubitem': {
		tag: 'p',
		type: 'heading',
		level: 8
	},
	'subdivision': {
		tag: 'p',
		type: 'heading',
		level: -1
	},
	'division': {
		tag: 'p',
		type: 'heading',
		level: -2
	},
	'subpart': {
		tag: 'p',
		type: 'heading',
		level: -3
	},
	'part': {
		tag: 'p',
		type: 'heading',
		level: -4
	},
	'subchapter': {
		tag: 'p',
		type: 'heading',
		level: -5
	},
	'chapter': {
		tag: 'p',
		type: 'heading',
		level: -6
	},
	'subtitle': {
		tag: 'p',
		type: 'heading',
		level: -7
	},
	'title': {
		tag: 'p',
		type: 'heading',
		level: -8
	},
};

var schemaEventsConfig = {
	/*'section': {
		'keydown': {
			// ENTER
			13: {
				start: suggest,
				end: suggest,
				middle: split
			},
			// BACKSPACE
			8: {
				start: join
			},
			// TAB
			9: {
				select: transform
			}
		}
	},*/
	'text': {
		'keydown': {
			// ENTER
			13: {
				//start: suggest,
				end: suggestBlockSibling,
				middle: split
			},
			// BACKSPACE
			8: {
				select: deleteSelection
			},
			'az': {
				select: deleteSelection
			}
		},
		'keyup': {
			'az': {
				select: dummy
			}
		}
	},
	'header': {
		'keydown': {
			// ENTER
			13: {
				//start: suggest,
				end: suggestBlockSibling,
				middle: split
			},
			// BACKSPACE
			8: {
				start: join
			}
		}/*,
		'keyup': {
			// BACKSPACE
			8: {
				start: transformLevel,
				end: transformLevel
			}
		}*/
	}/*,
	'enum':{
		'keydown': {
			// TAB
			9: {
				select: transform
			}
		}
	}*/
};
