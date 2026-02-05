import express from "express";

import {
  getEmployee_infoCon,
  insertEmployee_infoCon,
  updateEmployee_infoCon,
  deleteEmployee_infoCon
} from "../controllers/empCon.js";

const router = express.Router();

router.get("/employees", getEmployee_infoCon);
router.post("/employees", insertEmployee_infoCon);
router.put("/employees/:employee_id", updateEmployee_infoCon);
router.delete("/employees/:employee_id", deleteEmployee_infoCon);

export default router;
