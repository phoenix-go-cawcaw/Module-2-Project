<script>
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default {
    name: 'TimeOff',
    data() {
        return {
            activeTab: 'requests',
            leaveRequests: [],
            employees: [],
            editingRequest: null,
            isLoading: false,
            showAddModal: false,
            newRequest: {
                employeeId: '',
                startDate: '',
                endDate: '',
                reason: '',
                leaveType: 'Annual'
            },
            refreshInterval: null,
            currentMonth: new Date().getMonth(),
            currentYear: new Date().getFullYear(),
            calendarDays: [],
            leavePolicy: {
                annual: 15,
                sick: 10,
                personal: 5,
                maternity: 180,
                paternity: 20,
                unpaid: 'Unlimited (with approval)'
            }
        }
    },

    computed: {
        pendingCount() {
            return this.leaveRequests.filter(req => req.status === 'Pending').length;
        },

        approvedCount() {
            return this.leaveRequests.filter(req => req.status === 'Approved').length;
        },

        deniedCount() {
            return this.leaveRequests.filter(req => req.status === 'Denied').length;
        },

        employeeMap() {
            const map = {};
            this.employees.forEach(emp => {
                map[emp.employee_id] = emp.name;
            });
            return map;
        },

        monthName() {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            return months[this.currentMonth];
        },

        approvedRequests() {
            return this.leaveRequests.filter(req => req.status === 'Approved');
        }
    },

    created() {
        this.fetchData();
        this.refreshInterval = setInterval(() => {
            this.fetchEmployees();
        }, 10000);

        this.generateCalendar();
    },

    beforeDestroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    },

    methods: {
        formatDate(dateString) {
            try {
                if (!dateString) return 'No date';
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    return dateString;
                }
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch (error) {
                console.error('Error formatting date:', dateString, error);
                return dateString;
            }
        },

        convertToDateInput(dateStr) {
            if (!dateStr) return '';
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return dateStr;
                return date.toISOString().split('T')[0];
            } catch (error) {
                return dateStr;
            }
        },

        async fetchData() {
            try {
                this.isLoading = true;
                await this.fetchEmployees();
                await this.fetchLeaveRequests();
            } catch (err) {
                console.error('Failed to fetch data:', err);
                alert('Failed to load data. Please check your connection.');
            } finally {
                this.isLoading = false;
            }
        },

        async fetchEmployees() {
            try {
                console.log('Fetching employees from:', `${API_BASE}/employees`);
                const res = await axios.get(`${API_BASE}/employees`);
                this.employees = res.data || [];
                console.log('Employees fetched:', this.employees.length);
            } catch (err) {
                console.error('Failed to fetch employees:', err);
                this.employees = [];
            }
        },

        async fetchLeaveRequests() {
            try {
                console.log('Fetching leave requests from:', `${API_BASE}/leave_requests`);
                const res = await axios.get(`${API_BASE}/leave_requests`);
                console.log('Leave requests response:', res.data);

                this.leaveRequests = res.data.map(request => {
                    const startDate = new Date(request.start_date);
                    const endDate = new Date(request.end_date);
                    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
                    const duration = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

                    const employeeName = this.employeeMap[request.employee_id] ||
                        `Employee ${request.employee_id}`;

                    return {
                        id: request.leave_id,
                        employeeId: request.employee_id,
                        employeeName: employeeName,
                        startDate: this.formatDate(request.start_date),
                        endDate: this.formatDate(request.end_date),
                        originalStartDate: request.start_date,
                        originalEndDate: request.end_date,
                        type: request.leave_type || 'Annual',
                        reason: request.reason || 'No reason provided',
                        status: request.status || 'Pending',
                        submittedDate: this.formatDate(request.created_at || new Date().toISOString()),
                        duration: duration,
                        leave_type: request.leave_type || 'Annual'
                    };
                });

                console.log('Final leaveRequests:', this.leaveRequests);
                this.generateCalendar();
            } catch (err) {
                console.error('Failed to fetch leave requests:', err);
                console.error('Error details:', err.response ? {
                    status: err.response.status,
                    data: err.response.data,
                    headers: err.response.headers
                } : err.message);
                throw err;
            }
        },

        generateCalendar() {
            const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
            const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();

            this.calendarDays = [];

            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDay; i++) {
                this.calendarDays.push({ day: null, isCurrentMonth: false });
            }

            // Add days of the current month
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dateObj = new Date(this.currentYear, this.currentMonth, day);

                // Check if there are approved leave requests on this day
                const leaveOnThisDay = this.approvedRequests.filter(request => {
                    const startDate = new Date(request.originalStartDate);
                    const endDate = new Date(request.originalEndDate);
                    return dateObj >= startDate && dateObj <= endDate;
                });

                this.calendarDays.push({
                    day,
                    dateStr,
                    dateObj,
                    isCurrentMonth: true,
                    isToday: this.isToday(dateObj),
                    leaves: leaveOnThisDay
                });
            }
        },

        isToday(date) {
            const today = new Date();
            return date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
        },

        prevMonth() {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.generateCalendar();
        },

        nextMonth() {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.generateCalendar();
        },

        getLeaveColor(leaveType) {
            const colors = {
                'Annual': '#3498db',
                'Sick': '#e74c3c',
                'Personal': '#9b59b6',
                'Maternity': '#e67e22',
                'Paternity': '#2ecc71',
                'Unpaid': '#95a5a6'
            };
            return colors[leaveType] || '#95a5a6';
        },

        async updateStatus(requestId, newStatus) {
            try {
                await axios.put(`${API_BASE}/leave_requests/${requestId}`, {
                    status: newStatus
                })

                await this.fetchLeaveRequests()
                alert(`Request ${newStatus.toLowerCase()} successfully!`)
            } catch (err) {
                console.error('Failed to update status:', err)
                alert('Failed to update request status. Please try again.')
            }
        },

        startEdit(request) {
            this.editingRequest = {
                ...request,
                originalStartDate: this.convertToDateInput(request.originalStartDate || request.startDate),
                originalEndDate: this.convertToDateInput(request.originalEndDate || request.endDate),
                leave_type: request.leave_type || 'Annual'
            };
        },

        async saveEdit() {
            try {
                const payload = {
                    employee_id: parseInt(this.editingRequest.employeeId),
                    leave_date: this.editingRequest.originalStartDate,
                    status: this.editingRequest.status,
                    leave_type: this.editingRequest.leave_type
                };

                await axios.put(
                    `${API_BASE}/leave_requests/${this.editingRequest.id}`,
                    payload
                );

                await this.fetchLeaveRequests();
                this.editingRequest = null;
                alert('Request updated successfully!');
            } catch (err) {
                console.error('Failed to update request:', err.response?.data || err);
                alert('Failed to update request. Please try again.');
            }
        },

        cancelEdit() {
            this.editingRequest = null;
        },

        openAddModal() {
            this.showAddModal = true;
            this.newRequest = {
                employeeId: '',
                startDate: '',
                endDate: '',
                reason: '',
                leaveType: 'Annual'
            };
        },

        closeAddModal() {
            this.showAddModal = false;
        },

        async submitNewRequest() {
            try {
                if (!this.newRequest.employeeId || !this.newRequest.startDate || !this.newRequest.endDate) {
                    alert('Please fill in all required fields (Employee ID, Start Date, End Date)');
                    return;
                }

                const employeeId = parseInt(this.newRequest.employeeId);
                const employeeExists = this.employees.some(emp => emp.employee_id === employeeId);

                if (!employeeExists) {
                    alert(`Employee ID ${employeeId} does not exist. Please add the employee first.`);
                    return;
                }

                const payload = {
                    employee_id: employeeId,
                    start_date: this.newRequest.startDate,
                    end_date: this.newRequest.endDate,
                    reason: this.newRequest.reason || 'No reason provided',
                    status: 'Pending',
                    leave_type: this.newRequest.leaveType
                };

                const response = await axios.post(`${API_BASE}/leave_requests`, payload);
                await this.fetchLeaveRequests();
                this.closeAddModal();
                alert('Leave request submitted successfully!');
            } catch (err) {
                console.error('Failed to submit request:', err);
                alert('Failed to submit leave request. Please try again.');
            }
        }
    },

    watch: {
        employees() {
            if (this.leaveRequests.length > 0) {
                this.leaveRequests = this.leaveRequests.map(request => ({
                    ...request,
                    employeeName: this.employeeMap[request.employeeId] ||
                        `Employee ${request.employeeId}`
                }));
            }
        },
        currentMonth() {
            this.generateCalendar();
        },
        currentYear() {
            this.generateCalendar();
        }
    }
}
</script>

