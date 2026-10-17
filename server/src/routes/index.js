const router = require('express').Router();
const { body } = require('express-validator');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

const auth = require('../controllers/auth.controller');
const guards = require('../controllers/guard.controller');
const clients = require('../controllers/client.controller');
const sites = require('../controllers/site.controller');
const contractors = require('../controllers/contractor.controller');
const deployments = require('../controllers/deployment.controller');
const attendance = require('../controllers/attendance.controller');
const payroll = require('../controllers/payroll.controller');
const dashboard = require('../controllers/dashboard.controller');
const reports = require('../controllers/report.controller');

const admin = restrictTo('Admin');

// ---- public
router.post('/auth/login',
  [body('username').trim().notEmpty().withMessage('Username is required'), body('password').notEmpty().withMessage('Password is required')],
  validate, auth.login);

// ---- everything below needs a valid token
router.use(protect);
router.get('/auth/me', auth.me);
router.post('/auth/change-password',
  [body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')], validate, auth.changePassword);

router.get('/dashboard', dashboard.stats);

const resource = (path, c) => {
  router.get(`/${path}`, c.list);
  router.get(`/${path}/:id`, c.getOne);
  router.post(`/${path}`, admin, c.create);
  router.put(`/${path}/:id`, admin, c.update);
  router.delete(`/${path}/:id`, admin, c.remove);
};
resource('guards', guards);
resource('clients', clients);
resource('sites', sites);
resource('contractors', contractors);

router.get('/deployments', deployments.list);
router.post('/deployments', admin, deployments.assign);
router.put('/deployments/:id/end', admin, deployments.end);

// attendance can be marked by supervisors too
router.get('/attendance/sheet', attendance.sheet);
router.get('/attendance/summary', attendance.summary);
router.post('/attendance/bulk', attendance.saveBulk);

router.get('/payroll', admin, payroll.list);
router.post('/payroll/generate', admin, payroll.generate);
router.put('/payroll/:id', admin, payroll.updateDeductions);
router.patch('/payroll/:id/pay', admin, payroll.markPaid);

router.get('/reports/guard-deployment', reports.guardDeployment);

module.exports = router;
