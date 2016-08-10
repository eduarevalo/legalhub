var split = function(params, source, target){
	console.log('split');
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
		children: ['number', 'heading']
	},
	'number': {
		type: 'span',
		tag: 'span',
	},
	'heading': {
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