<template>
    <div class="timeoff-page">
        <div class="page-header">
            <h1><i class="bi bi-calendar-plus"></i> Time Off Management</h1>
            <p class="subtitle">Manage employee leave requests and track attendance</p>
            <div class="header-info">
                <span class="employee-count">
                    <i class="bi bi-people"></i> {{ employees.length }} Employees
                </span>
                <small class="auto-refresh-hint">(Updates automatically every 10 seconds)</small>
            </div>
        </div>

        <div class="tabs">
            <button class="tab-btn" :class="{ active: activeTab === 'requests' }" @click="activeTab = 'requests'">
                <i class="bi bi-list-check"></i> All requests
            </button>

            <button class="tab-btn" :class="{ active: activeTab === 'calendar' }" @click="activeTab = 'calendar'">
                <i class="bi bi-calendar-week"></i> Calendar View
            </button>

            <button class="tab-btn" :class="{ active: activeTab === 'policy' }" @click="activeTab = 'policy'">
                <i class="bi bi-file-text"></i> Leave Policy
            </button>
        </div>

        <div v-if="activeTab === 'requests'" class="requests-section">
            <div class="section-header">
                <h2>Time Off Requests</h2>
                <div class="stats">
                    <span class="stat-item">
                        <strong>Total:</strong> {{ leaveRequests.length }}
                    </span>
                    <span class="stat-item">
                        <strong>Pending:</strong> {{ pendingCount }}
                    </span>
                    <span class="stat-item">
                        <strong>Approved:</strong> {{ approvedCount }}
                    </span>
                    <span class="stat-item">
                        <strong>Denied:</strong> {{ deniedCount }}
                    </span>
                    <button @click="openAddModal" class="add-btn">
                        + New Request
                    </button>
                </div>
            </div>

            <div v-if="isLoading" class="loading-message">
                <p>Loading data...</p>
            </div>

            <div v-else-if="leaveRequests.length > 0" class="simple-list">
                <div v-for="request in leaveRequests" :key="request.id" class="request-card">
                    <div class="request-header">
                        <h3>{{ request.employeeName }}</h3>
                        <span class="status-badge" :class="request.status.toLowerCase()">{{ request.status }}</span>
                    </div>
                    <div class="request-details">
                        <p><strong>Employee ID:</strong> {{ request.employeeId }}</p>
                        <p><strong>Leave Type:</strong> {{ request.leave_type || 'Annual' }}</p>
                        <p><strong>Dates:</strong> {{ request.startDate }} to {{ request.endDate }}</p>
                        <p><strong>Duration:</strong> {{ request.duration || 1 }} day(s)</p>
                        <p><strong>Reason:</strong> {{ request.reason }}</p>
                        <p><strong>Submitted:</strong> {{ request.submittedDate }}</p>
                    </div>
                    <div class="request-actions">
                        <button v-if="request.status === 'Pending'" class="btn-approve"
                            @click="updateStatus(request.id, 'Approved')">
                            Approve
                        </button>
                        <button v-if="request.status === 'Pending'" class="btn-deny"
                            @click="updateStatus(request.id, 'Denied')">
                            Deny
                        </button>
                        <button class="btn-edit" @click="startEdit(request)">Edit</button>
                    </div>
                </div>
            </div>

            <div v-else class="no-data-message">
                <i class="bi bi-inbox"></i>
                <h3>No Leave Requests Found</h3>
                <p>There are no time-off requests in the system.</p>
                <button @click="openAddModal" class="add-btn">
                    + Create First Request
                </button>
            </div>
        </div>

        <div v-else-if="activeTab === 'calendar'" class="calendar-section">
            <div class="calendar-header">
                <h2>Leave Calendar - {{ monthName }} {{ currentYear }}</h2>
                <div class="calendar-controls">
                    <button @click="prevMonth" class="calendar-nav-btn">
                        <i class="bi bi-chevron-left"></i> Previous
                    </button>
                    <button @click="generateCalendar" class="calendar-refresh-btn">
                        <i class="bi bi-arrow-clockwise"></i> Today
                    </button>
                    <button @click="nextMonth" class="calendar-nav-btn">
                        Next <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div class="calendar-container">
                <div class="calendar-weekdays">
                    <div class="weekday">Sun</div>
                    <div class="weekday">Mon</div>
                    <div class="weekday">Tue</div>
                    <div class="weekday">Wed</div>
                    <div class="weekday">Thu</div>
                    <div class="weekday">Fri</div>
                    <div class="weekday">Sat</div>
                </div>

                <div class="calendar-grid">
                    <div v-for="(day, index) in calendarDays" :key="index" class="calendar-day" :class="{
                        'empty-day': !day.isCurrentMonth,
                        'today': day.isToday,
                        'has-leave': day.leaves && day.leaves.length > 0
                    }">
                        <div class="day-number">{{ day.day }}</div>
                        <div v-if="day.leaves && day.leaves.length > 0" class="leave-indicators">
                            <div v-for="leave in day.leaves.slice(0, 3)" :key="leave.id" class="leave-indicator"
                                :style="{ backgroundColor: getLeaveColor(leave.leave_type) }"
                                :title="`${leave.employeeName} - ${leave.leave_type}`">
                            </div>
                            <div v-if="day.leaves.length > 3" class="more-indicator"
                                :title="`${day.leaves.length - 3} more leave(s)`">
                                +{{ day.leaves.length - 3 }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="calendar-legend">
                <h3>Legend</h3>
                <div class="legend-items">
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #3498db;"></span>
                        <span>Annual Leave</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #e74c3c;"></span>
                        <span>Sick Leave</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #9b59b6;"></span>
                        <span>Personal Leave</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #e67e22;"></span>
                        <span>Maternity Leave</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #2ecc71;"></span>
                        <span>Paternity Leave</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #95a5a6;"></span>
                        <span>Unpaid Leave</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="activeTab === 'policy'" class="policy-section">
            <div class="policy-header">
                <h2>Company Leave Policy</h2>
                <p class="policy-subtitle">Effective from January 1, 2026</p>
            </div>

            <div class="policy-grid">
                <div class="policy-card">
                    <div class="policy-icon" style="background-color: #3498db;">
                        <i class="bi bi-sun"></i>
                    </div>
                    <h3>Annual Leave</h3>
                    <p class="policy-days">{{ leavePolicy.annual }} days per year</p>
                    <p class="policy-description">Accrues monthly, can be carried over up to 5 days to next year.</p>
                </div>

                <div class="policy-card">
                    <div class="policy-icon" style="background-color: #e74c3c;">
                        <i class="bi bi-heart-pulse"></i>
                    </div>
                    <h3>Sick Leave</h3>
                    <p class="policy-days">{{ leavePolicy.sick }} days per year</p>
                    <p class="policy-description">Requires doctor's note for more than 3 consecutive days.</p>
                </div>

                <div class="policy-card">
                    <div class="policy-icon" style="background-color: #9b59b6;">
                        <i class="bi bi-person"></i>
                    </div>
                    <h3>Personal Leave</h3>
                    <p class="policy-days">{{ leavePolicy.personal }} days per year</p>
                    <p class="policy-description">For personal emergencies or important appointments.</p>
                </div>

                <div class="policy-card">
                    <div class="policy-icon" style="background-color: #e67e22;">
                        <i class="bi bi-gender-female"></i>
                    </div>
                    <h3>Maternity Leave</h3>
                    <p class="policy-days">{{ leavePolicy.maternity }} days</p>
                    <p class="policy-description">Paid leave for mothers, requires 4 weeks notice.</p>
                </div>

                <div class="policy-card">
                    <div class="policy-icon" style="background-color: #2ecc71;">
                        <i class="bi bi-gender-male"></i>
                    </div>
                    <h3>Paternity Leave</h3>
                    <p class="policy-days">{{ leavePolicy.paternity }} days</p>
                    <p class="policy-description">For new fathers, must be taken within 6 months of birth.</p>
                </div>

                <div class="policy-card">
                    <div class="policy-icon" style="background-color: #95a5a6;">
                        <i class="bi bi-calendar-x"></i>
                    </div>
                    <h3>Unpaid Leave</h3>
                    <p class="policy-days">{{ leavePolicy.unpaid }}</p>
                    <p class="policy-description">Requires management approval at least 2 weeks in advance.</p>
                </div>
            </div>

            <div class="policy-rules">
                <h3>General Rules</h3>
                <ul class="rules-list">
                    <li>Leave requests must be submitted at least 48 hours in advance (except emergencies)</li>
                    <li>Maximum of 3 employees can be on leave simultaneously in the same department</li>
                    <li>All leave must be approved by department manager</li>
                    <li>Leave during probation period: 1 day per month</li>
                    <li>Unused Annual Leave can be encashed at year-end</li>
                    <li>Medical certificate required for sick leave exceeding 2 days</li>
                </ul>
            </div>
        </div>

        <!-- Edit Modal -->
        <div v-if="editingRequest" class="edit-modal">
            <div class="edit-card">
                <h3>Edit Leave Request</h3>
                <div class="form-group">
                    <label>Employee ID</label>
                    <input v-model="editingRequest.employeeId" disabled>
                    <small class="employee-name-hint">
                        Employee: {{ employeeMap[editingRequest.employeeId] || 'Not found' }}
                    </small>
                </div>
                <div class="form-group">
                    <label>Leave Type</label>
                    <select v-model="editingRequest.leave_type">
                        <option value="Annual">Annual Leave</option>
                        <option value="Sick">Sick Leave</option>
                        <option value="Personal">Personal Leave</option>
                        <option value="Maternity">Maternity Leave</option>
                        <option value="Paternity">Paternity Leave</option>
                        <option value="Unpaid">Unpaid Leave</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="date" v-model="editingRequest.originalStartDate">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="date" v-model="editingRequest.originalEndDate">
                </div>
                <div class="form-group">
                    <label>Reason</label>
                    <textarea v-model="editingRequest.reason" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select v-model="editingRequest.status">
                        <option>Pending</option>
                        <option>Approved</option>
                        <option>Denied</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button @click="saveEdit" class="save-btn">Save</button>
                    <button @click="cancelEdit" class="cancel-btn">Cancel</button>
                </div>
            </div>
        </div>

        <!-- Add New Request Modal -->
        <div v-if="showAddModal" class="edit-modal">
            <div class="edit-card">
                <h3>Submit New Leave Request</h3>
                <div class="form-group">
                    <label>Employee ID *</label>
                    <input type="number" v-model="newRequest.employeeId" required>
                    <small class="employee-check">
                        <span v-if="newRequest.employeeId">
                            <span v-if="employees.some(emp => emp.employee_id === parseInt(newRequest.employeeId))">
                                ✓ Employee found: {{ employeeMap[parseInt(newRequest.employeeId)] }}
                            </span>
                            <span v-else style="color: #e74c3c;">
                                ✗ Employee ID not found. Add employee first.
                            </span>
                        </span>
                    </small>
                </div>
                <div class="form-group">
                    <label>Leave Type</label>
                    <select v-model="newRequest.leaveType">
                        <option value="Annual">Annual Leave</option>
                        <option value="Sick">Sick Leave</option>
                        <option value="Personal">Personal Leave</option>
                        <option value="Maternity">Maternity Leave</option>
                        <option value="Paternity">Paternity Leave</option>
                        <option value="Unpaid">Unpaid Leave</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Start Date *</label>
                    <input type="date" v-model="newRequest.startDate" required>
                </div>
                <div class="form-group">
                    <label>End Date *</label>
                    <input type="date" v-model="newRequest.endDate" required>
                </div>
                <div class="form-group">
                    <label>Reason</label>
                    <textarea v-model="newRequest.reason" rows="3" placeholder="Optional reason for leave"></textarea>
                </div>
                <div class="modal-actions">
                    <button @click="submitNewRequest" class="save-btn"
                        :disabled="!newRequest.employeeId || !newRequest.startDate || !newRequest.endDate">
                        Submit Request
                    </button>
                    <button @click="closeAddModal" class="cancel-btn">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.timeoff-page {
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f5f5f5;
    min-height: 100vh;
}

.dark-mode .timeoff-page {
    background: #121416;
}

.page-header {
    margin-bottom: 30px;
}

.page-header h1 {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-size: 2rem;
    display: flex;
    align-items: center;
    gap: 10px;
}

.dark-mode .page-header h1 {
    color: #d8d8d8;
}

.page-header h1 i {
    color: #3498db
}

.subtitle {
    margin: 0;
    color: #7f8c8d;
    font-size: 1rem;
    padding: 10px 0;
}

.header-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 15px;
    padding: 10px;
    background: rgba(52, 152, 219, 0.1);
    border-radius: 8px;
    max-width: 400px;
}

