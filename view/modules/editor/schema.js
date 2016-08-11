var split = function(position, source, target){
	console.log('split');
	source.setAttribute('flag-split', '');
	var textToTransfer = source.innerHTML.substring(position.start);
	source.innerHTML = source.innerHTML.substring(0, position.start);
	var p = source.closest('p');
	var newNode = p.cloneNode(true);
	legalHub.tools.nextNumber(newNode.querySelector('[itemtype=enum]'));
	var newSource = newNode.querySelector('[flag-split]');
	newSource.removeAttribute('flag-split', '');
	newSource.innerHTML = textToTransfer;
	if(p.nextSibling){
		p.parentNode.insertBefore(newNode, p.nextSibling);
	}else{
		p.parentNode.appendChild(newNode);
	}
}
var join = function(params, source, target){
	console.log('join');
}
var suggest = function(params, source, target){
	console.log('suggest');
}
var enterKey = 13;
var backspace = 8;
var schema = {
	'section': {
		type: 'block',
		tag: 'p',
		template: '',
		attrs: [],
		children: ['enum', 'header']
	},
	'enum': {
		type: 'span',
		tag: 'span',
	},
	'header': {
		type: 'span',
		tag: 'span'
	}
};
var schemaEventsConfig = {
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
		}
	},
};
var schemaConfig = {
	block : ['p'],
	inline : ['span'],
	content: ['section', 'table', 'blockquote']
};
