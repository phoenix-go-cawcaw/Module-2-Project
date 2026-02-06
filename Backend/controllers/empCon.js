import { pool } from "../pool.js";
import {
  getEmployee_infoDb,
  insertEmployee_InfoDb,
  updateEmployee_infoDb,
  deleteEmployee_infoDb,
  getpayrollDb,
  getattendanceDb,
  getleave_requestsDb,
  insertpayrollDb,
  insertattendanceDb,
  insertleave_requestDb,
  updateattendanceDb,
  updateleave_requestsDb,
  updatepayrollDb,
  deletepayrollDb,
  deleteattendanceDb,
  deleteleave_requestsDb,
} from "../models/empDb.js";

export const getEmployee_infoCon = async (req, res) => {
  try {
    const data = await getEmployee_infoDb();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

export const insertEmployee_infoCon = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { name, position, department, salary, employment_history, contact } =
      req.body;

    const empResult = await insertEmployee_InfoDb(
      name,
      position,
      department,
      salary,
      employment_history,
      contact,
    );
    const employee_id = empResult.insertId;

    await insertpayrollDb(employee_id, 160, 0, salary || 0);

    await conn.commit();

    res.status(201).json({
      message: "Employee added with default payroll",
      id: employee_id,
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to add employee" });
  } finally {
    conn.release();
  }
};

export const updateEmployee_infoCon = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const updates = req.body;

    await updateEmployee_infoDb(employee_id, updates);

    res.json({ message: "Employee updated" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to update employee", details: err.message });
  }
};

export const deleteEmployee_infoCon = async (req, res) => {
  try {
    const { employee_id } = req.params;
    await deleteEmployee_infoDb(employee_id);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

// PAYROLL
export const getpayrollCon = async (req, res) => {
  try {
    const data = await getpayrollDb();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payroll" });
  }
};

export const insertpayrollCon = async (req, res) => {
  try {
    const { employee_id, hours_worked, leave_deductions, final_salary } =
      req.body;
    const result = await insertpayrollDb(
      employee_id,
      hours_worked,
      leave_deductions,
      final_salary,
    );
    res.status(201).json({
      message: "Payroll added",
      id: result.insertId,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add payroll" });
  }
};

export const updatepayrollCon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { employee_id } = updates;

    await updatepayrollDb(id, updates, employee_id);

    res.json({ message: "Payroll updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update payroll" });
  }
};

export const deletepayrollCon = async (req, res) => {
  try {
    const { id } = req.params;
    await deletepayrollDb(id);
    res.json({ message: "Payroll deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete payroll" });
  }
};

// ATTENDANCE
export const getattendanceCon = async (req, res) => {
  try {
    const data = await getattendanceDb();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

export const insertattendanceCon = async (req, res) => {
  try {
    const { employee_id, attendance_date, status } = req.body;
    const result = await insertattendanceDb(
      employee_id,
      attendance_date,
      status,
    );
    res
      .status(201)
      .json({ message: "Attendance recorded", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record attendance" });
  }
};

export const updateattendanceCon = async (req, res) => {
  try {
    const { attendance_id } = req.params;
    const updates = req.body;
    const { employee_id } = updates;

    await updateattendanceDb(attendance_id, updates, employee_id);

    res.json({ message: "Attendance updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update attendance" });
  }
};

export const deleteattendanceCon = async (req, res) => {
  try {
    const { attendance_id } = req.params;
    await deleteattendanceDb(attendance_id);
    res.json({ message: "Attendance deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete attendance" });
  }
};

// LEAVE REQUESTS
export const getleave_requestsCon = async (req, res) => {
  try {
    const data = await getleave_requestsDb();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
};

export const updateleave_requestsCon = async (req, res) => {
  try {
    const { leave_id } = req.params;
    const updates = req.body;

    await updateleave_requestsDb(leave_id, updates);

    if (updates.status === "Approved") {
      const [[leave]] = await pool.query(
        "SELECT employee_id, leave_date FROM leave_requests WHERE leave_id = ?",
        [leave_id]
      );

      if (leave) {
        await insertattendanceDb(
          leave.employee_id,
          leave.leave_date,
          "Absent"
        );
      }
    }

    res.json({ message: "Leave request updated" });
  } catch (err) {
    console.error("UPDATE LEAVE ERROR:", err);
    res.status(500).json({
      error: "Failed to update leave request",
      details: err.message
    });
  }
};

export const insertleave_requestCon = async (req, res) => {
  try {
    const { employee_id, start_date, end_date, reason, status, leave_type } =
      req.body;

    const finalStatus = status || "Pending";
    const finalLeaveType = leave_type || "Annual";

    const result = await insertleave_requestDb(
      employee_id,
      start_date,
      end_date,
      reason,
      finalStatus,
      finalLeaveType,
    );

    res.status(201).json({
      message: "Leave request added",
      id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to add leave request",
      details: err.message,
    });
  }
};

export const deleteleave_requestsCon = async (req, res) => {
  try {
    const { leave_id } = req.params;
    await deleteleave_requestsDb(leave_id);
    res.json({ message: "Leave request deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete leave request" });
  }
};