.employee-count {
    color: #2c3e50;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
}

.dark-mode .employee-count {
    color: #d8d8d8;
}

.auto-refresh-hint {
    font-size: 0.8rem;
    color: #7f8c8d;
}

.dark-mode .auto-refresh-hint {
    color: #aaa;
}

.employee-name-hint,
.employee-check {
    font-size: 0.8rem;
    color: #666;
    margin-top: 4px;
    display: block;
}

.dark-mode .employee-name-hint,
.dark-mode .employee-check {
    color: #aaa;
}

.tabs {
    display: flex;
    gap: 5px;
    margin-bottom: 30px;
    background: white;
    padding: 5px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dark-mode .tabs {
    background: #3f3f3f;
}

.tab-btn {
    flex: 1;
    padding: 12px 20px;
    background: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 0.95rem;
    color: #7f8c8d;
    transition: all 0.3s ease;
    font-weight: 500;
}

.tab-btn:hover {
    background: #f8f9fa;
    color: #3498db;
}

.tab-btn.active {
    background: #3498db;
    color: white;
}

.tab-btn.active:hover {
    background: #2980b9;
}

.calendar-section {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dark-mode .calendar-section {
    background: #2d2d2d;
    color: #d8d8d8;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e2e8f0;
}

.dark-mode .calendar-header {
    border-bottom-color: #444;
}

.calendar-header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
}

.dark-mode .calendar-header h2 {
    color: #d8d8d8;
}

.calendar-controls {
    display: flex;
    gap: 10px;
}

.calendar-nav-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9rem;
}

