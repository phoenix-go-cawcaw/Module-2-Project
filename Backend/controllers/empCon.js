import { pool } from "../pool.js";

export const getEmployee_infoCon = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM employee_info");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

export const insertEmployee_infoCon = async (req, res) => {
  try {
    const { name, position, department, salary, employment_history, contact } = req.body;
    const [result] = await pool.query(
      "INSERT INTO employee_info (name, position, department, salary, employment_history, contact) VALUES (?, ?, ?, ?, ?, ?)",
      [name, position, department, salary, employment_history, contact]
    );
    res.status(201).json({ message: "Employee added", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add employee" });
  }
};

export const updateEmployee_infoCon = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { name, position, department, salary, employment_history, contact } = req.body;

    const fields =[];
    const values = [];

    if (name) fields.push("name = ?"), values.push(name);
    if (position) fields.push("position = ?"), values.push(position);
    if (department) fields.push("department = ?"), values.push(department);
    if (salary !== undefined) fields.push("salary = ?"), values.push(salary);
    if (employment_history) fields.push("employment_history = ?"), values.push(employment_history);
    if (contact) fields.push("contact = ?"), values.push(contact);

    if (fields.length ===0){
      return res.status(400).json({message: "No fields to update"});
    }

    values.push(employee_id);

    await pool.query(
      `UPDATE employee_info SET ${fields.join(",")} WHERE employee_id = ?`,
      values
    );

    res.json({ message: "Employee updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update employee",details:err });
  }
};

export const deleteEmployee_infoCon = async (req, res) => {
  try {
    const { employee_id } = req.params;
    await pool.query("DELETE FROM employee_info WHERE employee_id = ?", [
      employee_id,
    ]);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

//PAYROLL
export const getpayrollCon = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM payroll");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payroll" });
  }
};

export const insertpayrollCon = async (req, res) => {
  try {
    const { employee_id, hours_worked, leave_deductions, final_salary, month } = req.body;
    const [result] = await pool.query(
      "INSERT INTO payroll (employee_id, hours_worked, leave_deductions, final_salary, month) VALUES (?, ?, ?, ?, ?)",
      [employee_id, hours_worked, leave_deductions, final_salary, month]
    );
    res.status(201).json({ message: "Payroll added", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add payroll" });
  }
};

export const updatepayrollCon = async (req, res) => {
  try {
    const { id, employee_id } = req.params;
    const { hours_worked, leave_deductions, final_salary } = req.body;
    await pool.query(
      "UPDATE payroll SET hours_worked = ?, leave_deductions = ?, final_salary = ? WHERE id = ? AND employee_id = ?",
      [hours_worked, leave_deductions, final_salary, id, employee_id]
    );
    res.json({ message: "Payroll updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update payroll" });
  }
};

export const deletepayrollCon = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM payroll WHERE id = ?", [id]);
    res.json({ message: "Payroll deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete payroll" });
  }
};

//ATTENDANCE
export const getattendanceCon = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM attendance");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

export const insertattendanceCon = async (req, res) => {
  try {
    const { employee_id, date, status } = req.body;
    const [result] = await pool.query(
      "INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)",
      [employee_id, date, status]
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
    const { employee_id, date, status } = req.body;
    await pool.query(
      "UPDATE attendance SET employee_id = ?, date = ?, status = ? WHERE attendance_id = ?",
      [employee_id, date, status, attendance_id]
    );
    res.json({ message: "Attendance updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update attendance" });
  }
};

export const deleteattendanceCon = async (req, res) => {
  try {
    const { attendance_id } = req.params;
    await pool.query("DELETE FROM attendance WHERE attendance_id = ?", [
      attendance_id,
    ]);
    res.json({ message: "Attendance deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete attendance" });
  }
};

//LEAVE REQ
export const getleave_requestsCon = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM leave_requests");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
};

export const insertleave_requestCon = async (req, res) => {
  try {
    const { employee_id, start_date, end_date, reason, status } = req.body;
    const [result] = await pool.query(
      "INSERT INTO leave_requests (employee_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?)",
      [employee_id, start_date, end_date, reason, status]
    );
    res
      .status(201)
      .json({ message: "Leave request added", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add leave request" });
  }
};

export const updateleave_requestsCon = async (req, res) => {
  try {
    const { leave_id } = req.params;
    const { employee_id, start_date, end_date, reason, status } = req.body;
    await pool.query(
      "UPDATE leave_requests SET employee_id = ?, start_date = ?, end_date = ?, reason = ?, status = ? WHERE leave_id = ?",
      [employee_id, start_date, end_date, reason, status, leave_id]
    );
    res.json({ message: "Leave request updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update leave request" });
  }
};

export const deleteleave_requestsCon = async (req, res) => {
  try {
    const { leave_id } = req.params;
    await pool.query("DELETE FROM leave_requests WHERE leave_id = ?", [
      leave_id,
    ]);
    res.json({ message: "Leave request deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete leave request" });
  }
};