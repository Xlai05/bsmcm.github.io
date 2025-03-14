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
            localStorage.setItem('currentUser', username); // Store the username
            document.getElementById('login-screen').style.display = "none";
            document.getElementById('main-content').style.display = "block";
            loadUserProfile();

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

function loadUserProfile() {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return;

    fetch(`http://localhost:3000/employees`)
        .then(response => response.json())
        .then(data => {
            const user = data.find(emp => emp.UserName === currentUser);
            if (user) {
                document.getElementById("profile-name").textContent = `Name: ${user.EmployeeName}`;
                document.getElementById("profile-contact").textContent = `Contact: ${user.Contact}`;
                document.getElementById("profile-address").textContent = `Address: ${user.Address}`;
                document.getElementById("profile-username").textContent = `Username: ${user.UserName}`;
            }
        })
        .catch(error => console.error("Error fetching user data:", error));
}


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
        toggleSupplierInfo();
    });

    document.querySelector('a[onclick="toggleEmployeeManagement()"]').addEventListener('click', function() {
        toggleEmployeeManagement();
    });

    document.querySelector('a[onclick="toggleProfileManagement()"]').addEventListener('click', function() {
        toggleProfileManagement();
    });

    // Add logout button click handler
    document.querySelector('a[onclick="logout()"]').addEventListener('click', function() {
        logout();
    });

    // Add onclick event for the "View Report" button
    const viewReportButton = document.getElementById("view-report-button");
    if (viewReportButton) {
        viewReportButton.addEventListener("click", function() {
            toggleSalesReport();
        });
    }
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
    
    // We need to get the username from somewhere - let's store it when the user logs in
    const username = localStorage.getItem('currentUser'); // We'll need to store this during login
    
    if (!username) {
        alert('User session not found. Please login again.');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    fetch('http://localhost:3000/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, currentPassword, newPassword })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.message === "Password changed successfully") {
            event.target.reset();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to change password. Please try again.');
    });
}
// Show a specific section and hide others
function showSection(sectionId) {
    const sections = ['order-buttons', 'supplier-info', 'employee-management', 'profile-management', 'sales-report-section'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id === sectionId) {
                element.classList.remove('hidden');
                // For sales-report-section which uses style.display
                if (id === 'sales-report-section') {
                    element.style.display = "block";
                }
            } else {
                element.classList.add('hidden');
                // For sales-report-section which uses style.display
                if (id === 'sales-report-section') {
                    element.style.display = "none";
                }
            }
        }
    });
}

// Toggle Supplier Info Section
function toggleSupplierInfo() {
    showSection('supplier-info');
}

// Toggle Profile Management Section
function toggleProfileManagement() {
    showSection('profile-management');
    loadUserProfile();
}


// Toggle Sales Report Section
function toggleSalesReport() {
    showSection('sales-report-section');
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

// Ensure the report section is hidden initially
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("sales-report-section").style.display = "none";
    setupEventListeners();
});


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
                let output = data.salesData.map(row => {
                    let priceDisplay = row.classification === 'Refill' 
                        ? `₱${row.refill_price.toFixed(2)}` 
                        : row.classification === 'Bought' 
                        ? `₱${row.product_price.toFixed(2)}` 
                        : 'Price not available';
                
                    return `${row.product_name}: ${row.total_sold} units - ${row.classification} - Price: ${priceDisplay} each`;
                }).join('<br>');
                
                document.getElementById('salesReport').innerHTML = output;
                
                
                
                document.getElementById('salesReport').innerHTML = output;

                // Display total gained with peso sign
                document.getElementById('totalGained').innerText = `Total Gained: ₱${parseFloat(data.totalGained).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

                // Update the chart with the sales data
                updateChart(data.salesData);
                
                // Find the best seller with proper price handling
                if (data.salesData.length > 0) {
                    const bestSeller = data.salesData[0]; // First item is already the best seller
                    
                    // Format the price for the best seller
                    let bestSellerPrice = 'Price not available';
                    if (bestSeller.classification === 'Refill' && bestSeller.refill_price !== null) {
                        const priceNum = Number(bestSeller.refill_price);
                        if (!isNaN(priceNum)) {
                            bestSellerPrice = `₱${priceNum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                        }
                    } else if (bestSeller.classification === 'Bought' && bestSeller.product_price !== null) {
                        const priceNum = Number(bestSeller.product_price);
                        if (!isNaN(priceNum)) {
                            bestSellerPrice = `₱${priceNum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                        }
                    }
                    
                    document.getElementById('best-seller').innerText = `Best Seller: ${bestSeller.product_name} (${bestSeller.total_sold} units - ${bestSellerPrice} each)`;
                }
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('salesReport').innerText = 'Failed to load sales data.';
        });
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

// Logout function
function logout() {
    // Clear stored user data
    localStorage.removeItem("currentUser");

    // Reset UI state - maintain the login screen's original flex layout
    const loginScreen = document.getElementById('login-screen');
    loginScreen.style.display = "flex"; // Set to flex instead of just "block"
    loginScreen.classList.add("flex-col", "justify-center", "items-center", "min-h-screen", "pb-24");

    // Hide main content
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
    const sections = ['order-buttons', 'supplier-info', 'employee-management', 'profile-management', 'sales-report-section'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });

    // Hide settings dropdown if open
    document.getElementById('settings-dropdown').classList.add('hidden');

    // Redirect to login page (optional)
    window.location.href = "index.html";
}


// Run event listener setup when DOM loads
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
});

// Make sure the datepicker event listener works correctly
document.addEventListener('DOMContentLoaded', function () {
    const dateInput = document.getElementById('datePicker');
    
    // Add this event listener to make the datepicker automatically fetch data
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            fetchSalesData(); // Call fetchSalesData when date changes
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const username = localStorage.getItem("currentUser"); // Retrieve stored username
    const profileSection = document.getElementById("profile-section"); // Profile container

    if (username) {
        fetch(`http://localhost:3000/current-user?username=${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    profileSection.innerHTML = `<p>${data.message}</p>`;
                } else {
                    profileSection.innerHTML = `
                        <h3 class="text-lg font-bold">${data.EmployeeName}</h3>
                        <p>Contact: ${data.Contact}</p>
                        <p>Address: ${data.Address}</p>
                        <p>Username: ${data.UserName}</p>
                    `;
                }
            })
            .catch(error => console.error("Error fetching user details:", error));
    } else {
        profileSection.innerHTML = "<p>No user logged in.</p>";
    }
});



