<script setup>
import { ref, computed, onMounted } from 'vue';
import employeeData from '@/stores/employee_info.json';
import attendanceData from '@/stores/attendance.json'

const selectedDepartment = ref('all')
const selectedPerformance = ref('all')
const activeCategory = ref('top')
const employees = ref([])

onMounted(() => {
    loadAndProcessData()
    console.log(overallStats);
     
})

function loadAndProcessData() {
    employees.value = employeeData.employeeInformation.map(emp => {
        // console.log(attendanceData);
        const attendanceRecord = attendanceData.attendanceAndLeave.find(a => a.employeeId === emp.employeeId)

        const attendance = attendanceRecord?.attendance || []
        const presentDays = attendance.filter(a => a.status === 'Present').length
        const totalDays = attendance.length
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

        let performanceLevel = 'good'
        let evaluationNotes = 'Consistent attendance and performance.'
        let recommendation = 'Continue current practices.'
        let concerns = []
        let actions = []

        if (attendancePercentage >= 90) {
            performanceLevel = 'Excellent'
            evaluationNotes = 'Exceptional attendance record.'
            recommendation = 'Consider for recognition.'
        } else if (attendancePercentage >= 80) {
            performanceLevel = 'Good'
            evaluationNotes = 'Reliable attendance with minor absences.'
            recommendation = 'Monitor for consistency.'
        } else {
            performanceLevel = 'Needs improvement'
            evaluationNotes = 'Attendance below acceptable levels.'
            concerns = ['Frequent absences affecting productivity']
            actions = ['Schedule performance review', 'Discuss attendance issues']
            recommendation = 'Immediate follow-up required.'
        }

        const leaveRequests = attendanceRecord?.leaveRequests || []
        const pendingRequests = leaveRequests.filter(l => l.status === 'pending' && l.date.includes('2024'))
        if (pendingRequests.length > 0) {
            concerns.push('Old pending leave requests')
            actions.push('Resolve 2024 leave requests')
        }
        return {
            ...emp,
            ...attendanceRecord,
            presentDays,
            totalDays,
            absences: attendance.filter(a => a.status === 'Absent').length,
            attendancePercentage,
            performanceLevel,
            evaluationNotes,
            recommendation,
            concerns,
            actions
        }
    })
}

const departments = computed(() => {
    return [...new Set(employees.value.map(emp => emp.department))].sort()
})

const filteredEmployees = computed(() => {
    let filtered = employees.value

    if (selectedDepartment.value !== 'all') {
        filtered = filtered.filter(emp => emp.department === selectedDepartment.value)
    }

    if (selectedPerformance.value !== 'all') {
        switch (selectedPerformance.value) {
            case 'excellent':
                filtered = filtered.filter(emp => emp.attendancePercentage >= 90)
                break
            case 'good':
                filtered = filtered.filter(emp => emp.attendancePercentage >= 80 && emp.attendancePercentage < 90)
                break
            case 'needs-improvement':
                filtered = filtered.filter(emp => emp.attendancePercentage < 80)
                break
        }
    }

    return filtered
})

const topPerformers = computed(() => {
    return filteredEmployees.value.filter(emp => emp.attendancePercentage >= 90)
})

const satisfactoryEmployees = computed(() => {
    return filteredEmployees.value.filter(emp =>
        emp.attendancePercentage >= 80 && emp.attendancePercentage < 90
    )
})

const needsAttention = computed(() => {
    return filteredEmployees.value.filter(emp => emp.attendancePercentage < 80)
})

const totalEmployees = computed(() => employees.value.length)

const overallStats = computed(() => {
    const count = employees.value.length
    console.log(count)
    if (count === 0) {
        return {
            averageAttendance: 0,
            topPerformersCount: 0,
            needsAttentionCount: 0
        }
    }

    const totalAttendance = employees.value
        .reduce((sum, emp) => sum + emp.attendancePercentage, 0)

    const avgAttendance = Math.round(totalAttendance / count)

    return {
        averageAttendance: avgAttendance,
        topPerformersCount: employees.value.filter(emp => emp.attendancePercentage >= 90).length,
        needsAttentionCount: employees.value.filter(emp => emp.attendancePercentage < 80).length
    }
})

function setActiveCategory(category) {
    activeCategory.value = category
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('')
}

