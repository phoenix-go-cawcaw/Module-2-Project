<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const selectedDepartment = ref('all')
const selectedPerformance = ref('all')
const activeCategory = ref('top')
const employees = ref([])
const attendanceData = ref([])
const leaveRequests = ref([])
const isLoading = ref(true)

const fetchAllData = async () => {
    try {
        isLoading.value = true;
        const [employeesRes, attendanceRes, leaveRes] = await Promise.all([
            axios.get(`${API_BASE}/employees`),
            axios.get(`${API_BASE}/attendance`),
            axios.get(`${API_BASE}/leave_requests`)
        ]);

        employees.value = employeesRes.data || [];
        attendanceData.value = attendanceRes.data || [];
        leaveRequests.value = leaveRes.data || [];

        processPerformanceData();
    } catch (err) {
        console.error('Failed to fetch data:', err);
        alert('Failed to load performance data.');
    } finally {
        isLoading.value = false;
    }
}

const processPerformanceData = () => {
    employees.value = employees.value.map(emp => {
        const employeeAttendance = attendanceData.value.filter(a => a.employee_id === emp.employee_id);

        const presentDays = employeeAttendance.filter(a => a.status === 'Present').length;
        const totalDays = employeeAttendance.length;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        const employeeLeaves = leaveRequests.value.filter(l => l.employee_id === emp.employee_id);
        const pendingLeaves = employeeLeaves.filter(l => l.status === 'Pending');

        let performanceLevel = 'Good';
        let evaluationNotes = 'Consistent attendance and performance.';
        let recommendation = 'Continue current practices.';
        let concerns = [];
        let actions = [];

        if (attendancePercentage >= 90) {
            performanceLevel = 'Excellent';
            evaluationNotes = 'Exceptional attendance record.';
            recommendation = 'Consider for recognition.';
        } else if (attendancePercentage >= 80) {
            performanceLevel = 'Good';
            evaluationNotes = 'Reliable attendance with minor absences.';
            recommendation = 'Monitor for consistency.';
        } else {
            performanceLevel = 'Needs improvement';
            evaluationNotes = 'Attendance below acceptable levels.';
            concerns = ['Frequent absences affecting productivity'];
            actions = ['Schedule performance review', 'Discuss attendance issues'];
            recommendation = 'Immediate follow-up required.';
        }

        if (pendingLeaves.length > 0) {
            concerns.push(`${pendingLeaves.length} pending leave requests`);
            actions.push('Resolve pending leave requests');
        }

        const recentMonth = employeeAttendance.length > 0
            ? new Date(employeeAttendance[0].attendance_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return {
            ...emp,
            attendance: employeeAttendance,
            leaveRequests: employeeLeaves,
            presentDays,
            totalDays,
            absences: employeeAttendance.filter(a => a.status === 'Absent').length,
            attendancePercentage,
            performanceLevel,
            evaluationNotes,
            recommendation,
            concerns,
            actions,
            recentMonth,
            pendingLeavesCount: pendingLeaves.length
        };
    });
}

onMounted(() => {
    fetchAllData();
});

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
    return emp.pendingLeavesCount > 0 ? 'warning' : 'good'
}

function getLeaveStatusText(emp) {
    return emp.pendingLeavesCount > 0 ? `${emp.pendingLeavesCount} pending requests` : 'Up to date'
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
    alert(`Performance review scheduled for ${emp.name}`)
}

