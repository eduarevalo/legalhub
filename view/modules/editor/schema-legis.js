var legisSchema = {
	'level': {

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
	'text': {
		nlp: {
			processors: [
				{
					triggers: {
						'expression': new RegExp(/^\s*Section\s*([0-9a-zA-Z.)-]+)\s*of(.+)is\s*[repealed|amended|substituted]\s*/, 'i')
					},
					fn: function(context, textNode, editor){
						var match = textNode.match(new RegExp(/^\s*Section\s*([0-9a-zA-Z.)-]+)\s*of(.+)is repealed\s*/, 'i'));
						if(match && match.length>2){
							var sectionId = match[1];
							var documentId = match[2];
							swal({
								title: "Amendatory instruction",
								text: "You seem to be referencing section " + sectionId + " of " + documentId + ". Would you like to continue fetching this provision?",
								html: true,
								type: "info",
								showCancelButton: true,
								closeOnConfirm: false
							}, function(){
								var scope = angular.element(editor.element).scope();
								scope.$apply(function () {
									scope.reference(function(textToInsert){
										var newQuote = editor.newElementByType('quote');
										newQuote.innerHTML = textToInsert;
										editor.insertElementAfter(newQuote, 'block');
										swal("Inserted!", "Your reference was inserted for modification.", "success");
									});
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
