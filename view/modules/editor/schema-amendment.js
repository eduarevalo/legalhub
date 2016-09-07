var schemaAmendment = {
	'@lineNumberRules': {
		'body': {
			include: ["[itemtype='body']"]
		},
		'everything': {
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
				
					var scope = angular.element(editor.element).scope();
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
		nlp: {
			processors: [
				{
					name: 'fetch-lines',
					triggers: {
						'expression': new RegExp(/line.*\s+([0-9]+)\s*to\s*([0-9]+).*substitute/, 'i')
					},
					fn: function(context, textNode, editor){
						var match = textNode.match(new RegExp(/line.*\s+([0-9]+)\s*to\s*([0-9]+).*substitute/, 'i'));
						if(match && match.length>2){
							var fromLine = match[1];
							var toLine = match[2];
							var documentRef = editor.element.querySelector("[itemtype='billNumber']");
							if(documentRef){
								documentRef = documentRef.innerHTML;
							}
							swal({
								title: "Amendatory instruction",
								text: "You seem to be referencing from line " + fromLine + " to " + toLine + " from the " +documentRef +". Would you like to continue fetching this provision?",
								html: true,
								type: "info",
								showCancelButton: true,
								closeOnConfirm: true
							}, function(){
								var match = textNode.match(new RegExp(/line.*\s+([0-9]+\s*to\s*[0-9]+).*substitute/, 'i'));
								if(match && match.length>1){
									var matchedRef = match[1];
									var newRef = editor.newElementByType('ref', matchedRef);
									editor.currentNode.innerHTML = editor.currentNode.innerHTML.replace(matchedRef, newRef.outerHTML);
								}
								var currentBlock = editor.getBlock(editor.currentNode);
								if(currentBlock){
									currentBlock.setAttribute('data-type', 'amending');
								}
								var scope = angular.element(editor.element).scope();
								scope.getProvision({fromLine: fromLine, toLine: toLine, title: documentRef}, function(textToInsert){
									var newQuote = editor.newElementByType('quote');
									

									newQuote.innerHTML = textToInsert.content.replace(/<a([^\/]*)\/>/g, '<a$1>'+ String.fromCodePoint(0x200C) +'</a>');
									editor.insertElementAfter(newQuote, 'block');
									editor.nestBlock(newQuote, 1);
									//swal("Inserted!", "Your reference was inserted for modification.", "success");
								});
							});
						}
					}
				}
			]
		}
	},
	'quote':{
		tag: 'div',
		trackChanges: true
	}
	//<clause>, <section>, <part>, <paragraph>, <chapter>, <title>, <article>, <book>, <tome>, <division>, <list>, <point>, <indent>, <alinea>, <rule>, <subrule>, <proviso>, <subsection>, <subpart>, <subparagraph>, <subchapter>, <subtitle>, <subdivision>, <subclause>, <sublist>, <transitional>
};
