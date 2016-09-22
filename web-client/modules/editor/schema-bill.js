var legisSchema = {
	'@lineNumberRules': {
		'sections': {
			include: ["[itemtype='section']", "[itemtype='quote']"]
		},
		'everything': {
		}
	},
	"@name" : 'bill',
	'level': {
		attributes: [{
			name: 'type',
			mandatory: false,
			values: ['amending']
		}]
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
					name: 'amending',
					triggers: {
						'expression': new RegExp(/section\s*([0-9a-zA-Z.)-]+)\s*of\s*(.+)is\s*(repealed|amended|substituted)/, 'i')
					},
					fn: function(context, textNode, editor){
						var match = textNode.match(new RegExp(/section\s*([0-9a-zA-Z.)-]+)\s*of\s*(.+)is\s*(repealed|amended|substituted)/, 'i'));
						if(match && match.length>2){
							var sectionId = match[1];
							var documentId = match[2];
							swal({
								title: "Amendatory instruction",
								text: "You seem to be referencing section " + sectionId + " of " + documentId + ". Would you like to continue fetching this provision?",
								html: true,
								type: "info",
								showCancelButton: true,
								closeOnConfirm: true
							}, function(){
								var match = textNode.match(new RegExp(/(section\s*[0-9a-zA-Z.)-]+\s*of\s*\b.+)is\s*(repealed|amended|substituted)/, 'i'));
								if(match && match.length>1){
									var matchedRef = match[1];
									var newRef = editor.newElementByType('ref', matchedRef);
									editor.currentNode.innerHTML = editor.currentNode.innerHTML.replace(matchedRef, newRef.outerHTML);
								}
								var sectionNode = editor.getPreviousByType(editor.currentNode, 'section');
								if(sectionNode){
									sectionNode.setAttribute('data-type', 'amending');
								}
								var scope = angular.element(editor.rootElement).scope();
								if(scope){
									scope.getProvision({title: documentId, section: sectionId}, function(textToInsert){
										var newQuote = editor.newElementByType('quote');
										newQuote.innerHTML = textToInsert.content;
										editor.insertElementAfter(newQuote, 'block');
										editor.nestBlock(newQuote, 1);
										//swal("Inserted!", "Your reference was inserted for modification.", "success");
									});
								}
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
