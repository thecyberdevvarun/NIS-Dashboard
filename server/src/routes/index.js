import { Router } from "express";
import { body } from "express-validator";

import { protect, restrictTo } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

// Controllers with named exports
import * as auth from "../controllers/auth.controller.js";
import * as guards from "../controllers/guard.controller.js";
import * as deployments from "../controllers/deployment.controller.js";
import * as attendance from "../controllers/attendance.controller.js";
import * as payroll from "../controllers/payroll.controller.js";
import * as dashboard from "../controllers/dashboard.controller.js";
import * as reports from "../controllers/report.controller.js";

// Controllers with default exports
import clients from "../controllers/client.controller.js";
import sites from "../controllers/site.controller.js";
import contractors from "../controllers/contractor.controller.js";

const router = Router();

const admin = restrictTo("Admin");

// ==========================================
// PUBLIC ROUTES
// ==========================================

router.post(
  "/auth/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),

    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  auth.login,
);

// ==========================================
// PROTECTED ROUTES
// ==========================================

router.use(protect);

// Authentication
router.get("/auth/me", auth.me);

router.post(
  "/auth/change-password",
  [
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters"),
  ],
  validate,
  auth.changePassword,
);

// Dashboard
router.get("/dashboard", dashboard.stats);

// ==========================================
// RESOURCE ROUTES
// ==========================================

const resource = (path, controller) => {
  // Validate controller methods before registering routes
  const methods = ["list", "getOne", "create", "update", "remove"];

  methods.forEach((method) => {
    if (typeof controller[method] !== "function") {
      throw new Error(
        `Controller error: ${path}.${method} is not a function. Check its exports.`,
      );
    }
  });

  router.get(`/${path}`, controller.list);

  router.get(`/${path}/:id`, controller.getOne);

  router.post(`/${path}`, admin, controller.create);

  router.put(`/${path}/:id`, admin, controller.update);

  router.delete(`/${path}/:id`, admin, controller.remove);
};

// Guards
resource("guards", guards);

// Clients
resource("clients", clients);

// Sites
resource("sites", sites);

// Contractors
resource("contractors", contractors);

// ==========================================
// DEPLOYMENTS
// ==========================================

router.get("/deployments", deployments.list);

router.post("/deployments", admin, deployments.assign);

router.put("/deployments/:id/end", admin, deployments.end);

// ==========================================
// ATTENDANCE
// ==========================================

// Attendance can also be marked by supervisors
router.get("/attendance/sheet", attendance.sheet);

router.get("/attendance/summary", attendance.summary);

router.post("/attendance/bulk", attendance.saveBulk);

// ==========================================
// PAYROLL (ADMIN ONLY)
// ==========================================

router.get("/payroll", admin, payroll.list);

router.post("/payroll/generate", admin, payroll.generate);

router.put("/payroll/:id", admin, payroll.updateDeductions);

router.patch("/payroll/:id/pay", admin, payroll.markPaid);

// ==========================================
// REPORTS
// ==========================================

router.get("/reports/guard-deployment", reports.guardDeployment);

// ==========================================
// EXPORT ROUTER
// ==========================================

export default router;
