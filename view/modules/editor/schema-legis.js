var legisSchema = {
	events: {},
	types: {
		'level': {
			
		},
		'section': {
			template: ['number', 'label', 'text'],
			transform : function(editor){
				if(editor.isEmpty(editor.currentNode)){
					return editor.applyTemplate(editor.currentNode, editor.schema.types['section'].template);
				}
				return true;
			},
		},
		'number': {
			type: 'inline'
		},
		'label': {
			type: 'inline'
		},
		'text': {
		
		}
		//<clause>, <section>, <part>, <paragraph>, <chapter>, <title>, <article>, <book>, <tome>, <division>, <list>, <point>, <indent>, <alinea>, <rule>, <subrule>, <proviso>, <subsection>, <subpart>, <subparagraph>, <subchapter>, <subtitle>, <subdivision>, <subclause>, <sublist>, <transitional>
	}
};