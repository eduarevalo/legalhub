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

var renditionRouter = require(__base + 'routes/rendition');
router.use('/rendition', renditionRouter);

/* index */
router.get('/', function(req, res, next) {
  res.end('Unknown operation.');
});

module.exports = router;