import { pool } from "../pool.js";

const getEmployee_infoDb = async () => {
  // query from MySQL in javascript
  let [data] = await pool.query("SELECT * FROM employee_info");
  return data;
};

const getpayrollDb = async () => {
  // query from MySQL in javascript
  let [data] = await pool.query("SELECT * FROM payroll");
  return data;
};

const getattendanceDb = async () => {
  // query from MySQL in javascript
  let [data] = await pool.query("SELECT * FROM attendance");
  return data;
};

const getleave_requestsDb = async () => {
  // query from MySQL in javascript
  let [data] = await pool.query("SELECT * FROM leave_requests");
  return data;
};

const insertEmployee_InfoDb = async (
  name,
  position,
  department,
  salary,
  employment_history,
  contact,
) => {
  let [data] = await pool.query(
    "INSERT INTO `employee_info` (`name`, `position`, `department`, `salary`, `employment_history`, `contact`) VALUES (?, ?, ?, ?, ?, ?);",
    [name, position, department, salary, employment_history, contact],
  );
  return data;
};

const insertpayrollDb = async (
  employee_id,
  hours_worked,
  leave_deductions,
  final_salary,
) => {
  let [data] = await pool.query(
    "INSERT INTO `payroll` (`employee_id`, `hours_worked` , `leave_deductions` , `final_salary`) VALUES (?, ?, ?, ?);",
    [employee_id, hours_worked, leave_deductions, final_salary],
  );
  return data;
};

const insertattendanceDb = async (employee_id, attendance_date, status) => {
  let [data] = await pool.query(
    "INSERT INTO `attendance` (`employee_id`,`attendance_date`, `status`) VALUES (?, ?, ?)",
    [employee_id, attendance_date, status],
  );
  return data;
};

const insertleave_requestDb = async (
  employee_id,
  start_date,
  end_date,
  reason,
  status,
  leave_type,
) => {
  let [data] = await pool.query(
    "INSERT INTO `leave_requests` (`employee_id`, `start_date`, `end_date`, `reason`, `status`, `leave_type`) VALUES (?, ?, ?, ?, ?, ?)",
    [employee_id, start_date, end_date, reason, status, leave_type],
  );
  return data;
};

const updateEmployee_infoDb = async (employee_id, updates) => {
  let fields = [];
  let values = [];

  if (updates.name) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.position) {
    fields.push("position = ?");
    values.push(updates.position);
  }
  if (updates.department) {
    fields.push("department = ?");
    values.push(updates.department);
  }
  if (updates.salary !== undefined && updates.salary !== null) {
    fields.push("salary = ?");
    values.push(updates.salary);
  }
  if (updates.employment_history) {
    fields.push("employment_history = ?");
    values.push(updates.employment_history);
  }
  if (updates.contact) {
    fields.push("contact = ?");
    values.push(updates.contact);
  }

  if (fields.length === 0) return;
  values.push(employee_id);

  const query = `
    UPDATE employee_info SET ${fields.join(", ")} WHERE (employee_id = ?);
`;
  await pool.query(query, values);
};

const updateattendanceDb = async (attendance_id, updates, employee_id) => {
  const fields = [];
  const values = [];

  if (updates.attendance_date) {
    fields.push("attendance_date = ?");
    values.push(updates.attendance_date);
  }

  if (updates.status) {
    fields.push("status = ?");
    values.push(updates.status);
  }

  if (fields.length === 0) return;

  values.push(attendance_id);
  values.push(employee_id);

  const query = `
    UPDATE attendance 
    SET ${fields.join(", ")} 
    WHERE (attendance_id = ? AND employee_id = ?);
    `;
  await pool.query(query, values);
};

const updateleave_requestsDb = async (leave_id, updates) => {
  const fields = [];
  const values = [];

  if (updates.leave_date) {
    fields.push("leave_date = ?");
    values.push(updates.leave_date);
  }

  if (updates.leave_type) {
    fields.push("leave_type = ?");
    values.push(updates.leave_type);
  }

  if (updates.status) {
    fields.push("status = ?");
    values.push(updates.status);
  }

  if (fields.length === 0) return;

  values.push(leave_id);

  const query = `
    UPDATE leave_requests
    SET ${fields.join(", ")}
    WHERE leave_id = ?;
  `;

  await pool.query(query, values);
};


const updatepayrollDb = async (id, updates, employee_id) => {
  const fields = [];
  const values = [];

  if (updates.hours_worked) {
    fields.push("hours_worked = ?");
    values.push(updates.hours_worked);
  }

  if (updates.final_salary) {
    fields.push("final_salary = ?");
    values.push(updates.final_salary);
  }

  if (updates.leave_deductions) {
    fields.push("leave_deductions = ?");
    values.push(updates.leave_deductions);
  }

  if (fields.length === 0) return;

  values.push(id);
  values.push(employee_id);

  const query = `
    UPDATE payroll
    SET ${fields.join(", ")} 
    WHERE (id = ? AND employee_id = ?);
    `;
  await pool.query(query, values);
};

const deleteEmployee_infoDb = async (employee_id) => {
  let [data] = await pool.query(
    "DELETE FROM employee_info WHERE employee_id = ?",
    [employee_id],
  );
  return data;
};

const deletepayrollDb = async (id) => {
  let [data] = await pool.query("DELETE FROM payroll WHERE id = ?", [id]);
  return data;
};

const deleteattendanceDb = async (attendance_id) => {
  let [data] = await pool.query(
    "DELETE FROM attendance WHERE attendance_id = ?",
    [attendance_id],
  );
  return data;
};

const deleteleave_requestsDb = async (leave_id) => {
  let [data] = await pool.query(
    "DELETE FROM leave_requests WHERE leave_id = ?",
    [leave_id],
  );
  return data;
};

export {
  getEmployee_infoDb,
  insertEmployee_InfoDb,
  updateEmployee_infoDb,
  deleteEmployee_infoDb,
  getpayrollDb,
  getattendanceDb,
  getleave_requestsDb,
  deletepayrollDb,
  deleteattendanceDb,
  deleteleave_requestsDb,
  insertpayrollDb,
  insertattendanceDb,
  insertleave_requestDb,
  updateattendanceDb,
  updateleave_requestsDb,
  updatepayrollDb,
};
