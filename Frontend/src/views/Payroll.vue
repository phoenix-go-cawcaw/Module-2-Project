<script>
import { ref, computed, onMounted } from 'vue'
import employeesData from '@/stores/employee_info.json'
import payslipsData from '@/stores/payroll_data.json'
import jsPDF from 'jspdf';

export default {
    name: 'PayrollView',
    setup() {
        const search = ref("")
        const selectedEmployee = ref(null)
        const employees = ref([])
        const payslips = ref([])

        const filteredEmployees = computed(() => {
            
            if (!search.value) return employees.value
            
            return employees.value.filter(emp =>
                emp.name.toLowerCase().includes(search.value.toLowerCase())
            )
        })

        function selectEmployee(emp) {
            console.log(payslips.value.payrollData);
            console.log(emp);
            
            const employeePayslips = payslips.value.filter(p => p.employeeId === emp.employeeId)
            selectedEmployee.value = {
                ...emp,
                payslips: employeePayslips
            }
            search.value = ""
        }

        function clearSelection(){
            selectedEmployee.value = null
            search.value = ""
        }

        function generatePayslip(slip){
            const employee = selectedEmployee.value

            const doc =  new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            doc.setProperties({
                title: `Payslip - ${employee.name} - ${slip.month}`,
                subject: 'Monthly Payslip',
                author: 'ModernTech Solutions',
                creator: 'HR Payroll System'
            })

            const primaryColor = '#2c3e50'
            const accentColor = '#3498db'
            const sucessColor = '#27ae60'

            // doc.setFillColor(44, 62, 80)
            // doc.rect(0, 0, 210, 25, 'F')

            doc.setTextColor(44, 62, 80)
            doc.setFontSize(20)
            doc.setFont('helvetica', 'bold')
            doc.text('ModernTech Solutions', 110, 20, {align: 'center'})

            doc.setFontSize(14)
            doc.text('Monthly Payslip', 110, 27, {align: 'center'})

            doc.setTextColor(0, 0, 0)

            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(44, 62, 80)
            doc.text('Employee Details', 20, 40)

            doc.setDrawColor(52, 152, 219)
            doc.setLineWidth(0.5)
            doc.line(20,42,190,42)

            doc.setFontSize(11)
            doc.setFont('helvetica', 'bold')
            doc.text('Name:', 20, 50)
            doc.text('Employee ID:', 20, 56)
            doc.text('Position:', 20, 62)
            doc.text('Department:', 20, 68)
            doc.text('Pay Period:', 20, 74)

            doc.setFont('helvetica', 'normal')
            doc.text(String(employee.name), 60, 50)
            doc.text(String(employee.employeeId), 60, 56)
            doc.text(String(employee.position), 60, 62)
            doc.text(String(employee.department || 'N/A'), 60, 68)
            doc.text(String(slip.month), 60, 74)

            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(44, 62, 80)
            doc.text('Payment Details', 20, 90)
            doc.line(20, 92, 190, 92)

            doc.setFontSize(11)
            doc.setFont('helvetica', 'bold')

            const startY = 100
            const col1X = 20
            const col2X = 130

            doc.text('Hours Worked', col1X, startY)
            doc.text('Hourly Rate', col1X, startY + 6)
            doc.text('Gross Salary', col1X, startY + 12)
            doc.text('Leave Deductions', col1X, startY + 18)
            
            const hourlyRate = slip.finalSalary / slip.hoursWorked
            const grossSalary = slip.hoursWorked * hourlyRate
            doc.text(String(slip.hoursWorked), col2X, startY)
            doc.text(`R${hourlyRate.toFixed(2)}`, col2X, startY +6)
            doc.text(`R${grossSalary.toFixed(2)}`, col2X, startY +12)
            doc.text(`R${(slip.leaveDeductions || 0).toFixed(2)}`, col2X, startY +18)

            const netSalaryY = startY + 30
            doc.setFillColor(39, 174, 96)
            doc.roundedRect(20, netSalaryY, 170, 15, 3, 3, 'F')

            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(255, 255, 255)
            doc.text('NET SALARY PAYABLE', 105, netSalaryY +7, {align: 'center'})

            doc.setFontSize(16)
            doc.text(`R ${slip.finalSalary.toFixed(2)}`, 105, netSalaryY + 13, {align: 'center'})

            const summaryY = netSalaryY + 25

            doc.setFillColor(248, 249, 250)
            doc.roundedRect(20, summaryY, 170, 25, 3, 3, 'F')
    
            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(44, 62, 80)
            doc.text('Payment Summary', 105, summaryY + 8, {align: 'center'})
    
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(100, 100, 100)
            doc.text('Payment Method: Electronic Transfer', 105, summaryY + 16,{align: 'center'})
            doc.text('Payment Date: Last working day of the month', 105, summaryY + 22,{align: 'center'})


            const footerY = 250

            doc.setDrawColor(200, 200, 200)
            doc.line(20, footerY, 190, footerY)

            doc.setFontSize(9)
            doc.setFont('helvetica', 'italic')
            doc.setTextColor(100, 100, 100)
            doc.text(`Generated: ${new Date().toLocaleString()}`, 20, footerY + 5)
            doc.text('This is an official payslip from ModernTech Solutions', 105, footerY + 5, {align: 'center'})
            // doc.text('Confidential Document', 190, footerY + 5, {align: 'right'})

            doc.setFontSize(8)
            doc.text('HR Department: hr@moderntechsolutions.co.za | Tel: (011) 123-4567', 105, footerY + 12,{align: 'center'})

            doc.setDrawColor(220, 220, 220)
            doc.rect(10, 10, 190, 277)
        //  -${slip.month.replace(/\s+/g,'-')
            const fileName = 'payslip'
            doc.save(`${fileName}.pdf`)

        }

        onMounted(() => {
            employees.value = Array.isArray(employeesData) ? employeesData:
                              employeesData.employeeInformation || employeesData.employees || []
            payslips.value = Array.isArray(payslipsData) ? payslipsData:
                             payslipsData.payrollData || payslipsData.payslips || []
            
            console.log('Employees loaded:', employees.value.length)
            console.log('Payslips loaded:', payslips.value.length)
        })
        return {
            search,
            selectedEmployee,
            filteredEmployees,
            selectEmployee,
            clearSelection,
            generatePayslip
        }
    }
}
</script>