.calendar-nav-btn:hover {
    background: #2980b9;
}

.calendar-refresh-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9rem;
}

.calendar-refresh-btn:hover {
    background: #219653;
}

.calendar-container {
    margin-bottom: 30px;
}

.calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    margin-bottom: 10px;
}

.weekday {
    text-align: center;
    padding: 10px;
    font-weight: 600;
    color: #3498db;
    background: #f8f9fa;
    border-radius: 6px;
}

.dark-mode .weekday {
    background: #3f3f3f;
    color: #5dade2;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
}

.calendar-day {
    height: 100px;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
    position: relative;
}

.dark-mode .calendar-day {
    background: #3f3f3f;
    border-color: #444;
    color: #d8d8d8;
}

.calendar-day.empty-day {
    background: #f8f9fa;
    border-color: #e2e8f0;
}

.dark-mode .calendar-day.empty-day {
    background: #2d2d2d;
    border-color: #444;
}

.calendar-day.today {
    border-color: #3498db;
    background: #e3f2fd;
}

.dark-mode .calendar-day.today {
    background: #1a5276;
    border-color: #5dade2;
}

.calendar-day.has-leave {
    background: #fff9e6;
}

.dark-mode .calendar-day.has-leave {
    background: #2d2419;
}

.day-number {
    font-weight: 600;
    margin-bottom: 5px;
    color: #2c3e50;
}

