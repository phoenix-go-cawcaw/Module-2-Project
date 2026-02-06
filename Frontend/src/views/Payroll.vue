<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import jsPDF from 'jspdf'

const API_BASE = 'http://localhost:5000/api'

export default {
  name: 'PayrollView',
  setup() {
    const search = ref('')
    const selectedEmployee = ref(null)
    const employees = ref([])
    const payrolls = ref([])
    const isLoading = ref(false)

    const fetchEmployees = async () => {
      const res = await axios.get(`${API_BASE}/employees`)
      employees.value = res.data || []
    }

    const fetchPayrolls = async () => {
      const res = await axios.get(`${API_BASE}/payroll`)
      payrolls.value = res.data || []
    }

    const filteredEmployees = computed(() => {
      if (!search.value) return employees.value
      return employees.value.filter(e =>
        e.name.toLowerCase().includes(search.value.toLowerCase())
      )
    })

    function selectEmployee(emp) {
      const employeePayrolls = payrolls.value.filter(
        p => p.employee_id === emp.employee_id
      )

      selectedEmployee.value = {
        ...emp,
        payslips: employeePayrolls.map(p => ({
          id: p.id,
          employeeId: p.employee_id,
          month: p.month_display,
          hoursWorked: Number(p.hours_worked) || 0,
          leaveDeductions: Number(p.leave_deductions) || 0,
          finalSalary: Number(p.final_salary) || 0,
          created_at: p.created_at
        }))
      }

      search.value = ''
    }

    function clearSelection() {
      selectedEmployee.value = null
      search.value = ''
    }

    async function addNewPayroll() {
      if (!selectedEmployee.value) return

      await axios.post(`${API_BASE}/payroll`, {
        employee_id: selectedEmployee.value.employee_id,
        hours_worked: 160,
        leave_deductions: 0,
        final_salary: Number(selectedEmployee.value.salary) || 0
      })

      await fetchPayrolls()
      selectEmployee(selectedEmployee.value)
    }

    async function updatePayroll(id, updates) {
      const slip = selectedEmployee.value.payslips.find(p => p.id === id)
      if (!slip) return

      if (updates.hours_worked !== undefined)
        slip.hoursWorked = Number(updates.hours_worked)

      if (updates.leave_deductions !== undefined)
        slip.leaveDeductions = Number(updates.leave_deductions)

      if (updates.final_salary !== undefined)
        slip.finalSalary = Number(updates.final_salary)

      await axios.put(`${API_BASE}/payroll/${id}`, {
        hours_worked: slip.hoursWorked,
        leave_deductions: slip.leaveDeductions,
        final_salary: slip.finalSalary
      })
    }

    async function deletePayroll(id) {
      if (!confirm('Delete this payroll entry?')) return
      await axios.delete(`${API_BASE}/payroll/${id}`)
      await fetchPayrolls()
      selectEmployee(selectedEmployee.value)
    }
    function generatePayslip(slip) {
      const employee = selectedEmployee.value

      const hoursWorked = Number(slip.hoursWorked) || 0
      const finalSalary = Number(slip.finalSalary) || 0
      const leaveDeductions = Number(slip.leaveDeductions) || 0
      const hourlyRate = hoursWorked > 0 ? finalSalary / hoursWorked : 0
      const grossSalary = hoursWorked * hourlyRate

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      doc.setProperties({
        title: `Payslip - ${employee.name} - ${slip.month}`,
        subject: 'Monthly Payslip',
        author: 'ModernTech Solutions',
        creator: 'HR Payroll System'
      })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(44, 62, 80)
      doc.text('ModernTech Solutions', 105, 20, { align: 'center' })

      doc.setFontSize(14)
      doc.text('Monthly Payslip', 105, 27, { align: 'center' })

      doc.setFontSize(16)
      doc.text('Employee Details', 20, 40)
      doc.setDrawColor(52, 152, 219)
      doc.line(20, 42, 190, 42)

      doc.setFontSize(11)
      doc.text('Name:', 20, 50)
      doc.text('Employee ID:', 20, 56)
      doc.text('Position:', 20, 62)
      doc.text('Department:', 20, 68)
      doc.text('Pay Period:', 20, 74)

      doc.setFont('helvetica', 'normal')
      doc.text(employee.name, 60, 50)
      doc.text(String(employee.employee_id), 60, 56)
      doc.text(employee.position, 60, 62)
      doc.text(employee.department || 'N/A', 60, 68)
      doc.text(slip.month, 60, 74)

      /* ===== PAYMENT DETAILS ===== */
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Payment Details', 20, 90)
      doc.line(20, 92, 190, 92)

      doc.setFontSize(11)
      doc.text('Hours Worked', 20, 100)
      doc.text('Hourly Rate', 20, 106)
      doc.text('Gross Salary', 20, 112)
      doc.text('Leave Deductions', 20, 118)

      doc.setFont('helvetica', 'normal')
      doc.text(String(hoursWorked), 130, 100)
      doc.text(`R${hourlyRate.toFixed(2)}`, 130, 106)
      doc.text(`R${grossSalary.toFixed(2)}`, 130, 112)
      doc.text(`R${leaveDeductions.toFixed(2)}`, 130, 118)

      doc.setFillColor(39, 174, 96)
      doc.roundedRect(20, 130, 170, 15, 3, 3, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.text('NET SALARY PAYABLE', 105, 137, { align: 'center' })

      doc.setFontSize(16)
      doc.text(`R ${finalSalary.toFixed(2)}`, 105, 143, { align: 'center' })

      doc.setTextColor(100)
      doc.setFontSize(9)
      doc.line(20, 250, 190, 250)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 255)
      doc.text(
        'This is an official payslip from ModernTech Solutions',
        105,
        255,
        { align: 'center' }
      )

      doc.rect(10, 10, 190, 277)

      const fileName = `payslip-${employee.name}-${slip.month}`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      doc.save(`${fileName}.pdf`)
    }

    onMounted(async () => {
      isLoading.value = true
      await Promise.all([fetchEmployees(), fetchPayrolls])
      isLoading.value = false
    })

    return {
      search,
      selectedEmployee,
      filteredEmployees,
      selectEmployee,
      clearSelection,
      addNewPayroll,
      updatePayroll,
      deletePayroll,
      generatePayslip,
      isLoading
    }
  }
}
</script>