<template>
    <div class="payroll-container">
        <h1 class="page-title">Payroll Management</h1>
        
        <div class="search-container">
            <input 
                v-model="search" 
                class="search-input" 
                placeholder="Search employees by name..."
                :disabled="selectedEmployee !== null"
            >
        </div>

        <div v-if="filteredEmployees.length > 0 && !selectedEmployee" class="employee-list-container"> 
        <!-- <div v-if="true" class="employee-list-container"> -->
            <h3 class="search-title">Search Results:</h3>
            <ul class="employee-list">
                <li v-for="(emp,i) in filteredEmployees" :key="emp.employeeId ||i" class="emp-item" @click="selectEmployee(emp)">
                    <div class="emp-info">
                        <span class="emp-name">{{ emp.name }}</span>
                        <span class="emp-position">{{ emp.position }}</span>
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
            </div>
            
            <div class="employee-header">
                <h2>{{ selectedEmployee.name }}</h2>
                <p class="employee-position">{{ selectedEmployee.position }}</p>
                <p class="employee-id">ID: {{ selectedEmployee.employeeId }}</p>
            </div>

            <h3 class="payslips-title">Payslips ({{ selectedEmployee.payslips.length }})</h3>
            
            <div v-if="selectedEmployee.payslips.length > 0" class="payslips-grid">
                <div v-for="slip in selectedEmployee.payslips" :key="`${slip.month} + ${slip.employeeId}`" class="payslip-card">
                    <div class="payslip-header">
                        <strong class="month">{{ slip.month }}</strong>
                        <span class="salary">R{{ (slip.finalSalary).toLocaleString() }}</span>
                    </div>

                    <button @click="generatePayslip(slip)" class="generate-btn">Download PDF</button>
                    <div class="payslip-details">
                        <div class="detail-row">
                            <span>Hours Worked:</span>
                            <span class="value">{{ slip.hoursWorked }}</span>
                        </div>
                        <div class="detail-row">
                            <span>Leave Deductions:</span>
                            <span class="value deduction">R{{ slip.leaveDeductions.toLocaleString() }}</span>
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
            </div>
        </div>

        <div v-if="!selectedEmployee && !search" class="instruction">
            <p>Type in the search box above to find employees and view their payslips</p>
        </div>
    </div>
</template>


<style>
.payroll-container{
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    min-height: calc(100vh - 120px);
}

.page-title{
    margin-bottom: 30px;
    color: #2c3e50;
    font-size: 2rem;
    text-align: center;
}