.dark-mode .day-number {
    color: #d8d8d8;
}

.calendar-day.today .day-number {
    color: #3498db;
    font-weight: 700;
}

.dark-mode .calendar-day.today .day-number {
    color: #5dade2;
}

.leave-indicators {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    margin-top: 5px;
}

.leave-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    cursor: help;
}

.more-indicator {
    font-size: 0.7rem;
    color: #7f8c8d;
    margin-left: 2px;
    cursor: help;
}

.dark-mode .more-indicator {
    color: #aaa;
}

.calendar-legend {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
}

.dark-mode .calendar-legend {
    background: #3f3f3f;
}

.calendar-legend h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #2c3e50;
}

.dark-mode .calendar-legend h3 {
    color: #d8d8d8;
}

.legend-items {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
}

.policy-section {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dark-mode .policy-section {
    background: #2d2d2d;
    color: #d8d8d8;
}

.policy-header {
    text-align: center;
    margin-bottom: 40px;
}

.policy-header h2 {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-size: 1.8rem;
}

.dark-mode .policy-header h2 {
    color: #d8d8d8;
}

.policy-subtitle {
    color: #7f8c8d;
    font-size: 1rem;
    margin: 0;
}

.policy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.policy-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    transition: transform 0.3s ease;
}

.dark-mode .policy-card {
    background: #3f3f3f;
}

