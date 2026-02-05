<template>
    <div class="timeoff-page">
        <div class="page-header">
            <h1><i class="bi bi-calendar-plus"></i> Time Off Management</h1>
            <p class="subtitle">Manage employee leave requests and track attendance</p>
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
                </div>
            </div>

            <div v-if="leaveRequests.length > 0" class="simple-list">
                <div v-for="request in leaveRequests" :key="request.id" class="request-card">
                    <div class="request-header">
                        <h3>{{ request.employeeName }}</h3>
                        <span class="status-badge" :class="request.status.toLowerCase()">{{ request.status }}</span>
                    </div>
                    <div class="request-details">
                        <p><strong>Type:</strong> {{ request.type }}</p>
                        <p><strong>Dates:</strong> {{ request.startDate }}</p>
                        <p><strong>Duration:</strong> {{ request.duration }}day(s)</p>
                        <p><strong>Reason:</strong> {{ request.reason }}</p>
                    </div>
                    <div class="request-actions">
                        <button class="btn-approve" @click="updateStatus(request.id,'Approved')">Approve</button>
                        <button class="btn-deny" @click="updateStatus(request.id,'Denied')">Deny</button>
                        <button class="btn-edit" @click="startEdit(request)">Edit</button>
                    </div>
                </div>
            </div>

            <div v-else class="no-data-message">
                <i class="bi bi-inbox"></i>
                <h3>No Leave Requests Found</h3>
                <p>There are no time-off requests in the system.</p>
            </div>
        </div>

        <div v-else-if="activeTab === 'calendar'" class="calendar-section">
            <h2>Calendar View</h2>
            <p>Calendar will be implemented here</p>
        </div>

        <div v-else-if="activeTab === 'policy'" class="policy-section">
            <div class="section-header">
                <h2>Leave Policy</h2>
                <p>Company leave policy information will go here</p>
            </div>
        </div>
        <div v-if="editingRequest" class="edit-modal">
            <div class="edit-card">
                <h3>Edit leave Request</h3>
                
                <div class="form-group">
                    <label>Type</label>
                    <input v-model="editingRequest.type">
                </div>

                <div class="form-group">
                    <label>Reason</label>
                    <input v-model="editingRequest.reason">
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
    </div>
    
</template>

<script>
import employeesData from '@/stores/employee_info.json'
import attendanceData from '@/stores/attendance.json'

export default {
    name: 'TimeOff',
    data() {
        return {
            activeTab: 'requests',
            employees: [],
            leaveRequests: [],
            editingRequest: null
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
        }
    },

    created() {
        this.employees = employeesData;
        this.transformAttendanceData();

        console.log('Employees loaded:', this.employees.length);
        console.log('Time-off requests loaded:', this.leaveRequests.length);
    },

    methods: {
        transformAttendanceData() {
            this.leaveRequests = [];

            if (!attendanceData || !attendanceData.attendanceAndLeave) {
                console.error('No attendance data found or incorrect structure');
                console.log('Attendance data:', attendanceData);
                return;
            }

            let requestId = 1;

            attendanceData.attendanceAndLeave.forEach(employee => {
                if (employee.leaveRequests && Array.isArray(employee.leaveRequests)) {
                    employee.leaveRequests.forEach(leave => {
                        const transformedRequest = {
                            id: requestId++,
                            employeeId: employee.employeeId || employee.id,
                            employeeName: employee.name || employee.employeeName || 'Unknown',
                            startDate: this.formatDate(leave.date),
                            endDate: this.formatDate(leave.date),
                            duration: leave.duration || 1,
                            type: leave.type || leave.reason || 'Unknown',
                            reason: leave.reason || leave.type || 'No reason provided',
                            status: leave.status || 'Pending',
                            submittedDate: this.formatDate(leave.submittedDate || leave.date),
                            originalDate: leave.date
                        };
                        this.leaveRequests.push(transformedRequest);
                    });
                }
            });

            console.log('Transformed leave requests:', this.leaveRequests);
        },

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
        updateStatus(requestId, newStatus){
            const request = this.leaveRequests.find(r => r.id === requestId);
            if(!request) return;

            request.status = newStatus;

            console.log('Status updated',requestId, newStatus);
        },

        startEdit(request){
            this.editingRequest = {...request};
        },

        saveEdit(){
            const index = this.leaveRequests.findIndex(
                r => r.id === this.editingRequest.id
            );

            if(index !== -1){
                this.leaveRequests[index] = {...this.editingRequest};

                console.log('Request updated', this.editingRequest);
            }
            this.editingRequest = null;
        },
        cancelEdit(){
            this.editingRequest = null;
        }


    }
}
</script>

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

