var express = require('express');
var router = express.Router();

var collectionRouter = require(__base + 'routes/collection');
router.use('/collection', collectionRouter);

var documentRouter = require(__base + 'routes/document');
router.use('/document', documentRouter);

var versionRouter = require(__base + 'routes/version');
router.use('/version', versionRouter);

var templateRouter = require(__base + 'routes/template');
router.use('/template', templateRouter);

/* index */
router.get('/', function(req, res, next) {
  res.end('Unknown operation.');
});

/*router.post('/upload', function (req, res, next) {
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
    console.log("Uploading: " + filename);

    //Path where image will be uploaded
    fstream = fs.createWriteStream(__base + 'data/upload/' + filename);
    file.pipe(fstream);
    fstream.on('close', function () {
      console.log("Upload Finished of " + filename);
      res.redirect('back');           //where to go next
    });
  });
});*/

module.exports = router;
