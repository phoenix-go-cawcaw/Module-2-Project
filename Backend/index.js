import express from "express";
import cors from "cors";

import {
  getEmployee_infoCon,
  insertEmployee_infoCon,
  updateEmployee_infoCon,
  deleteEmployee_infoCon,
  getpayrollCon,
  insertpayrollCon,
  updatepayrollCon,
  deletepayrollCon,
  getattendanceCon,
  insertattendanceCon,
  updateattendanceCon,
  deleteattendanceCon,
  getleave_requestsCon,
  insertleave_requestCon,
  updateleave_requestsCon,
  deleteleave_requestsCon,
} from "./controllers/empCon.js";

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// EMPLOYEES
app.get("/api/employees", getEmployee_infoCon);
app.post("/api/employees", insertEmployee_infoCon);
app.patch("/api/employees/:employee_id", updateEmployee_infoCon);
app.delete("/api/employees/:employee_id", deleteEmployee_infoCon);

// PAYROLL
app.get("/api/payroll", getpayrollCon);
app.post("/api/payroll", insertpayrollCon);
app.patch("/api/payroll/:id/:employee_id", updatepayrollCon);
app.delete("/api/payroll/:id", deletepayrollCon);

// ATTENDANCE
app.get("/api/attendance", getattendanceCon);
app.post("/api/attendance", insertattendanceCon);
app.patch("/api/attendance/:attendance_id/:employee_id", updateattendanceCon);
app.delete("/api/attendance/:attendance_id", deleteattendanceCon);

// LEAVE REQUESTS
app.get("/api/leave_requests", getleave_requestsCon);
app.post("/api/leave_requests", insertleave_requestCon);
app.patch(
  "/api/leave_requests/:leave_id/:employee_id",
  updateleave_requestsCon,
);
app.delete("/api/leave_requests/:leave_id", deleteleave_requestsCon);

app.post("/api/employees", async (req, res) => {
  const { name, position, department, salary, contact, employment_history } =
    req.body;
  const result = await insertEmployee_InfoDb(
    name,
    position,
    department,
    salary,
    employment_history,
    contact,
  );
  res.json(result);
});

app.delete("/api/employees/:id", async (req, res) => {
    const { id } = req.params;
    const result = await deleteEmployee_infoDb(id);
    res.json(result);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
