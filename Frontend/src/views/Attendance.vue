<template>
    <div class="attendance-container">
        <h1 class="page-title">Attendance Tracking</h1>

        <div class="filter-section">
            <div class="filter-group">
                <label for="month-filter">Select Month :</label>
                <input type="month" id="month-filter" v-model="selectedMonth" />
            </div>

            <div class="filter-group">
                <label for="status-filter">Filter by Status</label>
                <select id="status-filter" v-model="selectedStatus">
                    <option value="all">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="On Leave">On Leave</option>
                </select>
            </div>

            <button @click="resetFilters" class="reset-btn">Reset Filters</button>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <i class="bi bi-bar-chart-line-fill stat-icon"></i>
                <div class="stat-info">
                    <h4>Total Employees</h4>
                    <p class="stat-value">{{ totalEmployees }}</p>
                </div>
            </div>

            <div class="stat-card">
                <i class="bi bi-check2-square stat-icon"></i>
                <div class="stat-info">
                    <h4>Average Attendance</h4>
                    <p class="stat-value">{{ averageAttendance }}%</p>
                </div>
            </div>

            <div class="stat-card">
                <i class="bi bi-exclamation-triangle-fill stat-icon"></i>
                <div class="stat-info">
                    <h4>Absences</h4>
                    <p class="stat-value">{{ totalAbsences }}</p>
                </div>
            </div>

            <div class="stat-card">
                <i class="bi bi-tsunami stat-icon"></i>
                <div class="stat-info">
                    <h4>On Leave</h4>
                    <p class="stat-value">{{ totalOnLeave }}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="calendar-section">
        <h3>Attendance Calendar - {{ currentMonthName }}</h3>
        <div class="calendar-controls">
            <button @click="prevMonth" class="nav-btn">← Previous </button>
            <span class="current-month">{{ currentMonthName }} </span>
            <button @click="nextMonth" class="nav-btn">Next → </button>
        </div>

        <div class="calendar-grid">
            <div class="calendar-header" v-for="day in ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']" :key="day">
                {{ day }}
            </div>

            <div v-for="day in calendarDays" :key="day.date" class="calendar-day"
                :class="{ 'empty-day': !day.inMonth }">
                <div class="day-number">{{ day.day }}</div>
                <div v-if="day.inMonth" class="day-attendance">
                    <div v-for="record in getAttendanceForDate(day.date)" :key="record.employeeId" class="employee-dot"
                        :class="getStatusClass(record.status)" :title="`${record.name}: ${record.status}`">
                    </div>
                </div>
            </div>
        </div>

        <div class="calendar-legend">
            <div class="legend-item">
                <span class="legend-dot present"></span>Present
            </div>
            <div class="legend-item">
                <span class="legend-dot absent"></span>Absent
            </div>
            <div class="legend-item">
                <span class="legend-dot late"></span>Late
            </div>
            <div class="legend-item">
                <span class="legend-dot leave"></span>On Leave
            </div>
        </div>
    </div>

    <div class="table-section">
        <h3>Detailed Attendance Records</h3>
        <div class="table-container">
            <table class="attendance-table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Employee ID</th>
                        <th v-for="date in displayedDates" :key="date">{{ formatDate(date) }}</th>
                        <th>Present Days</th>
                        <th>Attendance %</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="employee in filteredAttendance" :key="employee.employeeId">
                        <td class="employee-name">
                            <strong>{{ employee.name }}</strong>
                        </td>

                        <td class="employee-id">{{ employee.employeeId }}</td>

                        <td v-for="date in displayedDates" :key="date" class="attendance-cell">
                            <span class="status-badge" :class="getStatusClass(getEmployeeStatus(employee, date))"
                                @click="openEditModal(employee, date)">
                                {{ getStatusInitial(getEmployeeStatus(employee, date)) }}
                            </span>
                        </td>

                        <td class="stat-cell">
                            <strong>{{ calculatePresentDays(employee) }}</strong>
                        </td>

                        <td class="stat-cell">
                            <div class="attendance-percentage">
                                <div class="percentage-bar">
                                    <div class="percentage-fill"
                                        :style="{ width: calculateAttendancePercentage(employee) + '%' }">
                                    </div>
                                </div>
                                <span>{{ calculateAttendancePercentage(employee) }}%</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">

            <div class="modal" @click.stop>
                <h3>Edit Attendance</h3>

                <p><strong>{{ selectedEmployee?.name }}</strong></p>

                <label>Status</label>
                <select v-model="editStatus">
                    <option>Present</option>
                    <option>Absent</option>
                    <option>Late</option>
                    <option>On Leave</option>
                </select>

                <div class="modal-actions">
                    <button @click="saveEdit">Save</button>
                    <button @click="closeEditModal">Cancel</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import attendanceData from '@/stores/attendance.json'

