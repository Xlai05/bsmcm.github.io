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

// Function to reattach event listeners after login
function setupEventListeners() {
    document.querySelectorAll("#order-buttons button").forEach(button => {
        button.addEventListener("click", function() {
            alert(`You clicked: ${this.textContent}`);
        });
    });

    // Make sure settings menu toggles on click
    const settingsButton = document.getElementById("settings-button");
    if (settingsButton) {
        settingsButton.addEventListener("click", toggleSettings);
    }

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
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Remove employee form submission
    document.getElementById('remove-employee').addEventListener('submit', function(event) {
        event.preventDefault();
        const username = event.target.querySelector('input[name="username"]').value;

        fetch('http://localhost:3000/remove-employee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        })
        .then(response => response.json())
        .then(data => {
            alert('Employee removed successfully!');
            event.target.reset();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Navigation click handlers
    document.querySelector('a[onclick="toggleOrderButtons()"]').addEventListener('click', function() {
        showSection('order-buttons');
    });

    document.querySelector('a[onclick="toggleSupplierInfo()"]').addEventListener('click', function() {
        showSection('supplier-info');
    });

    document.querySelector('a[onclick="toggleEmployeeManagement()"]').addEventListener('click', function() {
        showSection('employee-management');
    });
}

// Show a specific section and hide others
function showSection(sectionId) {
    const sections = ['order-buttons', 'supplier-info', 'employee-management'];
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

// Toggle Settings Menu on Click
function toggleSettings() {
    let dropdown = document.getElementById("settings-dropdown");
    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
}

// Run event listener setup when DOM loads
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
});