<template>
    <div class="payroll-container">
        <h1 class="page-title">Payroll Management</h1>

        <div class="search-container">
            <input v-model="search" class="search-input" placeholder="Search employees by name..."
                :disabled="selectedEmployee !== null">
        </div>

        <div v-if="isLoading" class="loading">Loading payroll data...</div>

        <div v-if="filteredEmployees.length > 0 && !selectedEmployee" class="employee-list-container">
            <h3 class="search-title">Search Results:</h3>
            <ul class="employee-list">
                <li v-for="(emp, i) in filteredEmployees" :key="emp.employee_id || i" class="emp-item"
                    @click="selectEmployee(emp)">
                    <div class="emp-info">
                        <span class="emp-name">{{ emp.name }}</span>
                        <span class="emp-position">{{ emp.position }}</span>
                        <span class="emp-salary">Salary: R{{ emp.salary?.toLocaleString() || '0' }}</span>
                    </div>
                    <span class="emp-arrow">→</span>
                </li>
            </ul>
        </div>

        <div v-if="search && filteredEmployees.length === 0 && !selectedEmployee" class="no-results">
            No employees found for "{{ search }}"
        </div>

        <div v-if="selectedEmployee" class="employee-card">
            <div class="employee-card-header">
                <button @click="clearSelection" class="back-btn">← Back to search</button>
                <button @click="addNewPayroll" class="add-payroll-btn">+ Add Payroll Entry</button>
            </div>

            <div class="employee-header">
                <h2>{{ selectedEmployee.name }}</h2>
                <p class="employee-position">{{ selectedEmployee.position }} - {{ selectedEmployee.department }}</p>
                <p class="employee-id">ID: {{ selectedEmployee.employee_id }} | Base Salary: R{{
                    selectedEmployee.salary?.toLocaleString() || '0' }}</p>
            </div>

            <h3 class="payslips-title">Payslips ({{ selectedEmployee.payslips?.length || 0 }})</h3>

            <div v-if="selectedEmployee.payslips?.length > 0" class="payslips-grid">
                <div v-for="slip in selectedEmployee.payslips" :key="slip.id" class="payslip-card">
                    <div class="payslip-header">
                        <strong class="month">{{ slip.month }}</strong>
                        <span class="salary">R{{ slip.finalSalary.toLocaleString() }}</span>
                    </div>

                    <div class="payslip-actions">
                        <button @click="generatePayslip(slip)"
                            :disabled="slip.id && slip.id.toString().startsWith('temp_')" class="generate-btn">
                            {{ slip.id && slip.id.toString().startsWith('temp_') ? 'Save First' : 'Download PDF' }}
                        </button>
                        <button @click="deletePayroll(slip.id)" class="delete-btn">Delete</button>
                    </div>

                    <div class="payslip-details">
                        <div class="detail-row">
                            <span>Hours Worked:</span>
                            <input :value="slip.hoursWorked"
                                @change="e => updatePayroll(slip.id, { hours_worked: e.target.value })"
                                class="editable-field">
                        </div>
                        <div class="detail-row">
                            <span>Leave Deductions:</span>
                            <input :value="slip.leaveDeductions"
                                @change="e => updatePayroll(slip.id, { leave_deductions: e.target.value })"
                                class="editable-field">
                        </div>
                        <div class="detail-row">
                            <span>Final Salary:</span>
                            <input :value="slip.finalSalary"
                                @change="e => updatePayroll(slip.id, { final_salary: e.target.value })"
                                class="editable-field">
                        </div>
                        <div class="detail-row total">
                            <span>Net Salary:</span>
                            <span class="value total-salary">R{{ slip.finalSalary.toLocaleString() }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="no-payslips">
                <p>No payslips found for this employee</p>
                <button @click="addNewPayroll" class="add-first-payroll">Add First Payslip</button>
            </div>
        </div>

        <div v-if="!selectedEmployee && !search" class="instruction">
            <p>Type in the search box above to find employees and view their payslips</p>
        </div>
    </div>
</template>

<style>
.loading {
    text-align: center;
    padding: 40px;
    color: #666;
}

.emp-salary {
    font-size: 0.9rem;
    color: #27ae60;
    font-weight: 600;
}

.employee-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.add-payroll-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.add-payroll-btn:hover {
    background: #219653;
}

.payslip-actions {
    display: flex;
    gap: 10px;
    margin: 15px 0;
}

.delete-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    flex: 1;
}

