var editor;

angular.module('legalHub').controller('newDocumentCtrl', function($scope, $state, $timeout, growlService, documentService, version, rendition, $sce) {
	$scope.mode = 'new';
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
		$scope.document.content = editor.newDocument().outerHTML;
	}
	$scope.getHtml = function(doc){
		return $sce.trustAsHtml(doc);
	};
	$scope.setSchema = function(schema){
		$scope.schema = schema;
		switch($scope.schema){
			case 'legis':
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
			$scope.document.content = version.content;
			$scope.setSchema('legis');
		});
	};
	$scope.saveDocument = function(newDocument){
		if(newDocument){
			$scope.document.id = '';
		}
		var tempDoc = {content: editor.getHtml(), id: $scope.document.id, title: $scope.document.title, collectionId: $scope.document.collectionId, template: $scope.document.template };
		documentService.save(tempDoc).then(function(response){
			if(response.success){
				$scope.document.id = response.id;
				$scope.document.code = response.code;
				growlService.growl('Saved');
			}
		});
	}
	$scope.generateRendition = function(type){
		var tempDoc = {content: editor.getHtml(true), id: $scope.document.id, title: $scope.document.title };
		rendition.generate(type, tempDoc, editorConfig.style);
	}
	$scope.diff = function(){
		rendition.diff().then(function(data){
			$('#editor blockquote').html(data);
		});
	}
	$scope.reference = function(cb){
		var newRef = ['<p>(a) Not later than July 1, 2017, the Water Planning Council, established pursuant to section 25-33o, shall, within available appropriations, prepare a state water plan for the management of the water resources of the state. In developing such state water plan, the Water Planning Council shall: (1) Design a unified planning program and budget; (2) consider regional water and sewer facilities plans; (3) identify the appropriate regions of the state for comprehensive water planning; (4) identify the data needs and develop a consistent format for submitting data to the council, applicable state agencies and regional councils of governments for use in planning and permitting; (5) consider the potential impact of climate change on the availability and abundance of water resources and the importance of climate resiliency; (6) seek involvement of interested parties; (7) solicit input from the advisory group established pursuant to section 25-33o; (8) consider individual water supply plans, water quality standards, stream flow classifications, as described in regulations adopted pursuant to section 26-141b, water utility coordinating committee plans, the state plan of conservation and development, as described in section 16a-30, and any other planning documents deemed necessary by the council; (9) promote the adoption of municipal ordinances based on the State of Connecticut Model Water Use Restriction Ordinance for municipal water emergencies; and (10) examine appropriate mechanisms for resolving conflicts related to the implementation of the state water plan.</p>',
		'<p>(b) The state water plan developed pursuant to subsection (a) of this section shall: (1) Identify the quantities and qualities of water that are available for public water supply, health, economic, recreation and environmental benefits on a regional basin scale considering both surface water and groundwater; (2) identify present and projected demands for water resources on a state-wide and regional basin scale; (3) recommend the utilization of the state\'s water resources, including surface and subsurface water, in a manner that balances public water supply, economic development, recreation and ecological health; (4) recommend steps to increase the climate resiliency of existing water resources and infrastructure; (5) make recommendations for technology and infrastructure upgrades, interconnections and such major engineering works or special districts which may be necessary, including the need, timing and general cost thereof; (6) recommend land use and other measures, including an assessment of land acquisition or land protection needs, where appropriate to ensure the desired quality and abundance of water and to promote development in concert with available water resources; (7) take into account desired ecological, recreational, agricultural, industrial and commercial use of water bodies; (8) inform residents of the state about the importance of water-resource stewardship and conservation; (9) establish conservation guidelines and incentives for consumer water conservation with due consideration for energy efficiency; (10) develop a water reuse policy with incentives for matching the quality of the water to the use; (11) meet data collection and analysis needs to provide for data driven water planning and permitting decisions; (12) take into account the ecological, environmental, public health and safety and economic impact that implementation of the state water plan will have on the state; (13) include short and long-range objectives and strategies to communicate and implement the plan; (14) seek to incorporate regional and local plans and programs for water use and management and plans for water and sewerage facilities in the state water plan; (15) promote intraregional solutions and sharing of water resources; (16) develop and recommend strategies to address climate resiliency including the impact of extreme weather events; and (17) identify modifications to laws and regulations that are necessary in order to implement the recommendations of the state water plan.</p>',
		'<p>(c) The Water Planning Council shall provide a time period of not less than one hundred twenty days for public review and comment prior to finalizing such plan. The Commissioners of Public Health and Energy and Environmental Protection, the chairperson of the Public Utilities Regulatory Authority and the Secretary of the Office of Policy and Management shall post such draft plan and information concerning such comment period in a conspicuous location on their respective web sites. The Council on Environmental Quality shall post such draft plan and information concerning such comment period in the Environmental Monitor. The Water Planning Council shall advertise and hold not less than one public hearing during such public review and comment period. After such public comment period, the council shall fully consider all written and oral comments concerning the proposed state water plan. The council shall make available the electronic text of the finalized state water plan on an Internet web site where the finalized state water plan shall be posted and a report summarizing: (1) All public comments received pursuant to this subsection, and (2) the changes made to the finalized state water plan in response to such comments and the reasons for such changes.</p>',
		'<p>(d) Not later than January 1, 2018, the Water Planning Council, in accordance with section 11-4a, shall submit the state water plan to the joint standing committees of the General Assembly having cognizance of matters relating to the environment, public health, planning and development and energy and technology for said committees\' approval or disapproval and any recommendations for revisions to the plan. The council shall submit such report to the Governor electronically.</p>',
		'<p>(e) Said joint standing committees shall conduct a joint public hearing on the state water plan  not later than forty-five days after receiving the plan pursuant to subsection (d) of this section, provided the Water Planning Council submits the plan at least sixty days prior to the end of the 2018 regular session of the General Assembly. If the Water Planning Council does not submit the plan at least sixty days prior to the end of the 2018 regular session, said joint standing committees shall conduct a joint public hearing on the plan not later than forty-five days after the convening of the 2019 regular session of the General Assembly. Not later than forty-five days after the joint public hearing, said joint standing committees shall either submit the plan with said joint standing committees\' joint recommendations for approval to the General Assembly or return the plan to the Water Planning Council indicating their disapproval and any recommendations for revisions to the plan.</p>',
		'<p>(f) In the event that the General Assembly disapproves or fails to act on the state water plan, in whole or in part, the state water plan shall be deemed to be rejected and shall be returned to the Water Planning Council for revisions and resubmittal to the General Assembly in accordance with the provisions of subsection (f) of this section.</p>',
		'<p>(g) The Water Planning Council shall oversee the implementation and periodic updates of the state water plan. On or before January 1, 2016, and annually thereafter, the Water Planning Council shall submit a report, in accordance with section 11-4a, to the joint standing committees of the General Assembly having cognizance of matters relating to the environment, public health, planning and development and energy and technology on the status of the development and implementation of the state water plan and any updates to such plan. On and after January 1, 2016, the report required by this subsection shall supplant the requirement for an annual report as required pursuant to section 25-33o.</p>'];
		cb(newRef.join(''));
	}
	$scope.initEditor = function(){
		init();
		editor = new legalHubEditor(document.getElementById('editor'));
		if($scope.document.id.length > 0){
			$scope.openDocument();
			console.log($scope.mode);
		}else{
			switch($scope.template){
				case 'bill':
					$scope.setSchema('legis');
					$scope.emptyDocument();
					break;
				default:
					$scope.setSchema();
					$scope.emptyDocument();
					break;
			}
		}
	}
})