.policy-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.policy-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 15px;
    color: white;
    font-size: 1.5rem;
}

.policy-card h3 {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-size: 1.2rem;
}

.dark-mode .policy-card h3 {
    color: #d8d8d8;
}

.policy-days {
    font-size: 1.5rem;
    font-weight: 600;
    color: #3498db;
    margin: 0 0 10px 0;
}

.policy-description {
    color: #7f8c8d;
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 0;
}

.policy-rules {
    background: #f8f9fa;
    padding: 25px;
    border-radius: 10px;
}

.dark-mode .policy-rules {
    background: #3f3f3f;
}

.policy-rules h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #2c3e50;
}

.dark-mode .policy-rules h3 {
    color: #d8d8d8;
}

.rules-list {
    margin: 0;
    padding-left: 20px;
}

.rules-list li {
    margin-bottom: 8px;
    color: #555;
    line-height: 1.4;
}

.dark-mode .rules-list li {
    color: #d8d8d8;
}

.section-header {
    background: white;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dark-mode .section-header {
    background: #3f3f3f;
}

.section-header h2 {
    margin: 0 0 15px 0;
    color: #2c3e50;
}

.dark-mode .section-header h2 {
    color: #d8d8d8;
}

.stats {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: center;
}

.stat-item {
    padding: 8px 16px;
    background: #f8f9fa;
    border-radius: 6px;
    color: #2c3e50;
}

.dark-mode .stat-item {
    background: #3f3f3f;
    color: #d8d8d8;
}

.stat-item strong {
    color: #3498db;
    margin-right: 5px;
}

.simple-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.request-card {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border-left: 4px solid #3498db;
}

.dark-mode .request-card {
    background: #3f3f3f;
}

.request-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.request-header h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.2rem;
}

