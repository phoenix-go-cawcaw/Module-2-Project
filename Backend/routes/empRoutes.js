import express from "express";
import {
  getEmployee_infoCon,
  insertEmployee_infoCon,
  updateEmployee_infoCon,
  deleteEmployee_infoCon,
  getleave_requestsCon,
  insertleave_requestCon,
  updateleave_requestsCon,
  deleteleave_requestsCon,
  getpayrollCon,
  insertpayrollCon,
  updatepayrollCon,
  deletepayrollCon,
  getattendanceCon,
  insertattendanceCon,
  updateattendanceCon,
  deleteattendanceCon
} from "../controllers/empCon.js";

const router = express.Router();

// EMPLOYEES ROUTES
router.get("/employees", getEmployee_infoCon);
router.post("/employees", insertEmployee_infoCon);
router.put("/employees/:employee_id", updateEmployee_infoCon);
router.delete("/employees/:employee_id", deleteEmployee_infoCon);

// LEAVE REQ ROUTES
router.get("/leave_requests", getleave_requestsCon);
router.post("/leave_requests", insertleave_requestCon);
router.put("/leave_requests/:leave_id", updateleave_requestsCon);
router.delete("/leave_requests/:leave_id", deleteleave_requestsCon);

// PAYROLL ROUTES
router.get("/payroll", getpayrollCon);
router.post("/payroll", insertpayrollCon);
router.put("/payroll/:id", updatepayrollCon);
router.delete("/payroll/:id", deletepayrollCon);

// ATTENDANCE ROUTES
router.get("/attendance", getattendanceCon);
router.post("/attendance", insertattendanceCon);
router.put("/attendance/:attendance_id", updateattendanceCon);
router.delete("/attendance/:attendance_id", deleteattendanceCon);

export default router;