.dark-mode .page-title{
    margin-bottom: 30px;
    color: #d8d8d8;
    font-size: 2rem;
    text-align: center;
}

.dark-mode .search-title{
    color: #d8d8d8;
}

.search-container{
    margin-bottom: 30px;
}

.search-input{
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.search-input:focus{
    outline: none;
    border-color: #3498db;
}

.search-input:disabled{
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.employee-list{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    margin-top: 20px;
    list-style: none;
    padding: 0;
}

.emp-item{
    background: white;
    border-radius: 10px;
    border: 1px solid black;
    padding: 20px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dark-mode .emp-item{
    background: #3f3f3f;
    border-radius: 10px;
    border: 1px solid rgb(255, 255, 255);
    padding: 20px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.emp-item:hover{
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #3498db;
}

.emp-info{
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.emp-name{
    font-weight: 600;
    font-size: 1.1rem;
    color: #2c3e50;
}

.dark-mode .emp-name{
    font-weight: 600;
    font-size: 1.1rem;
    color: #d8d8d8;
}

.emp-position{
    font-size: 0.9rem;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 500;
    background: #f8f9fa;
    color: #666;
    display: inline-block;
    width: fit-content;
}

.dark-mode .emp-position{
    font-size: 0.9rem;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 500;
    background: #3f3f3f;
    color: #666;
    display: inline-block;
    width: fit-content;
}

.emp-arrow{
    color: #3498db;
    font-size: 2rem;
    font-weight: bold;
}

.no-results{
    text-align: center;
    padding: 40px;
    color: #666;
    background: #f8f9fa;
    border-radius: 8px;
    margin-top: 20px;
}

.employee-card{
    background: white;
    border-radius: 16px;
    padding: 32px;
    border: 1px solid black;
    margin-top: 24px;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from{opacity:0; transform: translateY(10px);}
    to{opacity: 1; transform: translateY(0);}
}

.employee-card-header{
    margin-bottom: 24px;
}

.back-btn{
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

.back-btn:hover{
    color: #2980b9;
    text-decoration: underline;
}

.employee-header{
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e0e0e0;
}

.employee-header h2{
    margin: 0 0 8px 0;
    font-size: 1.8rem;
    color: #2c3e50;
}

.dark-mode .employee-header h2{
    margin: 0 0 8px 0;
    font-size: 1.8rem;
    color: #d8d8d8;
}

.employee-position{
    font-weight: 600;
    font-size: 1.1rem;
    margin: 0 0 8px 0;
    color: #666;
}
.employee-id{
    margin: 0;
    color: #888;
    font-size: 0.9rem;
}

.payslips-title{
    margin: 0 0 24px 0;
    font-size: 1.5rem;
    color: #2c3e50;
}

.dark-mode .payslips-title{
    margin: 0 0 24px 0;
    font-size: 1.5rem;
    color: #d8d8d8;
}

.payslips-grid{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.payslip-card{
    background: white;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #e0e0e0;
    transition: all 0.3s;
}

.payslip-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;
}

.month{
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
}

.salary{
    font-weight: 700;
    font-size: 1.3rem;
    padding: 6px 12px;
    border-radius: 6px;
    background: #27ae60;
    color: white;
}

 .generate-btn{
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

.generate-btn:hover{
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(41, 128, 185, 0.3);
} 

.payslip-details{
    margin-top: 20px;
}

.detail-row{
    display:flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child{
    border-bottom: none;
}
.detail-row.total{
    padding-top: 15px;
    margin-top: 10px;
    border-top: 2px solid #3498db;
    font-weight: bold;
}

.detail-row span:first-child{
    color: #666;
}

.value{
    font-weight: 600;
    color: #2c3e50;
}

.deduction{
    color: #e74c3c;
}

.total-salary{
    color: #27ae60;
    font-size: 1.1rem;
}

.no-payslips{
    text-align: center;
    padding: 40px;
    color: #666;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.instruction{
    text-align: center;
    padding: 40px;
    color: #666;
    background: #f8f9fa;
    border-radius: 8px;
    margin-top: 20px;
}

.dark-mode .instruction{
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

@media (max-width:425px){
    .payslips-grid{
        grid-template-columns: 1fr
    }
    .employee-list {
        grid-template-columns: 1fr;
    }
    .payroll-container{
        padding: 20px
    }
    .employee-card{
        padding: 20px;
    }
}

@media print{
    .search-container, .generate-btn, .back-btn{
        display: none !important;
    }
}
</style>