.dark-mode .request-header h3 {
    color: #d8d8d8;
}

.status-badge {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
}

.status-badge.pending {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.status-badge.approved {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.status-badge.denied {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.request-details {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    margin-bottom: 15px;
}

.request-details p {
    margin: 0;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 6px;
}

.request-details strong {
    color: #2c3e50;
    margin-right: 10px;
}

.dark-mode .request-details p {
    background: #3f3f3f;
}

.dark-mode .request-details strong {
    color: #d8d8d8;
}

.form-group textarea {
    width: 100%;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 0.9rem;
    resize: vertical;
}

.no-data-message {
    background: white;
    padding: 60px 20px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.no-data-message i {
    font-size: 3rem;
    color: #bdc3c7;
    margin-bottom: 20px;
}

.no-data-message h3 {
    color: #7f8c8d;
    margin-bottom: 10px;
}

.loading-message {
    background: white;
    padding: 40px 20px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    color: #7f8c8d;
}

.calendar-section,
.policy-section {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    text-align: center;
    color: #95a5a6;
}

@media (max-width: 768px) {
    .timeoff-page {
        padding: 15px;
    }

    .page-header h1 {
        font-size: 1.6rem;
    }

    .header-info {
        flex-direction: column;
        align-items: flex-start;
    }

    .tabs {
        flex-direction: column;
        padding: 8px;
        gap: 8px;
    }

    .tab-btn {
        width: 100%;
        font-size: 0.9rem;
        padding: 12px;
    }

    .section-header {
        padding: 15px;
    }

    .stats {
        flex-direction: column;
        gap: 10px;
        align-items: center;
    }

    .stat-item {
        width: 100%;
        text-align: center;
    }
}

.edit-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.edit-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.edit-card h3 {
    margin-bottom: 20px;
    text-align: center;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 15px;
}

.form-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #555;
}

.form-group input,
.form-group select {
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 0.9rem;
    width: 100%;
}

.modal-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
}

.save-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    min-width: 120px;
}

.save-btn:disabled {
    background: #95a5a6;
    cursor: not-allowed;
}

.cancel-btn {
    background: #bdc3c7;
    color: #2c3e50;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    min-width: 120px;
}

.btn-approve {
    background: #27ae60;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.btn-deny {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.btn-edit {
    background: #3498db;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.request-actions {
    display: flex;
    gap: 10px;
    font-size: 0.85rem;
}

.add-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.add-btn:hover {
    background: #219653;
}

.btn-approve:hover {
    background: #219653;
}

.btn-deny:hover {
    background: #c0392b;
}

.btn-edit:hover {
    background: #2980b9;
}

.save-btn:not(:disabled):hover {
    background: #2980b9;
}

.cancel-btn:hover {
    background: #a1a1a1;
}

@media (max-width: 768px) {
    .timeoff-page {
        padding: 15px;
    }

    .page-header h1 {
        font-size: 1.6rem;
    }

    .header-info {
        flex-direction: column;
        align-items: flex-start;
    }

    .tabs {
        flex-direction: column;
        padding: 8px;
        gap: 8px;
    }

    .tab-btn {
        width: 100%;
        font-size: 0.9rem;
        padding: 12px;
    }

    .section-header {
        padding: 15px;
    }

    .stats {
        flex-direction: column;
        gap: 10px;
        align-items: center;
    }

    .stat-item {
        width: 100%;
        text-align: center;
    }

    .calendar-header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }

    .calendar-controls {
        width: 100%;
        justify-content: space-between;
    }

    .calendar-day {
        height: 70px;
    }

    .policy-grid {
        grid-template-columns: 1fr;
    }

    .legend-items {
        flex-direction: column;
        gap: 10px;
    }
}
</style>