export default {
    name: 'AttendanceView',
    setup() {
        const showEditModal = ref(false)
        const selectedEmployee = ref(null)
        const editStatus = ref('Present')
        const selectedDate = ref(null)
        const attendanceRecords = ref([])
        const selectedMonth = ref(new Date().toISOString().slice(0, 7))

        const selectedStatus = ref('all')
        // const currentDate = ref(new Date())

        onMounted(() => {
            attendanceRecords.value = attendanceData.attendanceAndLeave || []
            console.log('Attendance data loaded:', attendanceRecords.value.length, 'employees')
        })

        const filteredAttendance = computed(() => {
            const [year, month] = selectedMonth.value.split('-').map(Number)

            return attendanceRecords.value.map(employee => {
                const filteredAttendance = employee.attendance.filter(record => {
                    const recordDate = new Date(record.date)
                    return recordDate.getFullYear() === year &&
                        recordDate.getMonth() + 1 === month
                })

                return {
                    ...employee,
                    attendance: filteredAttendance
                }
            })
        })

        const totalEmployees = computed(() => attendanceRecords.value.length)

        const averageAttendance = computed(() => {
            if (filteredAttendance.value.length === 0) return 0

            const totalDays = filteredAttendance.value.reduce((sum, emp) => {
                return sum + emp.attendance.length
            }, 0)

            const presentDays = filteredAttendance.value.reduce((sum, emp) => {
                const present = emp.attendance.filter(a => a.status === 'Present').length

                return sum + present
            }, 0)

            return totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
        })

        const totalAbsences = computed(() => {
            return filteredAttendance.value.reduce((sum, emp) => {
                return sum + emp.attendance.filter(a => a.status === 'Absent').length
            }, 0)
        })

        const totalOnLeave = computed(() => {
            return filteredAttendance.value.reduce((sum, emp) => {
                return sum + emp.attendance.filter(a => a.status === 'On Leave').length
            }, 0)
        })

        const currentMonthName = computed(() => {
            return new Date(selectedMonth.value + '-01').toLocaleDateString('en-US', {
                month: 'long', year: 'numeric'
            })
        })
        const currentYear = computed(() => {
            return new Date(selectedMonth.value + '-01').getFullYear()
        })

        const displayedDates = computed(() => {
            const [year, month] = selectedMonth.value.split('-').map(Number)
            const daysInMonth = new Date(year, month, 0).getDate()
            const dates = []

            for (let day = 1; day <= daysInMonth; day++) {
                dates.push(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`)
            }

            return dates.slice(21, 31)
        })

        const calendarDays = computed(() => {
            const [year, month] = selectedMonth.value.split('-').map(Number)
            const firstDay = new Date(year, month - 1, 1)
            const lastDay = new Date(year, month, 0)
            const daysInMonth = lastDay.getDate()

            const days = []

            const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
            for (let i = 0; i < startDay; i++) {
                days.push({ day: '', date: '', inMonth: false })
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
                days.push({ day, date, inMonth: true })
            }

            return days
        })
        function getEmployeeStatus(employee, date) {
            const record = employee.attendance.find(a => a.date === date)
            return record ? record.status : 'Not Recorded'
        }

        function calculatePresentDays(employee) {
            return employee.attendance.filter(a => a.status === 'Present').length
        }

        function calculateAttendancePercentage(employee) {
            const totalDays = employee.attendance.length
            const presentDays = employee.attendance.filter(a => a.status === 'Present').length
            return totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
        }

        function getAttendanceForDate(date) {
            const records = []
            filteredAttendance.value.forEach(employee => {
                const attendance = employee.attendance.find(a => a.date === date)
                if (attendance) {
                    records.push({
                        employeeId: employee.employeeId,
                        name: employee.name,
                        status: attendance.status
                    })
                }
            })
            return records.slice(0, 20)
        }
        function getStatusClass(status) {
            const statusMap = {
                'Present': 'present',
                'Absent': 'absent',
                'Late': 'late',
                'On Leave': 'leave',
                'Not recorded': 'not-recorded'
            }
            return statusMap[status] || 'not-recorded'
        }

        function getStatusInitial(status) {
            const initialMap = {
                'Present': 'P',
                'Absent': 'A',
                'Late': 'L',
                'On Leave': 'LV',
                'Not Recorded': '-'
            }
            return initialMap[status] || '-'
        }
        function formatDate(dateString) {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short'
            })
        }

        function prevMonth() {
            const date = new Date(selectedMonth.value + '-01')
            date.setMonth(date.getMonth() - 1)
            selectedMonth.value = date.toISOString().slice(0, 7)
        }

        function nextMonth() {
            const date = new Date(selectedMonth.value + '-01')
            date.setMonth(date.getMonth() + 1)
            selectedMonth.value = date.toISOString().slice(0, 7)
        }

        function resetFilters() {
            selectedMonth.value = new Date().toISOString().slice(0, 7)
            selectedStatus.value = 'all'
        }

        function openEditModal(employee, date) {
            selectedEmployee.value = employee
            selectedDate.value = date
            editStatus.value = this.getEmployeeStatus(employee, date)
            showEditModal.value = true
        }

        function closeEditModal() {
            showEditModal.value = false
            selectedEmployee.value = null
            selectedDate.value = null
        }

        function saveEdit() {
            const record = selectedEmployee.value.attendance.find(
                a => a.date === selectedDate.value
            )
            if (record) {
                record.status = editStatus.value
            } else {
                selectedEmployee.value.attendance.push({
                    date: selectedDate.value,
                    status: editStatus.value
                })
            }
            closeEditModal()
        }

        return {
            attendanceRecords,
            selectedMonth,
            selectedStatus,
            filteredAttendance,
            totalEmployees,
            averageAttendance,
            totalAbsences,
            totalOnLeave,
            currentMonthName,
            currentYear,
            displayedDates,
            calendarDays,
            getEmployeeStatus,
            calculatePresentDays,
            calculateAttendancePercentage,
            getAttendanceForDate,
            getStatusClass,
            getStatusInitial,
            formatDate,
            prevMonth,
            nextMonth,
            resetFilters,
            showEditModal,
            selectedEmployee,
            editStatus,
            openEditModal,
            closeEditModal,
            saveEdit
        }
    }
}

</script>

<style scoped>
.attendance-container {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    min-height: calc(100vh-120px);
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

.filter-section {
    display: flex;
    gap: 20px;
    align-items: flex-end;
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark-mode .filter-section {
    display: flex;
    gap: 20px;
    align-items: flex-end;
    margin-bottom: 30px;
    padding: 20px;
    background: #3f3f3f;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-group {
    flex: 1;
}

.filter-group label {
    display: block;
    margin-bottom: 8px;
    color: #2c3e50;
    font-weight: 500;
}

.dark-mode .filter-group label {
    display: block;
    margin-bottom: 8px;
    color: #d8d8d8;
    font-weight: 500;
}

.filter-group input,
.filter-group select {
    width: 100%;
    padding: 10px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
}

.reset-btn {
    padding: 10px 20px;
    background: #95a5a6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
}

.reset-btn:hover {
    background: #17d4e1;
    color: white;
}

.stats-section {
    margin-bottom: 30px;
    padding: 10px;
}

.stats-section h3 {
    margin-bottom: 20px;
    color: #2c3e50;
}

.dark-mode .stats-section h3 {
    margin-bottom: 20px;
    color: #d8d8d8;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

.stat-card {
    display: flex;
    flex-direction: column;
    margin-bottom: 0px;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark-mode .stat-card {
    display: flex;
    flex-direction: column;
    margin-bottom: 0px;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 20px;
    background: #3f3f3f;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    font-size: 2rem;
}

.stat-info h4 {
    margin: 0 0 5px 0;
    color: #7f8c8d;
    font-size: 0.9rem;
}

.dark-mode .stat-info h4 {
    margin: 0 0 5px 0;
    color: #d8d8d8;
    font-size: 0.9rem;
}

.stat-value {
    margin: 0;
    font-size: 1.8rem;
    font-weight: bold;
    color: #2c3e50;
}

.dark-mode .stat-value {
    margin: 0;
    font-size: 1.8rem;
    font-weight: bold;
    color: #d8d8d8;
}

.calendar-section {
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark-mode .calendar-section {
    margin-bottom: 30px;
    padding: 20px;
    background: #3f3f3f;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendar-section h3 {
    margin-bottom: 20px;
    color: #2c3e50
}

.dark-mode .calendar-section h3 {
    margin-bottom: 20px;
    color: #d8d8d8
}

.calendar-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.current-month {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2c3e50;
}

.dark-mode .current-month {
    font-size: 1.2rem;
    font-weight: bold;
    color: #d8d8d8;
}

.nav-btn {
    padding: 8px 16px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.nav-btn:hover {
    background: #2980b9;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    margin-bottom: 20px;
}

.calendar-header {
    text-align: center;
    padding: 10px;
    font-weight: bold;
    color: #2c3e50;
    background: #f8f9fa;
    border-radius: 6px;
}

.dark-mode .calendar-header {
    text-align: center;
    padding: 10px;
    font-weight: bold;
    color: #d8d8d8;
    background: #3f3f3f;
    border-radius: 6px;
}

.calendar-day {
    min-height: 80px;
    padding: 8px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    position: realative;
}

.empty-day {
    background: #f8f9fa;
    border: none;
}

.dark-mode .empty-day {
    background: #535353;
    border: none;
}

.day-number {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 12px;
    color: #7f8c8d;
}

.day-attendance {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.employee-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: help;
}

.employee-dot.present {
    background: #27ae60;
}

.employee-dot.absent {
    background: #e74c3c;
}

.employee-dot.late {
    background: #f39c12;
}

.employee-dot.leave {
    background: #3498db;
}

.calendar-legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.legend-dot {
    width: 15px;
    height: 15px;
    border-radius: 50%;
}

.legend-dot.present {
    background: #27ae60;
}

.legend-dot.absent {
    background: #e74c3c;
}

.legend-dot.late {
    background: #f39c12;
}

.legend-dot.leave {
    background: #3498db;
}

.table-section {
    margin-bottom: 30px;
}

.table-section h3 {
    margin-bottom: 20px;
    color: #2c3e50;
}

.dark-mode .table-section h3 {
    margin-bottom: 20px;
    color: #d8d8d8;
}

.table-container {
    overflow-x: auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark-mode .table-container {
    overflow-x: auto;
    background: #3f3f3f;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.attendance-table {
    width: 100%;
    border-collapse: collapse;
}

.attendance-table th {
    padding: 15px;
    text-align: left;
    background: #f8f9fa;
    color: #2c3e50;
    border-bottom: 2px solid #e0e0e0;
    white-space: nowrap;
}

.dark-mode .attendance-table th {
    padding: 15px;
    text-align: left;
    background: #3f3f3f;
    color: #d8d8d8;
    border-bottom: 2px solid #e0e0e0;
    white-space: nowrap;
}


.attendance-table td {
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0;
}

.employee-name {
    font-weight: 500;
    color: #2c3e50;
}

.dark-mode .employee-name {
    font-weight: 500;
    color: #d8d8d8;
}

.employee-id {
    color: #2c3e50;
    /* font-family: 'Courier New', monospace; */
    font-weight: bold;
    text-align: center;
}

.dark-mode .employee-id {
    color: #d8d8d8;
    /* font-family: 'Courier New', monospace; */
    font-weight: bold;
    text-align: center;
}

.attendance-cell {
    text-align: center;
}

.status-badge {
    display: inline-block;
    width: 30px;
    height: 30px;
    line-height: 30px;
    border-radius: 50%;
    color: white;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
}

.status-badge:hover {
    transform: scale(1.1);
    opacity: 0.9;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.dark-mode .status-badge {
    display: inline-block;
    width: 30px;
    height: 30px;
    line-height: 30px;
    border-radius: 50%;
    color: #3f3f3f;
    font-size: 12px;
    font-weight: bold;
}

.status-badge.present {
    background: #27ae60;
}

.status-badge.absent {
    background: #e74c3c;
}

.status-badge.late {
    background: #f39c12;
}

.status-badge.leave {
    background: #3498db;
}

.status-badge.not-recorded {
    background: #ecf0f1;
}

.stat-cell {
    text-align: center;
    font-weight: bold;
}

.attendance-percentage {
    display: flex;
    align-items: center;
    gap: 10px;
}

.percentage-bar {
    flex: 1;
    height: 8px;
    background: #ecf0f1;
    border-radius: 4px;
    overflow: hidden;
}

.percentage-fill {
    height: 100%;
    background: linear-gradient(90deg, #27ae60, #2ecc71);
    border-radius: 4px;
    transition: width 0.5s ease;
}

.stat-icon-large {
    font-size: 2.5rem;
    color: #3498db;
    margin-right: 15px;
    transition: all 0.3s ease;
}

.dark-mode .stat-icon-large {
    color: #5dade2;
}

.stat-card:hover .stat-icon-large {
    transform: scale(1.1);
    color: #2980b9;
}

.dark-mode .stat-card:hover .stat-icon-large {
    color: #3498db;
}

@media (max-width: 768px) {
    .filter-section {
        flex-direction: column;
        align-items: stretch;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .calendar-grid {
        gap: 2px;
    }

    .calendar-day {
        min-height: 60px;
        padding: 5px;
    }

    .employee-dot {
        width: 15px;
        height: 15px;
    }

    .attendance-table th,
    .attendance-table td {
        padding: 8px 10px;
        font-size: 14px;
    }

    .status-badge {
        width: 25px;
        height: 25px;
        line-height: 25px;
    }
}

@media (max-width: 480px) {
    .calendar-grid {
        grid-template-columns: repeat(7, 1fr);
        font-size: 12px;
    }

    .calendar-day {
        min-height: 50px;
    }
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.modal {
    background: white;
    padding: 20px;
    border-radius: 8px;
    min-width: 300px;
}

.modal-actions {
    display: flex;
    /* justify-content: center; */
    gap: 12px;
    margin: 20px;
}
</style>