var express = require('express');
var router = express.Router();

var userRouter = require(__base + 'routes/user');
router.use('/user', userRouter);

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

var referenceRouter = require(__base + 'routes/reference');
router.use('/reference', referenceRouter);

var engrossRouter = require(__base + 'routes/engross');
router.use('/engross', engrossRouter);

/* index */
router.get('/', function(req, res, next) {
  res.end('Unknown operation.');
});

module.exports = router;