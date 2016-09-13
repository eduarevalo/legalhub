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

  
if (typeof (exports) !== "undefined") {
    if (typeof (module) !== "undefined" && module.exports) {
        exports = module.exports = getText;
    }
    exports.getText = getText;
}