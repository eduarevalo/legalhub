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
}
var enterKey = 13;
var backspace = 8;
var schema = {
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
};
var schemaEventsConfig = {
	'section': {
		'keydown': {
			// ENTER
			13: {
				start: suggest,
				end: split,
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
				end: split,
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
};
var schemaConfig = {
	container: ['section', 'table', 'blockquote'],
	block : ['p'],
	inline : ['span']
};