.delete-btn:hover {
    background: #c0392b;
}

.editable-field {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px 8px;
    width: 80px;
    text-align: right;
}

.editable-field:focus {
    outline: none;
    border-color: #3498db;
}

.add-first-payroll {
    background: #3498db;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 20px;
}

.add-first-payroll:hover {
    background: #2980b9;
}

.payroll-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    min-height: calc(100vh - 120px);
}

.page-title {
    margin-bottom: 30px;
    color: #2c3e50;
    font-size: 2rem;
    text-align: center;
}

.dark-mode .page-title {
    margin-bottom: 30px;
    color: #d8d8d8;
    font-size: 2rem;
    text-align: center;
}

.dark-mode .search-title {
    color: #d8d8d8;
}

.search-container {
    margin-bottom: 30px;
}

.search-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.search-input:focus {
    outline: none;
    border-color: #3498db;
}

.search-input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.employee-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    margin-top: 20px;
    list-style: none;
    padding: 0;
}

.emp-item {
    background: white;
    border-radius: 10px;
    border: 1px solid black;
    padding: 20px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dark-mode .emp-item {
    background: #3f3f3f;
    border-radius: 10px;
    border: 1px solid rgb(255, 255, 255);
    padding: 20px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.emp-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #3498db;
}

.emp-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.emp-name {
    font-weight: 600;
    font-size: 1.1rem;
    color: #2c3e50;
}

.dark-mode .emp-name {
    font-weight: 600;
    font-size: 1.1rem;
    color: #d8d8d8;
}

.emp-position {
    font-size: 0.9rem;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 500;
    background: #f8f9fa;
    color: #666;
    display: inline-block;
    width: fit-content;
}

.dark-mode .emp-position {
    font-size: 0.9rem;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 500;
    background: #3f3f3f;
    color: #666;
    display: inline-block;
    width: fit-content;
}

.emp-arrow {
    color: #3498db;
    font-size: 2rem;
    font-weight: bold;
}

.no-results {
    text-align: center;
    padding: 40px;
    color: #666;
    background: #f8f9fa;
    border-radius: 8px;
    margin-top: 20px;
}

.employee-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    border: 1px solid black;
    margin-top: 24px;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.employee-card-header {
    margin-bottom: 24px;
}

.back-btn {
    background: none;
    border: none;
    color: #3498db;
    font-size: 16px;
    cursor: pointer;
    padding: 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: color 0.3s;
}

.back-btn:hover {
    color: #2980b9;
    text-decoration: underline;
}

.employee-header {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e0e0e0;
}

.employee-header h2 {
    margin: 0 0 8px 0;
    font-size: 1.8rem;
    color: #2c3e50;
}

.dark-mode .employee-header h2 {
    margin: 0 0 8px 0;
    font-size: 1.8rem;
    color: #d8d8d8;
}

.employee-position {
    font-weight: 600;
    font-size: 1.1rem;
    margin: 0 0 8px 0;
    color: #666;
}

.employee-id {
    margin: 0;
    color: #888;
    font-size: 0.9rem;
}

.payslips-title {
    margin: 0 0 24px 0;
    font-size: 1.5rem;
    color: #2c3e50;
}

.dark-mode .payslips-title {
    margin: 0 0 24px 0;
    font-size: 1.5rem;
    color: #d8d8d8;
}

.payslips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.payslip-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #e0e0e0;
    transition: all 0.3s;
}

