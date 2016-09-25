const xpath = require('xpath'),
  dom = require('xmldom').DOMParser;
  
var getText = function (nodes) {
	var text = '';
	if(nodes){
		nodes = !Array.isArray(nodes) ? [nodes] : nodes;
		for(var it=0; it<nodes.length; it++){
			var textNodes = xpath.select('.//text()', nodes[it]);
			for(var it2=0; it2<textNodes.length; it2++){
				text += textNodes[it2];
			}
		}
	}
	return text;
};

var extractLines = (doc, from, to) => {
	var selectedNodes = [];
	var firstNode = xpath.select(`//span[@type='word'][@line-number='${from}']`, doc);
	if(firstNode.length > 0){
		firstNode = firstNode[0];
	}
	//selectedNodes.push(firstNode);
	var nextNodes = xpath.select("./following-sibling::* | ./following::* | ./following-sibling::text() | ./following::text()", firstNode);	
	for(var i=0; i<nextNodes.length; i++){

		if(nextNodes[i].localName 
			&& nextNodes[i].localName.toLowerCase() == 'span' 
				&& nextNodes[i].hasAttribute('type') && nextNodes[i].getAttribute('type') == 'word'
					&& nextNodes[i].hasAttribute('line-number') && nextNodes[i].getAttribute('line-number') == (to+1) ){
			break;
		}else{
			selectedNodes.push(nextNodes[i]);
		}
	
	}
	var finalContent = "";
	var pOpen = false;
	for(var i=0; i<selectedNodes.length; i++){
		if(selectedNodes[i].data || selectedNodes[i].localName.toLowerCase() == 'span'){
			if(!pOpen){
				pOpen = true;
				finalContent += '<p>';
			}
		}else if(pOpen){
			pOpen = false;
			finalContent += '</p>';
		}
		if(selectedNodes[i].localName 
			&& selectedNodes[i].localName.toLowerCase() == 'span' 
				&& selectedNodes[i].hasAttribute('type') && nextNodes[i].getAttribute('type') == 'word'){
			finalContent += selectedNodes[i].textContent;
		}else{
			finalContent += selectedNodes[i].toString();
		}
	}
	return finalContent.replace(/<span type="word">([^<]+)<\/span>/gi, function(match, $a){ return $a; });
	
};

  
if (typeof (exports) !== "undefined") {
    exports.extractLines = extractLines;
	exports.getText = getText;
}