function getLeaveStatusClass(emp) {
    const pendingRequests = emp.leaveRequests?.filter(l => l.status === 'Pending' && l.date.includes('2024'))
    return pendingRequests?.length > 0 ? 'warning' : 'good'
}

function getLeaveStatusText(emp) {
    const pendingRequests = emp.leaveRequests?.filter(l => l.status === 'Pending' && l.date.includes('2024'))
    return pendingRequests?.length > 0 ? 'Pending 2024 requests' : 'Up to date'
}

function getAttendanceStatusClass(emp) {
    return emp.attendancePercentage >= 85 ? 'good' : 'warning'
}

function getAttendanceStatus(emp) {
    return emp.attendancePercentage >= 85 ? 'Acceptable' : 'Needs monitoring'
}

function showDetails(emp) {
    console.log('Showing details for:', emp.name)
}

function scheduleReview(emp) {
    console.log('Scheduling review for:', emp.name)
}
</script>

<template>
    <div class="performance-evaluation">
        <div class="header-section">
            <h1 class="page-title">
                Employee Performance Evaluation
            </h1>
            <p class="subtitle">
                Analysis Based on Attendance and Work Records
            </p>
            <div class="evaluation-period">
                <span class="period-label"> Evaluation Period: </span>
                <span class="period-value"> July 2025 </span>
            </div>
        </div>
        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-icon"> <i class="bi bi-people-fill"> </i> </div>
                <div class="stat-content">
                    <h3> Total Employees </h3>
                    <div class="stat-value">{{ totalEmployees }} </div>
                    <div class="stat-label"> Across all departments </div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"> <i class="bi bi-card-checklist"> </i> </div>
                <div class="stat-content">
                    <h3> Average Attendance </h3> 
                    <div class="stat-value">{{ overallStats.value?.averageAttendance }}</div>
                    <div class="stat-label"> Monthly Average </div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"> <i class="bi bi-award"> </i> </div>
                <div class="stat-content">
                    <h3> Top Performers </h3>
                    <div class="stat-value">{{ overallStats.value?.topPerformersCount }} </div>
                    <div class="stat-label"> 90%+ Attendance </div>
                </div>
            </div>
            <div class="stat-card warning">
                <div class="stat-icon"> <i class="bi bi-exclamation-triangle-fill"></i> </div>
                <div class="stat-content">
                    <h3> Needs Attention </h3>
                    <div class="stat-value">{{ overallStats.value?.needsAttentionCount }}</div>
                    <div class="stat-label"> Requires Follow-up </div>
                </div>
            </div>
        </div>

        <div class="categories-section">
            <div class="category-tabs">
                <button @click="setActiveCategory('top')" :class="['tab-btn', { active: activeCategory === 'top' }]">
                    Top Performers ({{ topPerformers?.length }})
                </button>
                <button @click="setActiveCategory('average')"
                    :class="['tab-btn', { active: activeCategory === 'average' }]">
                    Satisfactory ({{ satisfactoryEmployees?.length }})
                </button>
                <button @click="setActiveCategory('needs-attention')"
                    :class="['tab-btn', { active: activeCategory === 'needs-attention' }, 'warning']">
                    Needs Attention ({{ needsAttention?.length }})
                </button>
            </div>
        </div>

        <div class="performance-details">
            <div v-if="activeCategory === 'top'" class="category-content">
                <h3>Top Performers - 90%+ Attendance</h3>
                <div class="employee-cards">
                    <div v-for="emp in topPerformers" :key="emp.employeeId" class="employee-card excellent">
                        <div class="employee-header">
                            <div class="employee-avatar">{{ getInitials(emp.name) }}</div>
                            <div class="employee-info">
                                <h4>{{ emp.name }}</h4>
                                <p class="employee-position">{{ emp.position }}</p>
                                <p class="employee-dept">{{ emp.department }}</p>
                            </div>
                            <div class="performance-badge">Excellent</div>
                        </div>
                        <div class="performance-metrics">
                            <div class="metric">
                                <span class="metric-label">Attendance:</span>
                                <span class="metric-value excellent">{{ emp.attendancePercentage }}%</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Present Days:</span>
                                <span class="metric-value">{{ emp.presentDays }}/{{ emp.totalDays }}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Leave Status:</span>
                                <span :class="['metric-value', getLeaveStatusClass(emp)]">
                                    {{ getLeaveStatusText(emp) }}
                                </span>
                            </div>
                        </div>
                        <div class="employee-notes">
                            <p><strong>Evaluation:</strong> {{ emp.evaluationNotes }}</p>
                            <p><strong>Recommendation:</strong> {{ emp.recommendation }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="activeCategory === 'average'" class="category-content">
                <h3>Satisfactory Performance - 80-89% Attendance</h3>
                <div class="employee-cards">
                    <div v-for="emp in satisfactoryEmployees" :key="emp.employeeId" class="employee-card good">
                        <div class="employee-header">
                            <div class="employee-avatar">{{ getInitials(emp.name) }}</div>
                            <div class="employee-info">
                                <h4>{{ emp.name }}</h4>
                                <p class="employee-position">{{ emp.position }}</p>
                                <p class="employee-dept">{{ emp.department }}</p>
                            </div>
                            <div class="performance-badge"> Good </div>
                        </div>
                        <div class="performance-metrics">
                            <div class="metric">
                                <span class="metric-label">Attendance:</span>
                                <span class="metric-value good">{{ emp.attendancePercentage }}%</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Absences:</span>
                                <span class="metric-value">{{ emp.absences }}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Status:</span>
                                <span :class="['metric-value', getAttendanceStatusClass(emp)]">
                                    {{ getAttendanceStatus(emp) }}
                                </span>
                            </div>
                        </div>
                        <div class="employee-actions">
                            <button @click="showDetails(emp)" class="action-btn">View Details</button>
                            <button @click="scheduleReview(emp)" class="action-btn secondary">Schedule Review</button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="activeCategory === 'needs-attention'" class="category-content">
                <h3>Requires Attention - Below 80% Attendance</h3>
                <div class="employee-cards">
                    <div v-for="emp in needsAttention" :key="emp.employeeId" class="employee-card warning">
                        <div class="employee-header">
                            <div class="employee-avatar">{{ getInitials(emp.name) }}</div>
                            <div class="employee-info">
                                <h4>{{ emp.name }}</h4>
                                <p class="employee-position">{{ emp.position }}</p>
                                <p class="employee-dept">{{ emp.department }}</p>
                            </div>
                            <div class="performance-badge warning">! Needs Attention !</div>
                        </div>
                        <div class="performance-metrics">
                            <div class="metric">
                                <span class="metric-label">Attendance:</span>
                                <span class="metric-value warning">{{ emp.attendancePercentage }}%</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Absences:</span>
                                <span class="metric-value">{{ emp.absences }}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Concerns:</span>
                                <span class="metric-value warning">{{ emp.concerns.join(', ') }}</span>
                            </div>
                        </div>
                        <div class="action-required">
                            <h4>Action Required:</h4>
                            <ul>
                                <li v-for="action in emp.actions" :key="action">{{ action }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<style>
.performance-evaluation {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    background: #f8fafc;
    min-height: 100vh;
}

.dark-mode .performance-evaluation {
    background: #121416;
}

.header-section {
    text-align: center;
    margin-bottom: 32px;
    padding: 24px;
    background: linear-gradient(135deg, #ffb340 0%, #4c4ba2 100%);
    color: #ffffff;
    border-radius: 16px;
}

.page-title {
    font-size: 2.5rem;
    margin-bottom: 8px;
}

.page-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 16px;
}

.evaluation-period {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.2);
    padding: 8px 16px;
    border-radius: 20px;
}

.summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 20px;
    transition: transform 0.3s ease;
}

