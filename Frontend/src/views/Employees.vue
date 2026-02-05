<script>
import employeeInfo from '@/stores/employee_info.json' //import from backend

export default {
    name: 'Employees',
    data() {
        return {
            employees: [],
            searchText: '',
            isLoading: true
        };
    },
    computed: {
        filteredEmployees() {
            if (!this.searchText) {
                return this.employees;
            }
            const search = this.searchText.toLowerCase();
            return this.employees.filter(employee => {
                return (
                    employee.name.toLowerCase().includes(search) ||
                    employee.position.toLowerCase().includes(search) ||
                    employee.department.toLowerCase().includes(search)
                );
            });
        }
    },
    mounted() {
        this.employees = employeeInfo.employeeInformation || employeeInfo;
        this.isLoading = false;
    },
    methods: {
        editEmployees() {
            // For future implementation: Open bulk edit mode or edit form
            console.log('Opening edit mode for employees');
            alert('Edit functionality will be implemented soon! You can edit multiple employees or select one to edit.');
        },
        addNewEmployee() {
            // For future implementation: Open add employee form
            console.log('Adding new employee');
            alert('Add new employee functionality will be implemented soon!');
        },
        exportData() {
            // For future implementation: Export data as CSV/Excel
            console.log('Exporting employee data');
            alert('Export functionality will be implemented soon!');
        }
    }
}
</script>

<template>
    <div class="page">
        <h1>Employees</h1>
        <div class="search">
            <input type="text" v-model="searchText" placeholder="Search Employees..." class="search-input">
        </div>

        <div class="employee-cards">
            <div v-for="employee in filteredEmployees" :key="employee.employeeId" class="employee-card">
                <div class="card-header">
                    <h3>{{ employee.name }}</h3>
                    <span class="card-id">ID: {{ employee.employeeId }}</span>
                </div>
                <div class="card-content">
                    <p><b>Position:</b> {{ employee.position }}</p>
                    <p><b>Department:</b> {{ employee.department }}</p>
                    <p><b>Contact:</b> {{ employee.contact }}</p>
                    <p><b>History:</b> {{ employee.employmentHistory }}</p>
                    <p><b>Salary:</b> {{ employee.salary }}</p>
                </div>
            </div>

            <div v-if="filteredEmployees.length === 0" class="no-results">
                No employees found. Please try a different search.
            </div>
            <div v-if="employees.length === 0" class="loading">
                Loading employees...
            </div>
        </div>

        <div class="page-actions" v-if="filteredEmployees.length > 0">
            <button @click="addNewEmployee" class="action-btn primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add New Employee
            </button>
            <button @click="editEmployees" class="action-btn edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Employees
            </button>
            <button @click="exportData" class="action-btn secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export Data
            </button>
        </div>
    </div>
</template>


<style scoped>
.page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    min-height: calc(100vh - 120px);
}

h1 {
    margin-bottom: 14px;
}

.search {
    margin-bottom: 24px;
}

.search-input {
    width: 100%;
    padding: 12px 20px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.employee-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
}

.employee-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
}

.employee-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-color: #c7d2fe;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
}

.card-header h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #1e293b;
    line-height: 1.4;
}

.card-id {
    color: #64748b;
    font-size: 0.9rem;
    padding: 4px 8px;
    border-radius: 4px;
    background: #f1f5f9;
    font-weight: 500;
}

.card-content p {
    margin: 12px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
}

.card-content p:nth-child(odd) {
    background: #fff0d5;
    padding: 8px 12px;
    border-radius: 6px;
}

.page-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 30px 0;
    margin-top: 30px;
    border-top: 1px solid #e2e8f0;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 180px;
    justify-content: center;
}

.action-btn.primary {
    background: #27ae60;
    color: white;
}

.action-btn.primary:hover {
    background: #219653;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.action-btn.edit {
    background: #3498db;
    color: white;
}

.action-btn.edit:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.action-btn.secondary {
    background: #95a5a6;
    color: white;
}

.action-btn.secondary:hover {
    background: #7f8c8d;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(149, 165, 166, 0.3);
}

.no-results {
    grid-column: 1/-1;
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
    background: #f8fafc;
    border-radius: 12px;
    border: 2px dashed #cbd5e1;
}

.loading {
    grid-column: 1/-1;
    text-align: center;
    padding: 40px;
    color: #64748b;
}

.dark-mode .employee-card {
    background: rgb(41, 41, 41);
    border-color: #444;
}

.dark-mode .card-header h3 {
    color: #d8d8d8;
}

.dark-mode .card-id {
    color: #e0e1e3;
    background: #3f3f3f;
}

.dark-mode .card-content p:nth-child(odd) {
    background: #35374a;
}

.dark-mode .search-input {
    background: #2d2d2d;
    border-color: #444;
    color: #fff;
}

.dark-mode .page-actions {
    border-top-color: #444;
}

@media (max-width: 1200px) and (min-width: 768px) {
    .page {
        padding: 24px;
    }

    .employee-cards {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }

    .employee-card {
        padding: 20px;
    }

    .search-input {
        padding: 12px 18px;
        font-size: 15px;
    }

    .page-actions {
        flex-wrap: wrap;
    }
}

@media (max-width: 767px) {
    .employee-cards {
        grid-template-columns: 1fr;
    }

    .page-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }

    .action-btn {
        width: 100%;
    }

    h1 {
        font-size: 1.8rem;
    }
}
</style>