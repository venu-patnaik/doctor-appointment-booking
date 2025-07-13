// API URL
const API_URL = 'http://localhost:3000/api';

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = '/index.html';
        }
        return false;
    }
    
    if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
        window.location.href = '/dashboard.html';
    }
    return true;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const appointmentForm = document.getElementById('appointmentForm');
    const registerRole = document.getElementById('registerRole');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (registerRole) {
        registerRole.addEventListener('change', toggleSpecialization);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentSubmit);
    }

    // Initialize dashboard if on dashboard page
    if (window.location.pathname === '/dashboard.html') {
        initializeDashboard();
    }
});

// Toggle specialization field based on role
function toggleSpecialization() {
    const specializationField = document.getElementById('specializationField');
    const specializationSelect = document.getElementById('specialization');
    
    if (this.value === 'doctor') {
        specializationField.style.display = 'block';
        specializationSelect.required = true;
    } else {
        specializationField.style.display = 'none';
        specializationSelect.required = false;
        specializationSelect.value = ''; // Reset the value when switching to patient
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message);
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard.html';
    } catch (error) {
        showError(error.message);
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    const specializationElement = document.getElementById('specialization');
    const specialization = role === 'doctor' ? specializationElement.value : undefined;

    // Validate password length
    if (password.toString().length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    // Validate doctor specialization
    if (role === 'doctor' && !specialization) {
        showError('Please select a specialization');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password: password.toString(),
                role,
                specialization
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        showSuccess('Registration successful!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1000);
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message || 'Registration failed. Please try again.');
    }
}

// Initialize Dashboard
async function initializeDashboard() {
    if (!checkAuth()) return;

    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('userInfo').textContent = `Welcome, ${user.name}`;

    if (user.role === 'patient') {
        document.getElementById('patientDashboard').style.display = 'block';
        await loadDoctors();
        await loadPatientAppointments();
    } else {
        document.getElementById('doctorDashboard').style.display = 'block';
        await loadDoctorAppointments();
    }
}

// Load Doctors
async function loadDoctors() {
    try {
        const response = await fetch(`${API_URL}/auth/doctors`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const doctors = await response.json();
        const doctorSelect = document.getElementById('doctor');
        
        doctorSelect.innerHTML = '<option value="">Select a doctor</option>';
        doctors.forEach(doctor => {
            doctorSelect.innerHTML += `
                <option value="${doctor._id}">
                    Dr. ${doctor.name} - ${doctor.specialization}
                </option>
            `;
        });
    } catch (error) {
        showError('Error loading doctors');
    }
}

// Handle Appointment Submit
async function handleAppointmentSubmit(e) {
    e.preventDefault();

    const doctorId = document.getElementById('doctor').value;
    const date = document.getElementById('date').value;
    const timeSlot = document.getElementById('timeSlot').value;
    const reason = document.getElementById('reason').value;

    try {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                doctorId,
                date,
                timeSlot,
                reason
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message);
        }

        showSuccess('Appointment booked successfully');
        e.target.reset();
        await loadPatientAppointments();
    } catch (error) {
        showError(error.message);
    }
}

// Load Patient Appointments
async function loadPatientAppointments() {
    try {
        const response = await fetch(`${API_URL}/appointments`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const appointments = await response.json();
        const appointmentsDiv = document.getElementById('patientAppointments');
        
        appointmentsDiv.innerHTML = appointments.length ? '' : '<p>No appointments found</p>';
        
        appointments.forEach(appointment => {
            appointmentsDiv.innerHTML += `
                <div class="appointment-card">
                    <h6>Dr. ${appointment.doctor.name}</h6>
                    <p>Date: ${new Date(appointment.date).toLocaleDateString()}</p>
                    <p>Time: ${appointment.timeSlot}</p>
                    <p>Reason: ${appointment.reason}</p>
                    <p class="appointment-status status-${appointment.status}">
                        Status: ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </p>
                </div>
            `;
        });
    } catch (error) {
        showError('Error loading appointments');
    }
}

// Load Doctor Appointments
async function loadDoctorAppointments() {
    try {
        const response = await fetch(`${API_URL}/appointments`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const appointments = await response.json();
        const appointmentsDiv = document.getElementById('doctorAppointments');
        
        appointmentsDiv.innerHTML = appointments.length ? '' : '<p>No appointment requests</p>';
        
        appointments.forEach(appointment => {
            appointmentsDiv.innerHTML += `
                <div class="appointment-card">
                    <h6>Patient: ${appointment.patient.name}</h6>
                    <p>Date: ${new Date(appointment.date).toLocaleDateString()}</p>
                    <p>Time: ${appointment.timeSlot}</p>
                    <p>Reason: ${appointment.reason}</p>
                    <p class="appointment-status status-${appointment.status}">
                        Status: ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </p>
                    ${appointment.status === 'pending' ? `
                        <div class="mt-2">
                            <button class="btn btn-success btn-sm btn-action" onclick="updateAppointmentStatus('${appointment._id}', 'accepted')">
                                Accept
                            </button>
                            <button class="btn btn-danger btn-sm btn-action" onclick="updateAppointmentStatus('${appointment._id}', 'rejected')">
                                Reject
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
    } catch (error) {
        showError('Error loading appointments');
    }
}

// Update Appointment Status
async function updateAppointmentStatus(appointmentId, status) {
    try {
        const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error('Error updating appointment');
        }

        await loadDoctorAppointments();
        showSuccess('Appointment updated successfully');
    } catch (error) {
        showError(error.message);
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Improved error message display
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.role = 'alert';
    errorDiv.textContent = message;
    
    const form = document.querySelector('form');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Success message display
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.role = 'alert';
    successDiv.textContent = message;
    
    const form = document.querySelector('form');
    form.insertBefore(successDiv, form.firstChild);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
} 