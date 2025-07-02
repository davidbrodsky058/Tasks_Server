const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const taskCtrl = require('../controllers/task.controller');

router
  .route('/tasks')
    .get(auth, taskCtrl.getAll)
    .post(auth, taskCtrl.create);

router
  .route('/tasks/:id')
    .put(auth, authorize, taskCtrl.update)
    .delete(auth, authorize, taskCtrl.remove);

router.post('/tasks/:id/share', auth, taskCtrl.share);
router.post('/tasks/:id/unshare', auth, taskCtrl.unshare);

module.exports = router;
