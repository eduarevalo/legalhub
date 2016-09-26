var editor;

angular.module('legalHub').controller('newDocumentCtrl', function($scope, $state, $timeout, growlService, documentService, referenceService, version, rendition, $sce) {
	$scope.mode = 'new';
	$scope.editorMode = 'edit';
	$scope.view = 'web';
	$scope.style = 'default';
	if($state.params.template.length > 0 || $state.params.documentId.length > 0){
		$scope.mode = 'edit';
	}
	$scope.table = {rows: 2, cols: 2, header: true};
	$scope.selectedToolbar = '';
	$scope.template = $state.params.template;
	$scope.document = {
		id: $state.params.documentId,
		title: $state.params.documentTitle || 'New Document',
		content: '',
		collectionId: $state.params.collectionId,
		template: false
	};
	$scope.schema = '';
	$scope.insertTable = function(){
		editor.insertTableAfter($scope.table.rows, $scope.table.cols, $scope.table.header);
	}
	$scope.goToNew = function(){
		$scope.mode = 'new';
	}
	$scope.selectToolbar = function(toolbar){
		$scope.selectedToolbar = toolbar;
	};
	$scope.newDocument = function(){
		$scope.mode = 'new';
		$scope.template = '';
		$scope.document = {
			id: '',
			title: 'New Document',
			content: '',
			collectionId: $state.params.collectionId,
			template: false
		};
	};
	$scope.emptyDocument = function(){
		editor.setNewDocument();
	}
	$scope.getHtml = function(doc){
		return $sce.trustAsHtml(doc);
	};
	$scope.setStyle = function(style){
		$scope.style = style;
		setPageStyle($scope.style);
	};
	$scope.setEditorMode = function(mode){
		$scope.editorMode = mode;
		editor.setMode($scope.editorMode);
	};
	$scope.setSchema = function(schema){
		$scope.schema = schema;
		switch($scope.schema){
			case 'amendment':
				editor.setSchema(schemaAmendment);
				break;
			case 'bill':
				editor.setSchema(legisSchema);
				break;
			case 'general':
				editor.setSchema(generalSchema);
				break;
			default:
				editor.setSchema();
		}
	};
	$scope.setTemplate = function(template){
		$scope.template = template;
		$scope.mode = 'edit';
	}
	$scope.openDocument = function(){
		version.getLastVersion($scope.document.id).then(function(version){
			$scope.setSchema(version.schema);
			editor.setContent(version.content);
			$scope.setStyle(version.style);
			editor.id = $scope.document.id;
			collaboration.openDocument($scope.document.id);
		});
	};
	$scope.saveDocument = function(newDocument, cb){
		if(newDocument){
			$scope.document.id = '';
		}
		var tempDoc = {content: editor.getHtml(), id: $scope.document.id, title: $scope.document.title, collectionId: $scope.document.collectionId, template: $scope.document.template, schema: $scope.schema, style: $scope.style };
		documentService.save(tempDoc).then(function(response){
			if(response.success){
				$scope.document.id = response.id;
				$scope.document.code = response.code;
				growlService.growl('Saved', 'inverse');
				if(cb){
					cb();
				}
			}
		});
	}
	$scope.generateRendition = function(type, renditionName, save){
		if(save == undefined){
			save = false;
		}
		var tempDoc = {content: editor.getHtml(true), id: $scope.document.id, title: $scope.document.title, schema: $scope.schema, style: $scope.style };
		rendition.generate(type, tempDoc, $scope.style, renditionName, save);
	}
	$scope.saveAndGenerateRendition = function(type, renditionName){
		$scope.generateRendition(type, renditionName, true);
	}
	$scope.diff = function(){
		rendition.diff().then(function(data){
			$('#editor blockquote').html(data);
		});
	}
	$scope.getProvision = function(params, cb){
		referenceService.getProvision(params).then(function(results){
			if(results.length>0){
				cb(results[0]);
			}
		});
	}
	$scope.getProperties = function(params, cb){
		referenceService.getProperties(params).then(function(results){
			if(results.length>0){
				cb(results[0]);
			}
		});
	}
	$scope.initEditor = function(){
		editor = new legalHubEditor(document.getElementById('editor'));
		setPageStyle($scope.style);
		if($scope.document.id.length > 0){
			$scope.openDocument();
		}else{
			$scope.setSchema($scope.template);
			$scope.emptyDocument();
		}
	}
})