.payslip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;
}

.month {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
}

.salary {
    font-weight: 700;
    font-size: 1.3rem;
    padding: 6px 12px;
    border-radius: 6px;
    background: #27ae60;
    color: white;
}

.generate-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    margin: 15px 0;
    width: 100%;
    font-weight: 600;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.generate-btn:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(41, 128, 185, 0.3);
}

.payslip-details {
    margin-top: 20px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-row.total {
    padding-top: 15px;
    margin-top: 10px;
    border-top: 2px solid #3498db;
    font-weight: bold;
}

.detail-row span:first-child {
    color: #666;
}

.value {
    font-weight: 600;
    color: #2c3e50;
}

.deduction {
    color: #e74c3c;
}

.total-salary {
    color: #27ae60;
    font-size: 1.1rem;
}

.no-payslips {
    text-align: center;
    padding: 40px;
    color: #666;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.instruction {
    text-align: center;
    padding: 40px;
    color: #666;
    background: #f8f9fa;
    border-radius: 8px;
    margin-top: 20px;
}

.dark-mode .instruction {
    text-align: center;
    padding: 40px;
    color: #d8d8d8;
    background: #3f3f3f;
    border-radius: 8px;
    margin-top: 20px;
}

.employee-list-container h3 {
    color: #2c3e50;
    margin-bottom: 15px;
    font-size: 1.2 rem;
}

.emp-item:active {
    transform: translateY(0)
}

@media (max-width:425px) {
    .payslips-grid {
        grid-template-columns: 1fr
    }

    .employee-list {
        grid-template-columns: 1fr;
    }

    .payroll-container {
        padding: 20px
    }

    .employee-card {
        padding: 20px;
    }
}

@media print {

    .search-container,
    .generate-btn,
    .back-btn {
        display: none !important;
    }
}
</style>
