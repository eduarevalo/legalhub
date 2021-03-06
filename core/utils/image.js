var fs = require('fs'),
  qr = require('qr-image'),
  jdenticon = require("jdenticon"),
  crypto = require('crypto');

exports.createQRCode = function(text, type, path){
  qr.image(text, {type: type }).pipe(fs.createWriteStream(path));
}

exports.createIcon = function(text, size, path){
  var svg = jdenticon.toSvg(crypto.createHash('md5').update(text).digest("hex"), size);
  fs.writeFileSync(path, svg);
}
