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
            loadEmployees(); // Reload the employee list
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
            loadEmployees(); // Reload the employee list
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
        loadEmployees(); // Load employees when Employee Management is clicked
    });

    // Add onclick event for the "View Report" button
    const viewReportButton = document.getElementById("view-report-button");
    if (viewReportButton) {
        viewReportButton.addEventListener("click", function() {
            toggleSalesReport();
            fetchSalesData();
        });
    }
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
                    <h3 class="text-lg font-bold">${employee.EmployeeName}</h3>
                    <p>Contact: ${employee.Contact}</p>
                    <p>Address: ${employee.Address}</p>
                    <p>Username: ${employee.UserName}</p>
                    <p>Role: ${employee.Role}</p>
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
                <h3 class="text-lg font-bold">${data.EmployeeName}</h3>
                <p>Contact: ${data.Contact}</p>
                <p>Address: ${data.Address}</p>
                <p>Username: ${data.UserName}</p>
                <p>Role: ${data.Role}</p>
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

// Ensure the report section is hidden initially
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("sales-report-section").style.display = "none";
});

// Function to toggle the sales report section
function toggleSalesReport() {
    const section = document.getElementById("sales-report-section");
    section.style.display = section.style.display === "none" ? "block" : "none";
}

// Function to fetch sales data from the server
function fetchSalesData() {
    const dateInput = document.getElementById('datePicker');
    const selectedDate = dateInput.value; // Get selected date from input

    if (!selectedDate) {
        alert("Please select a date.");
        return;
    }

    fetch(`http://localhost:3000/sales-report?date=${selectedDate}&type=daily`)
        .then(response => response.json())
        .then(data => {
            console.log('Received data from API:', data); // Debug log

            if (data.message) {
                document.getElementById('salesReport').innerText = data.message; 
            } else {
                let output = data.map(row => `${row.product_name}: ${row.total_sold}`).join('<br>');
                document.getElementById('salesReport').innerHTML = output;

                // Update the chart with the sales data
                updateChart(data);
            }
        })
        .catch(error => console.error('Error fetching data:', error));

    // Fetch orders sold on the selected date
    fetch(`http://localhost:3000/orders?date=${selectedDate}&type=daily`)
        .then(response => response.json())
        .then(data => {
            console.log('Received orders data from API:', data); // Debug log

            const ordersList = document.getElementById('ordersList');
            if (data.message) {
                ordersList.innerText = data.message; 
            } else {
                let output = data.map(order => `Order ID: ${order.order_id}, Product: ${order.product_name}, Quantity: ${order.quantity}`).join('<br>');
                ordersList.innerHTML = output;
            }
        })
        .catch(error => console.error('Error fetching orders data:', error));
}

// Function to update the sales chart
let salesChart;
function updateChart(salesData) {
    const ctx = document.getElementById("salesChart").getContext("2d");

    // Extract labels (product names) and data (quantity sold)
    const labels = salesData.map(item => item.product_name);
    const quantities = salesData.map(item => item.total_sold);

    // Destroy existing chart before creating a new one
    if (salesChart) {
        salesChart.destroy();
    }

    salesChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                label: "Products Sold",
                data: quantities,
                backgroundColor: [
                    "rgba(255, 99, 132, 0.5)",
                    "rgba(54, 162, 235, 0.5)",
                    "rgba(255, 206, 86, 0.5)",
                    "rgba(75, 192, 192, 0.5)",
                    "rgba(153, 102, 255, 0.5)",
                    "rgba(255, 159, 64, 0.5)"
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Run event listener setup when DOM loads
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
});

document.addEventListener('DOMContentLoaded', function () {
    const dateInput = document.getElementById('datePicker'); // Assuming user selects a date
    const salesReportDiv = document.getElementById('salesReport');

    if (!dateInput || !salesReportDiv) {
        console.error('Missing elements in HTML.');
        return;
    }

    dateInput.addEventListener('change', function () {
        const selectedDate = dateInput.value; // Get selected date from input
        if (!selectedDate) return;

        fetch(`http://localhost:3000/sales-report?date=${selectedDate}&type=daily`)
            .then(response => response.json())
            .then(data => {
                console.log('Received data from API:', data);

                if (data.message) {
                    salesReportDiv.innerText = data.message; // Show message if no data
                } else {
                    let output = data.map(row => `${row.product_name}: ${row.total_sold}`).join('<br>');
                    console.log('Displaying data:', output);
                    salesReportDiv.innerHTML = output;
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                salesReportDiv.innerText = 'Failed to load sales data.';
            });
    });
});