.dark-mode .stat-card{
    background: rgb(41, 41, 41);
}

.stat-card:hover {
    transform: translateY(-4px);
}

.stat-card.warning {
    border-left: 4px solid #f97316;
}

.stat-icon {
    font-size: 2.5rem;
}

.stat-content h3 {
    margin: 0 0 8px 0;
    font-size: 1rem;
    color: #64748b;
}

.dark-mode .stat-content h3 {
    margin: 0 0 8px 0;
    font-size: 1rem;
    color: #d8d8d8;
}

.stat-value {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
}

.stat-label {
    color: #94a3b8;
    font-size: 0.875rem;
    margin: 0;
}

.filter-section {
    display: flex;
    gap: 20px;
    margin-bottom: 32px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    align-items: flex-end;
}

.dark-mode .filter-section{
    background: rgb(41, 41, 41);
}

.filter-group {
    flex: 1;
}

.filter-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #475569;
}

.filter-group select {
    width: 100%;
    padding: 10px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    background: white;
}

.reset-btn {
    padding: 10px 24px;
    background: #64748b;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
}

.reset-btn:hover {
    background: #475569;
}

.categories-section {
    margin-bottom: 32px;
}

.category-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 8px;
}

.tab-btn {
    padding: 12px 24px;
    background: #f1f5f9;
    border: none;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.dark-mode .tab-btn {
    padding: 12px 24px;
    background: rgb(117, 117, 117) ;
    border: none;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    color: white;
}

.tab-btn.active {
    background: #3b82f6;
    color: white;
}

.tab-btn.warning.active {
    background: #f97316;
}

.employee-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
}