.header {
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
    margin: 0 0 10px 0;
    color: #d8d8d8;
    font-size: 2rem;
    display: flex;
    align-items: center;
    gap: 10px;
}

.page-header h1 i {
    color: #3498db
}

.subtitle {
    margin: 0;
    color: #7f8c8d;
    font-size: 1rem;
    padding: 10px;
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
    display: flex;
    gap: 5px;
    margin-bottom: 30px;
    background: #3f3f3f;
    padding: 5px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

.section-header {
    background: white;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dark-mode .section-header {
    background: #3f3f3f;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-header h2 {
    margin: 0 0 15px 0;
    color: #2c3e50;
}

.dark-mode .section-header h2 {
    margin: 0 0 15px 0;
    color: #d8d8d8;
}

.stats {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
}

.stat-item {
    padding: 8px 16px;
    background: #f8f9fa;
    border-radius: 6px;
    color: #2c3e50;
}

.dark-mode .stat-item {
    padding: 8px 16px;
    background: #3f3f3f;
    border-radius: 6px;
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
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border-left: 4px solid #3498db;
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
    margin: 0;
    color: #d8d8d8;
    font-size: 1.2rem;
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
    color: #7f8c8d;
}

.request-details p {
    margin: 8px 0;
}

.request-details strong {
    color: #2c3e50;
    margin-right: 10px;
}

.dark-mode .request-details strong {
    color: #d8d8d8;
    margin-right: 10px;
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
        flex-direction: row;
        align-items: center;
        gap: 8px;
    }

    .subtitle {
        font-size: 0.9rem;
        padding: 5px 0 15px 0;
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
        border-radius: 8px;
    }

    .section-header {
        padding: 15px;
        text-align: center;
    }

    .section-header h2 {
        font-size: 1.3rem;
    }

    .stats {
        flex-direction: column;
        gap: 10px;
        align-items: center;
    }

    .stat-item {
        width: 100%;
        text-align: center;
        padding: 10px;
    }

    .simple-list {
        gap: 12px;
    }

    .request-card {
        padding: 15px;
    }

    .request-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .request-header h3 {
        font-size: 1.1rem;
    }

    .status-badge {
        font-size: 0.8rem;
    }

    .request-details p {
        margin: 6px 0;
        font-size: 0.9rem;
    }

    .no-data-message {
        padding: 40px 15px;
    }

    .no-data-message i {
        font-size: 2.5rem;
    }

    .no-data-message h3 {
        font-size: 1.1rem;
    }


    .calendar-section,
    .policy-section {
        padding: 20px;
        font-size: 0.95rem;
    }
}

.edit-modal{
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index:1000;
}

.edit-card{
    background: white;
    padding: 24px;
    border-radius: 12px;
    width: 100%;
    max-width: 380px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
} 

.edit-card h3{
    margin-bottom: 20px;
    text-align: center;
}
.form-group{
    display: flex;
    flex-direction: colomn;
    gap: 6px;
    margin-bottom: 15px;
}

.form-group label{
    font-size: 0.85rem;
    font-weight: 600;
    color: #555;
}

.form-group input, .form-group select{
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 0.9rem;
    width: 100%;
}

.modal-actions{
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
}

.save-btn{
    background:#3498db;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
}

.cancel-btn{
    background: #bdc3c7;
    color: #2c3e50;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
}

.btn-approve,.btn-deny,.btn-edit{
    background: #3498db;
    color: white;
    border: 1px solid #3498db;
    padding: 5px 12px;
    border-radius: 20px;
    font-weight: bold;
    
}

.request-actions{
    display: flex;
    gap: 10px;
    font-size: 0.85rem;
    font-weight: 600;
   
}
</style>