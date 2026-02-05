<script>
import axios from "axios";

export default {
    name: "Employees",
    data() {
        return {
            employees: [],
            searchText: "",
            isLoading: true,

            showEditModal: false,
            selectedEmployee: {
                employee_id: null,
                name: "",
                position: "",
                department: "",
                salary: "",
                contact: "",
                employment_history: "",
            },
        };
    },
    computed: {
        filteredEmployees() {
            if (!this.searchText) return this.employees;
            const search = this.searchText.toLowerCase();
            return this.employees.filter((employee) => {
                return (
                    (employee.name || "").toLowerCase().includes(search) ||
                    (employee.position || "").toLowerCase().includes(search) ||
                    (employee.department || "").toLowerCase().includes(search)
                );
            });
        },
    },
    methods: {
        async fetchEmployees() {
            try {
                const res = await axios.get("http://localhost:5000/api/employees");
                this.employees = res.data;
            } catch (err) {
                console.error("Failed to fetch employees:", err);
                alert("Failed to load employees from backend.");
            } finally {
                this.isLoading = false;
            }
        },

        openEdit(employee) {
            this.selectedEmployee = { ...employee };
            this.showEditModal = true;
        },

        closeModal() {
            this.showEditModal = false;
        },

        async saveEdit() {
            try {
                const { employee_id, ...payload } = this.selectedEmployee;
                await axios.put(`http://localhost:5000/api/employees/${employee_id}`, payload);
                await this.fetchEmployees();
                this.showEditModal = false;
            } catch (err) {
                console.error("Failed to update employee:", err);
                alert("Failed to update employee.");
            }
        },
    },
    async mounted() {
        await this.fetchEmployees();
    },
};
</script>

<template>
    <div class="page">
        <h1>Employees</h1>

        <div class="search">
            <input type="text" v-model="searchText" placeholder="Search Employees..." class="search-input" />
        </div>

        <div class="employee-cards">
            <div v-for="employee in filteredEmployees" :key="employee.employee_id" class="employee-card">
                <div class="card-header">
                    <h3>{{ employee.name }}</h3>
                    <span class="card-id">ID: {{ employee.employee_id }}</span>
                </div>
                <div class="card-content">
                    <p><b>Position:</b> {{ employee.position }}</p>
                    <p><b>Department:</b> {{ employee.department }}</p>
                    <p><b>Contact:</b> {{ employee.contact }}</p>
                    <p><b>History:</b> {{ employee.employment_history }}</p>
                    <p><b>Salary:</b> {{ employee.salary }}</p>
                </div>

                <button class="action-btn edit" @click="openEdit(employee)">
                    Edit
                </button>
            </div>

            <div v-if="filteredEmployees.length === 0 && !isLoading" class="no-results">
                No employees found. Please try a different search.
            </div>

            <div v-if="isLoading" class="loading">
                Loading employees...
            </div>
        </div>

        <div v-if="showEditModal" class="modal-backdrop">
            <div class="modal">
                <h2>Edit Employee</h2>
                <input v-model="selectedEmployee.name" placeholder="Name" />
                <input v-model="selectedEmployee.position" placeholder="Position" />
                <input v-model="selectedEmployee.department" placeholder="Department" />
                <input v-model="selectedEmployee.salary" placeholder="Salary" />
                <input v-model="selectedEmployee.contact" placeholder="Contact" />
                <textarea v-model="selectedEmployee.employment_history" placeholder="Employment History"></textarea>

                <div class="modal-actions">
                    <button class="action-btn primary" @click="saveEdit">Save</button>
                    <button class="action-btn secondary" @click="closeModal">Cancel</button>
                </div>
            </div>
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

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    padding: 24px;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
}

.modal input,
.modal textarea {
    width: 100%;
    margin-bottom: 12px;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
</style>



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

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    padding: 24px;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
}

.modal input,
.modal textarea {
    width: 100%;
    margin-bottom: 12px;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
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