function exportPerformanceReport() {
    const report = {
        generated: new Date().toISOString(),
        totalEmployees: totalEmployees.value,
        overallStats: overallStats.value,
        employees: employees.value.map(emp => ({
            name: emp.name,
            department: emp.department,
            position: emp.position,
            attendancePercentage: emp.attendancePercentage,
            performanceLevel: emp.performanceLevel,
            evaluationNotes: emp.evaluationNotes
        }))
    }

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `performance-report-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

const refreshData = async () => {
    await fetchAllData();
    alert('Performance data refreshed!');
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
                <span class="period-value"> {{ employees[0]?.recentMonth || 'Current Month' }} </span>
            </div>

            <div class="header-actions">
                <button @click="refreshData" class="refresh-btn">
                    <i class="bi bi-arrow-clockwise"></i> Refresh Data
                </button>
                <button @click="exportPerformanceReport" class="export-report-btn">
                    <i class="bi bi-download"></i> Export Report
                </button>
            </div>
        </div>

        <div v-if="isLoading" class="loading-section">
            <p>Loading performance data...</p>
        </div>

        <div v-else>
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
                        <div class="stat-value">{{ overallStats.averageAttendance }}%</div>
                        <div class="stat-label"> Monthly Average </div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"> <i class="bi bi-award"> </i> </div>
                    <div class="stat-content">
                        <h3> Top Performers </h3>
                        <div class="stat-value">{{ overallStats.topPerformersCount }} </div>
                        <div class="stat-label"> 90%+ Attendance </div>
                    </div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-icon"> <i class="bi bi-exclamation-triangle-fill"></i> </div>
                    <div class="stat-content">
                        <h3> Needs Attention </h3>
                        <div class="stat-value">{{ overallStats.needsAttentionCount }}</div>
                        <div class="stat-label"> Requires Follow-up </div>
                    </div>
                </div>
            </div>

            <div class="filter-section">
                <div class="filter-group">
                    <label for="department-filter">Filter by Department:</label>
                    <select id="department-filter" v-model="selectedDepartment">
                        <option value="all">All Departments</option>
                        <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="performance-filter">Filter by Performance:</label>
                    <select id="performance-filter" v-model="selectedPerformance">
                        <option value="all">All Performance Levels</option>
                        <option value="excellent">Excellent (90%+)</option>
                        <option value="good">Good (80-89%)</option>
                        <option value="needs-improvement">Needs Improvement (&lt;80%)</option>
                    </select>
                </div>

                <button @click="selectedDepartment = 'all'; selectedPerformance = 'all'" class="reset-btn">
                    Reset Filters
                </button>
            </div>

            <div class="categories-section">
                <div class="category-tabs">
                    <button @click="setActiveCategory('top')"
                        :class="['tab-btn', { active: activeCategory === 'top' }]">
                        Top Performers ({{ topPerformers?.length || 0 }})
                    </button>
                    <button @click="setActiveCategory('average')"
                        :class="['tab-btn', { active: activeCategory === 'average' }]">
                        Satisfactory ({{ satisfactoryEmployees?.length || 0 }})
                    </button>
                    <button @click="setActiveCategory('needs-attention')"
                        :class="['tab-btn', { active: activeCategory === 'needs-attention' }, 'warning']">
                        Needs Attention ({{ needsAttention?.length || 0 }})
                    </button>
                </div>
            </div>

            <div class="performance-details">
                <div v-if="activeCategory === 'top'" class="category-content">
                    <h3>Top Performers - 90%+ Attendance</h3>
                    <div v-if="topPerformers.length === 0" class="no-data">
                        <p>No top performers found with current filters.</p>
                    </div>
                    <div v-else class="employee-cards">
                        <div v-for="emp in topPerformers" :key="emp.employee_id" class="employee-card excellent">
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
                    <div v-if="satisfactoryEmployees.length === 0" class="no-data">
                        <p>No satisfactory performers found with current filters.</p>
                    </div>
                    <div v-else class="employee-cards">
                        <div v-for="emp in satisfactoryEmployees" :key="emp.employee_id" class="employee-card good">
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
                                <button @click="scheduleReview(emp)" class="action-btn secondary">Schedule
                                    Review</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="activeCategory === 'needs-attention'" class="category-content">
                    <h3>Requires Attention - Below 80% Attendance</h3>
                    <div v-if="needsAttention.length === 0" class="no-data">
                        <p>No employees needing attention found with current filters.</p>
                    </div>
                    <div v-else class="employee-cards">
                        <div v-for="emp in needsAttention" :key="emp.employee_id" class="employee-card warning">
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
                                    <span class="metric-value warning">{{ emp.concerns.join(', ') || 'None' }}</span>
                                </div>
                            </div>
                            <div class="action-required">
                                <h4>Action Required:</h4>
                                <ul>
                                    <li v-for="action in emp.actions" :key="action">{{ action }}</li>
                                    <li v-if="emp.actions.length === 0">Monitor performance closely</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
:root {
    --bg-primary: #f8fafc;
    --bg-secondary: #ffffff;
    --bg-tertiary: #f1f5f9;
    --text-primary: #1e293b;
    --text-secondary: #475569;
    --text-tertiary: #64748b;
    --border-color: #e2e8f0;
    --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --header-gradient: linear-gradient(135deg, #ffb340 0%, #4c4ba2 100%);
}

.dark-mode {
    --bg-primary: #121416;
    --bg-secondary: #1a1c1e;
    --bg-tertiary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #e2e8f0;
    --text-tertiary: #94a3b8;
    --border-color: #2d3748;
    --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    --header-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-section {
    text-align: center;
    padding: 60px;
    color: #666;
    font-size: 1.2rem;
}

.dark-mode .loading-section {
    color: #94a3b8;
}

.header-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
}

.refresh-btn,
.export-report-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.refresh-btn {
    background: #3498db;
    color: white;
}

.refresh-btn:hover {
    background: #2980b9;
}

.export-report-btn {
    background: #27ae60;
    color: white;
}

.export-report-btn:hover {
    background: #219653;
}

.dark-mode .refresh-btn {
    background: #2563eb;
}

.dark-mode .refresh-btn:hover {
    background: #1d4ed8;
}

.dark-mode .export-report-btn {
    background: #059669;
}

.dark-mode .export-report-btn:hover {
    background: #047857;
}

.no-data {
    text-align: center;
    padding: 40px;
    background: #f8f9fa;
    border-radius: 8px;
    color: #666;
}

.dark-mode .no-data {
    background: #2d2d2d;
    color: #94a3b8;
}

.performance-evaluation {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    background: var(--bg-primary);
    min-height: 100vh;
    color: var(--text-primary);
    transition: all 0.3s ease;
}

.header-section {
    text-align: center;
    margin-bottom: 32px;
    padding: 24px;
    background: var(--header-gradient);
    color: #ffffff;
    border-radius: 16px;
    box-shadow: var(--card-shadow);
}

.page-title {
    font-size: 2.5rem;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
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
    backdrop-filter: blur(10px);
}

.summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
}

.stat-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 24px;
    box-shadow: var(--card-shadow);
    display: flex;
    align-items: center;
    gap: 20px;
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.stat-card.warning {
    border-left: 4px solid #f97316;
}

.stat-icon {
    font-size: 2.5rem;
    color: #3b82f6;
}

.dark-mode .stat-icon {
    color: #60a5fa;
}

.stat-content h3 {
    margin: 0 0 8px 0;
    font-size: 1rem;
    color: var(--text-tertiary);
}

.stat-value {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
    color: var(--text-primary);
}

.stat-label {
    color: var(--text-tertiary);
    font-size: 0.875rem;
    margin: 0;
}

.filter-section {
    display: flex;
    gap: 20px;
    margin-bottom: 32px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
    box-shadow: var(--card-shadow);
    align-items: flex-end;
    border: 1px solid var(--border-color);
}

.filter-group {
    flex: 1;
}

.filter-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-secondary);
}

.filter-group select {
    width: 100%;
    padding: 10px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: border-color 0.3s ease;
}

.filter-group select:focus {
    outline: none;
    border-color: #3b82f6;
}

.reset-btn {
    padding: 10px 24px;
    background: var(--text-tertiary);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.3s ease;
}

.reset-btn:hover {
    background: var(--text-secondary);
}

.dark-mode .reset-btn {
    background: #4b5563;
}

.dark-mode .reset-btn:hover {
    background: #374151;
}

.category-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 8px;
}

.tab-btn {
    padding: 12px 24px;
    background: var(--bg-tertiary);
    border: none;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    color: var(--text-secondary);
}

.tab-btn:hover {
    background: var(--border-color);
}

.tab-btn.active {
    background: #3b82f6;
    color: white;
}

.tab-btn.warning {
    background: #fed7aa;
    color: #92400e;
}

.dark-mode .tab-btn.warning {
    background: #7c2d12;
    color: #fed7aa;
}

.tab-btn.warning.active {
    background: #f97316;
    color: white;
}

.dark-mode .tab-btn {
    background: #374151;
    color: #d1d5db;
}

.dark-mode .tab-btn:hover {
    background: #4b5563;
}

.dark-mode .tab-btn.active {
    background: #2563eb;
}

.employee-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
}

.employee-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--card-shadow);
    border-left: 4px solid #10b981;
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
}

.employee-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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
    color: var(--text-primary);
}

.employee-position {
    color: var(--text-tertiary);
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

.dark-mode .employee-dept {
    background: #1e3a8a;
    color: #93c5fd;
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

.dark-mode .performance-badge {
    background: #14532d;
    color: #86efac;
}

.performance-badge.warning {
    background: #fef3c7;
    color: #92400e;
}

.dark-mode .performance-badge.warning {
    background: #7c2d12;
    color: #fde68a;
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
    border-bottom: 1px solid var(--border-color);
}

.metric-label {
    color: var(--text-tertiary);
}

.metric-value {
    font-weight: 600;
    color: var(--text-primary);
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
    background: var(--bg-tertiary);
    padding: 16px;
    border-radius: 8px;
    margin-top: 16px;
}

.employee-notes p {
    margin: 8px 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.action-required {
    background: #fef3c7;
    padding: 16px;
    border-radius: 8px;
    margin-top: 16px;
}

.dark-mode .action-required {
    background: #78350f;
}

.action-required h4 {
    margin: 0 0 8px 0;
    color: #92400e;
}

.dark-mode .action-required h4 {
    color: #fde68a;
}

.action-required ul {
    margin: 0;
    padding-left: 20px;
}

.action-required li {
    margin: 4px 0;
    color: #92400e;
}

.dark-mode .action-required li {
    color: #fed7aa;
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
    transition: background 0.3s ease;
}

.action-btn:hover {
    background: #2563eb;
}

.action-btn.secondary {
    background: var(--text-tertiary);
}

.action-btn.secondary:hover {
    background: var(--text-secondary);
}

.action-btn.warning {
    background: #f97316;
}

.action-btn.warning:hover {
    background: #ea580c;
}

.dark-mode .action-btn {
    background: #2563eb;
}

.dark-mode .action-btn:hover {
    background: #1d4ed8;
}

.dark-mode .action-btn.secondary {
    background: #4b5563;
}

.dark-mode .action-btn.secondary:hover {
    background: #374151;
}

.category-content h3 {
    color: var(--text-primary);
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--border-color);
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
        margin-bottom: 4px;
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

    .filter-section {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-group {
        width: 100%;
    }

    .reset-btn {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .header-actions {
        flex-direction: column;
    }

    .refresh-btn,
    .export-report-btn {
        width: 100%;
        justify-content: center;
    }

    .performance-metrics {
        grid-template-columns: 1fr;
    }

    .metric {
        flex-direction: column;
        gap: 4px;
    }
}
</style>