.employee-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #10b981;
}

.dark-mode .employee-card {
    background: rgb(47, 47, 47);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #10b981;
}

.employee-card.excellent {
    border-left-color: #10b981;
}

.employee-card.good {
    border-left-color: #3b82f6;
}

.employee-card.warning {
    border-left-color: #f97316;
}

.employee-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.employee-avatar {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
}

.employee-info h4 {
    margin: 0;
    font-size: 1.2rem;
}

.employee-position {
    color: #64748b;
    margin: 4px 0;
    font-size: 0.9rem;
}

.dark-mode .employee-position {
    color: #e6e6e6;
    margin: 4px 0;
    font-size: 0.9rem;
}

.employee-dept {
    background: #e0f2fe;
    color: #0369a1;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    display: inline-block;
}

.performance-badge {
    margin-left: auto;
    padding: 4px 12px;
    background: #dcfce7;
    color: #166534;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
}

.performance-badge.warning {
    background: #fef3c7;
    color: #92400e;
}

.performance-metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
}

.metric {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;
}

.metric-label {
    color: #64748b;
}

.dark-mode .metric-label {
    color: #fefefe;
}

.metric-value {
    font-weight: 600;
    margin-left: 8px;
}

.metric-value.excellent {
    color: #10b981;
}

.metric-value.good {
    color: #3b82f6;
}

.metric-value.warning {
    color: #f97316;
}

.employee-notes {
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    margin-top: 16px;
}

.employee-notes p {
    margin: 8px 0;
    font-size: 0.9rem;
}

.action-required {
    background: #fef3c7;
    padding: 16px;
    border-radius: 8px;
    margin-top: 16px;
}

.action-required h4 {
    margin: 0 0 8px 0;
    color: #92400e;
}

.action-required ul {
    margin: 0;
    padding-left: 20px;
}

.action-required li {
    margin: 4px 0;
    color: #92400e;
}

.employee-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
}

.action-btn {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 8px;
    background: #3b82f6;
    color: white;
    cursor: pointer;
    font-weight: 500;
}

.action-btn.secondary {
    background: #64748b;
}

.action-btn.warning {
    background: #f97316;
}

.department-comparison {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dept-stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.dept-card {
    background: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
}

.dept-card h4 {
    margin: 0 0 16px 0;
    color: #1e293b;
}

.dept-metric {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;
}

.export-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.export-options {
    display: flex;
    gap: 16px;
    margin-top: 20px;
}

.export-btn {
    flex: 1;
    padding: 16px;
    border: none;
    border-radius: 8px;
    background: #10b981;
    color: white;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
}

.export-btn.secondary {
    background: #3b82f6;
}

.export-btn.warning {
    background: #f97316;
}

@media (max-width: 768px) {

    .performance-evaluation {
        padding: 16px;
    }

    .page-title {
        font-size: 1.8rem;
    }

    .subtitle {
        font-size: 0.95rem;
    }

    .summary-stats {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .employee-cards {
        grid-template-columns: 1fr;
    }

    .category-tabs {
        flex-direction: column;
        align-items: stretch;
    }

    .tab-btn {
        width: 100%;
        border-radius: 8px;
    }

    .employee-card {
        padding: 16px;
    }

    .employee-header {
        flex-direction: column;
        text-align: center;
    }

    .employee-avatar {
        width: 60px;
        height: 60px;
        font-size: 1.4rem;
    }

    .employee-info h4 {
        font-size: 1.1rem;
    }

    .performance-metrics {
        grid-template-columns: 1fr;
    }

    .employee-actions {
        flex-direction: column;
    }

    .action-btn {
        width: 100%;
    }

    .dept-stats {
        grid-template-columns: 1fr;
    }

    .export-options {
        flex-direction: column;
    }

    .export-btn {
        width: 100%;
    }
}
</style>