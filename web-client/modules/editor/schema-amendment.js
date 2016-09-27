var schemaAmendment = {
	'@lineNumberRules': {
		'body': {
			include: ["[itemtype='body']"],
			format: "${line}"
		},
		'everything': {
			format: "${line}"
		}
	},
	"@properties":{
		"bill-number" :{
			type: "ref",
			provider: ""
		}
	},
	"@template": [
		{ 
			type: 'cover' 
		},
		{ 
			type: 'body' 
		}
	],
	"@name" : 'amendment',
	'cover':{
		type: 'container',
		'@template': [
			{
				type: 'billNumber',
				wrapper: 'block'
			}
		]
	},
	'body':{
		type: 'container',
		'@template': [
			{
				type: 'text'
			}
		]
	},
	'level': {
		attributes: [{
			name: 'type',
			mandatory: false,
			values: ['amending']
		}]
	},
	"billNumber" :{
		type: 'inline',
		after: {
			'keyup':{
				'a#' : function(context, lhe){
				
					var scope = angular.element(editor.rootElement).scope();
					scope.getProperties({title: lhe.currentNode.textContent.replace(/\u200C/, '')}, function(properties){
						
						var longTitleRef = properties.longTitle;
						
						var newBlock = document.getElementById('longTitleRef');
						if(newBlock == null){
							newBlock = lhe.newBlock(longTitleRef);
							lhe.insertBlockAfter(newBlock);
							newBlock.id = 'longTitleRef';
							newBlock.setAttribute('type', 'longTitleRef');
						}else{
							newBlock.innerHTML = longTitleRef;
						}
						
						lhe.currentNode.setAttribute('idref', properties.id);
						
					});
				}
			}
		}
	},
	'longTitle':{
		minOccurs: 0,
		maxOccurs: 1,
		nlp: {
			tagging: {
				triggers: {
					'wordsCountMax': 50,
					'wordsCountMin': 5,
					'expression': new RegExp(/An act/, 'i')
				}/*,
					score: function(context, textNode){
					return 1;
				}*/
			}
		}
	},
	'preamble': {
		nlp: {
			tagging: {
				triggers:{
					'expression': new RegExp(/Be it enacted by/, 'i')
				}
			}
		}
	},
	'section': {
		base: 'level',
		inlines: ['number', 'heading', 'text'],
		blocks: ['subsection'],
		nlp: {
			tagging: {
				triggers:{
					'expression': new RegExp(/^\s*(Section\s+[0-9a-zA-Z.)]+)\s*/, 'i')
				}
			}
		},
		template: ['number', 'text'],
		transform : function(editor){
			if(editor.isEmpty(editor.currentNode)){
				return editor.applyTemplate(editor.currentNode, editor.schema['section'].template);
			}else{
				var text = editor.getTextContent(editor.currentNode);
				if(editor.applyTemplate(editor.currentNode, editor.schema['section'].template)){
					var numberContainer = editor.getChildByType(editor.currentNode, 'number');
					if(numberContainer){
						var match = text.match(editor.schema['section'].nlp.tagging.triggers['expression']);
						if(match.length>1){
							numberContainer.innerHTML = match[1];
							editor.setEmptyNodeAttributes(numberContainer);
						}
					}
					var textContainer = editor.getChildByType(editor.currentNode, 'text');
					if(textContainer){
						textContainer.innerHTML = numberContainer ? text.replace(editor.schema['section'].nlp.tagging.triggers['expression'] ,'') : text;
						editor.setEmptyNodeAttributes(textContainer);
						editor.setCaretPosition(textContainer, 1);
					}
				}
			}
			return true;
		}
	},
	'number': {
		type: 'inline'
	},
	'ref': {
		attributes: ['href'],
		type: 'inline'
	},
	'text': {
		suggest: true,
		/*'keydown':{
			13:{
				'start': lhe.suggestBefore,
				'middle': lhe.split,
				'end': lhe.suggestAfter
			}
		},*/
		nlp: {
			processors: [
				{
					name: 'fetch-lines',
					triggers: {
						'expression': new RegExp(/line([^0-9]*)?([0-9]+)([^0-9]*[and|to]?[^0-9]*)([0-9]+)?(.*)(substitute|insert|entirety)/, 'i')
					},
					fn: function(context, textNode, editor){
						var currentBlock = editor.getBlock(editor.currentNode);
						if(currentBlock){
							editor.setType('amendment', currentBlock);
						}
					}
				}
			]
		}
	},
	'quote':{
		tag: 'div',
		trackChanges: true
	},
	'amendment': {
		suggest: 'text',
		transform: function(lhe, node){
			var currentBlock = lhe.getBlock(lhe.currentNode);
			var documentRef = lhe.contentElement.querySelector("[itemtype='billNumber']");
			if(documentRef){
				documentRef = documentRef.innerHTML;
			}
			currentBlock.innerHTML = currentBlock.innerHTML.replace(new RegExp(/line([^0-9]*)?([0-9]+)([^0-9]*[and|to]?[^0-9]*)([0-9]+)?(.*)(substitute|insert|entirety)/, 'i'), function(match, $0, $1, $2, $3, $4, $5){
				var fromLine = $1; toLine = $3; action = $5;
				swal({
					title: "Amendatory instruction",
					text: "You seem to be referencing lines " + fromLine + " to " + toLine + " of Bill " +documentRef +". Would you like to continue fetching this provision?",
					html: true,
					type: "info",
					showCancelButton: true,
					closeOnConfirm: true
				}, function(){
					
					var scope = angular.element(lhe.rootElement).scope();
					scope.getProvision({fromLine: fromLine, toLine: toLine, title: documentRef}, function(provision){
						var newQuote = lhe.newElementByType('quote');
						newQuote.innerHTML = provision.content.replace(/<a([^\/]*)\/>/g, '<a$1>'+ String.fromCodePoint(0x200C) +'</a>');
						lhe.insertElementAfter(newQuote, 'block');
						lhe.nestBlock(newQuote, 1);
					});
				});
				if($3){
					return "line"+$0+"<span itemtype='ref'>"+$1+$2+($3 ? $3:'')+'</span>'+$4+$5;
				}else{
					return "line"+$0+"<span itemtype='ref'>"+$1+'</span>'+$2+($3 ? $3:'')+$4+$5;
				}
			});
		}
	}
	//<clause>, <section>, <part>, <paragraph>, <chapter>, <title>, <article>, <book>, <tome>, <division>, <list>, <point>, <indent>, <alinea>, <rule>, <subrule>, <proviso>, <subsection>, <subpart>, <subparagraph>, <subchapter>, <subtitle>, <subdivision>, <subclause>, <sublist>, <transitional>
};
