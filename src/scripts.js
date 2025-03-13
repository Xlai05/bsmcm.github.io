document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent page reload

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert("Username or Password is missing!");
        return;
    }

    fetch("http://localhost:3000/login", {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Login successful!");
            document.getElementById('login-screen').style.display = "none";
            document.getElementById('main-content').style.display = "block";

            // Show/hide elements based on role
            if (data.role === "admin") {
                document.getElementById("employee-management-button").classList.remove("hidden");
                document.getElementById("sales-report-button").classList.remove("hidden");
            } else {
                document.getElementById("employee-management-button").classList.add("hidden");
                document.getElementById("sales-report-button").classList.add("hidden");
            }

            // Attach event listeners again
            setupEventListeners();
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error("Error:", error));
});

// Helper function to remove existing event listeners
function removeEventListeners(selector, event, handler) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        const clone = element.cloneNode(true);
        element.parentNode.replaceChild(clone, element);
    });
}

// Toggle Employee Management Section
function toggleEmployeeManagement() {
    showSection('employee-management');
    loadEmployees(); // Load employees when Employee Management is clicked
}

// Function to reattach event listeners after login
function setupEventListeners() {
    // Remove existing event listeners
    removeEventListeners('#remove-employee', 'submit', handleRemoveEmployee);
    removeEventListeners('#change-password-form', 'submit', handleChangePassword);

    // Add employee form submission
    document.getElementById('add-employee').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const employeeData = {
            fullName: formData.get('fullName'),
            contact: formData.get('contact'),
            address: formData.get('address'),
            username: formData.get('username'),
            password: formData.get('password'),
            role: formData.get('role')
        };

        fetch('http://localhost:3000/add-employee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        })
        .then(response => response.json())
        .then(data => {
            alert('Employee added successfully!');
            event.target.reset();
            loadEmployees(); // Reload the employee list
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Remove employee form submission
    document.getElementById('remove-employee').addEventListener('submit', handleRemoveEmployee);

    // Profile management form submission
    document.getElementById('change-password-form').addEventListener('submit', handleChangePassword);

    // Navigation click handlers
    document.querySelector('a[onclick="toggleOrderButtons()"]').addEventListener('click', function() {
        showSection('order-buttons');
    });

    document.querySelector('a[onclick="toggleSupplierInfo()"]').addEventListener('click', function() {
        showSection('supplier-info');
    });

    document.querySelector('a[onclick="toggleEmployeeManagement()"]').addEventListener('click', function() {
        toggleEmployeeManagement();
    });

    document.querySelector('a[onclick="toggleProfileManagement()"]').addEventListener('click', function() {
        showSection('profile-management');
    });
}

// Handle remove employee form submission
function handleRemoveEmployee(event) {
    event.preventDefault();
    const username = event.target.querySelector('input[name="username"]').value.trim();
    console.log('Removing employee with username:', username); // Debugging log

    fetch('http://localhost:3000/remove-employee', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Server response:', data); // Debugging log
        if (data.success) {
            alert('Employee removed successfully!');
            event.target.reset();
            loadEmployees(); // Reload the employee list
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Handle change password form submission
function handleChangePassword(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    fetch('http://localhost:3000/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Password changed successfully!');
            event.target.reset();
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Show a specific section and hide others
function showSection(sectionId) {
    const sections = ['order-buttons', 'supplier-info', 'employee-management', 'profile-management'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id === sectionId) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    });
}

// Toggle Add Employee Form
function toggleAddEmployeeForm() {
    const addEmployeeForm = document.getElementById('add-employee-form');
    const removeEmployeeForm = document.getElementById('remove-employee-form');
    addEmployeeForm.classList.toggle('hidden');
    removeEmployeeForm.classList.add('hidden');
}

// Toggle Remove Employee Form
function toggleRemoveEmployeeForm() {
    const addEmployeeForm = document.getElementById('add-employee-form');
    const removeEmployeeForm = document.getElementById('remove-employee-form');
    removeEmployeeForm.classList.toggle('hidden');
    addEmployeeForm.classList.add('hidden');
}

// Load employees from the database and display them
function loadEmployees() {
    fetch('http://localhost:3000/employees')
        .then(response => response.json())
        .then(data => {
            const employeeList = document.getElementById('employee-list');
            employeeList.innerHTML = ''; // Clear the list
            data.forEach(employee => {
                const employeeCard = document.createElement('div');
                employeeCard.className = 'bg-white p-4 rounded-lg shadow-lg';
                employeeCard.innerHTML = `
                    <h3 class="text-lg font-bold">${employee.EmployeeName} (${employee.Role})</h3>
                    <button class="bg-blue-500 text-white px-4 py-2 rounded mt-2" onclick="viewEmployeeProfile(${employee.Employee_ID})">View Profile</button>
                `;
                employeeList.appendChild(employeeCard);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// View employee profile
function viewEmployeeProfile(employeeId) {
    fetch(`http://localhost:3000/employees/${employeeId}`)
        .then(response => response.json())
        .then(data => {
            const employeeProfileContent = document.getElementById('employee-profile-content');
            employeeProfileContent.innerHTML = `
                <h3 class="text-lg font-bold">${data.EmployeeName} </h3>
                <p>Contact: ${data.Contact}</p>
                <p>Address: ${data.Address}</p>
                <p>Username: ${data.UserName}</p>
                <p>Password: ${data.Password}</p>
            `;
            document.getElementById('employee-profile').classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Close employee profile
function closeEmployeeProfile() {
    document.getElementById('employee-profile').classList.add('hidden');
}

// Toggle Settings Menu on Click
function toggleSettings() {
    let dropdown = document.getElementById("settings-dropdown");
    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
}

function logout() {
    // Reset UI state - maintain the login screen's original flex layout
    const loginScreen = document.getElementById('login-screen');
    loginScreen.style.display = "flex"; // Set to flex instead of just "block"
    loginScreen.classList.add("flex-col", "justify-center", "items-center", "min-h-screen", "pb-24");
    
    document.getElementById('main-content').style.display = "none";
    
    // Clear sensitive form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    // Notify the server about logout (optional)
    fetch("http://localhost:3000/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .catch(error => console.error("Error during logout:", error));
    
    // Hide any open sections or forms
    const sections = ['order-buttons', 'supplier-info', 'employee-management', 'profile-management'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
    
    // Hide settings dropdown if open
    document.getElementById('settings-dropdown').classList.add('hidden');
}

// Run event listener setup when DOM loads
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
});