var fs = require('fs'),
  qr = require('qr-image'),
  jdenticon = require("jdenticon"),
  crypto = require('crypto');

exports.createQRCode = function(text, type, path){
  var qr_svg = qr.image(text, { type: type });
  qr_svg.pipe(fs.createWriteStream(path));
}

exports.createIcon = function(text, size, path){
  svg = jdenticon.toSvg(crypto.createHash('md5').update(text).digest("hex"), size);
  fs.writeFileSync(path, svg);
}
