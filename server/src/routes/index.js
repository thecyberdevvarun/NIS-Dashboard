import express from 'express';
const router = express.Router();
import { body } from 'express-validator';
import { protect, restrictTo, pageAccess } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

import * as auth from '../controllers/auth.controller.js';
import * as guards from '../controllers/guard.controller.js';
import clients from '../controllers/client.controller.js';
import sites from '../controllers/site.controller.js';
import contractors from '../controllers/contractor.controller.js';
import * as deployments from '../controllers/deployment.controller.js';
import * as attendance from '../controllers/attendance.controller.js';
import * as payroll from '../controllers/payroll.controller.js';
import * as dashboard from '../controllers/dashboard.controller.js';
import * as reports from '../controllers/report.controller.js';
import * as users from '../controllers/user.controller.js';
import * as access from '../controllers/access.controller.js';

const admin = restrictTo('Admin');

// ---- public
router.post('/auth/login',
  [body('username').trim().notEmpty().withMessage('Username is required'), body('password').notEmpty().withMessage('Password is required')],
  validate, auth.login);

// ---- everything below needs a valid, active account
router.use(protect);
router.get('/auth/me', auth.me);
router.post('/auth/change-password',
  [body('currentPassword').notEmpty().withMessage('Enter your current password'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')],
  validate, auth.changePassword);

router.get('/dashboard', pageAccess('dashboard'), dashboard.stats);

/**
 * Reading needs access to the page itself OR to a page that uses this data
 * (e.g. the Deployments page needs the guard list). Writing is Admin only.
 */
const resource = (path, c, readPages) => {
  const read = pageAccess(...readPages);
  router.get(`/${path}`, read, c.list);
  router.get(`/${path}/:id`, read, c.getOne);
  router.post(`/${path}`, admin, c.create);
  router.put(`/${path}/:id`, admin, c.update);
  router.delete(`/${path}/:id`, admin, c.remove);
};
resource('guards', guards, ['guards', 'deployments']);
resource('clients', clients, ['clients', 'sites', 'guards', 'deployments']);
resource('sites', sites, ['sites', 'attendance', 'deployments']);
resource('contractors', contractors, ['contractors', 'guards']);

router.get('/deployments', pageAccess('deployments'), deployments.list);
router.post('/deployments', admin, deployments.assign);
router.put('/deployments/:id/end', admin, deployments.end);

// Supervisors can mark attendance; End Users can only look.
router.get('/attendance/sheet', pageAccess('attendance'), attendance.sheet);
router.get('/attendance/summary', pageAccess('attendance'), attendance.summary);
router.post('/attendance/bulk', restrictTo('Admin', 'Supervisor'), pageAccess('attendance'), attendance.saveBulk);

// Payroll: visible only to roles Admin has allowed, but changes are always Admin only.
router.get('/payroll', pageAccess('payroll'), payroll.list);
router.post('/payroll/generate', admin, payroll.generate);
router.put('/payroll/:id', admin, payroll.updateDeductions);
router.patch('/payroll/:id/pay', admin, payroll.markPaid);

router.get('/reports/guard-deployment', pageAccess('reports'), reports.guardDeployment);

// ---- Admin area
router.get('/access', admin, access.get);
router.put('/access', admin, access.save);
router.get('/users', admin, users.list);
router.post('/users', admin, users.create);
router.put('/users/:id', admin, users.update);
router.delete('/users/:id', admin, users.remove);
router.post('/users/:id/reset-password', admin, users.resetPassword);

export default router;
