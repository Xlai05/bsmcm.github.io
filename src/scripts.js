/* filepath: c:\Users\seanj\gitclones\BS_Project\bsmcm.github.io\src\scripts.js */
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Assuming admin login for simplicity
    if (username === 'admin' && password === 'password123') {
        document.getElementById('login-screen').style.display = "none";
        document.getElementById('main-content').style.display = "block";
        document.getElementById('employee-management-button').classList.remove('hidden');
        document.getElementById('sales-report-button').classList.remove('hidden');
        fetchEmployees();
    } else {
        alert('Invalid username or password!');
    }
});

function toggleOrderButtons() {
    const orderButtons = document.getElementById('order-buttons');
    const supplierInfo = document.getElementById('supplier-info');
    const formContainer = document.getElementById('form-container');
    const employeeManagement = document.getElementById('employee-management');
    if (orderButtons.style.display === "flex") {
        orderButtons.style.display = "none";
    } else {
        orderButtons.style.display = "flex";
        supplierInfo.style.display = "none";
        formContainer.style.display = "none";
        employeeManagement.style.display = "none";
    }
}

function toggleForm() {
    const formContainer = document.getElementById('form-container');
    if (formContainer.style.display === "block") {
        formContainer.style.display = "none";
    } else {
        formContainer.style.display = "block";
    }
}

function toggleSettings() {
    const dropdown = document.getElementById('settings-dropdown');
    if (dropdown.style.display === "flex") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "flex";
    }
}

function toggleSupplierInfo() {
    const supplierInfo = document.getElementById('supplier-info');
    const orderButtons = document.getElementById('order-buttons');
    const formContainer = document.getElementById('form-container');
    const employeeManagement = document.getElementById('employee-management');
    if (supplierInfo.style.display === "block") {
        supplierInfo.style.display = "none";
    } else {
        supplierInfo.style.display = "block";
        orderButtons.style.display = "none";
        formContainer.style.display = "none";
        employeeManagement.style.display = "none";
    }
}

function toggleEmployeeManagement() {
    const employeeManagement = document.getElementById('employee-management');
    const orderButtons = document.getElementById('order-buttons');
    const supplierInfo = document.getElementById('supplier-info');
    const formContainer = document.getElementById('form-container');
    if (employeeManagement.style.display === "block") {
        employeeManagement.style.display = "none";
    } else {
        employeeManagement.style.display = "block";
        orderButtons.style.display = "none";
        supplierInfo.style.display = "none";
        formContainer.style.display = "none";
        fetchEmployees();
    }
}

function toggleAddEmployeeForm() {
    const addForm = document.getElementById('add-employee-form');
    const removeForm = document.getElementById('remove-employee-form');
    addForm.classList.toggle('hidden');
    if (!removeForm.classList.contains('hidden')) {
        removeForm.classList.add('hidden');
    }
}

function toggleRemoveEmployeeForm() {
    const removeForm = document.getElementById('remove-employee-form');
    const addForm = document.getElementById('add-employee-form');
    removeForm.classList.toggle('hidden');
    if (!addForm.classList.contains('hidden')) {
        addForm.classList.add('hidden');
    }
}

function showEmployeeProfile(employeeId) {
    const profile = document.getElementById('employee-profile');
    fetch(`/employees/${employeeId}`)
        .then(response => response.json())
        .then(employee => {
            const profileContent = document.getElementById('employee-profile-content');
            profileContent.innerHTML = `
                <img src="${employee.faceImage}" alt="Employee face" class="rounded-full mb-2 cursor-pointer" width="100" height="100" onclick="showFullImage('${employee.faceImage}')">
                <h3 class="text-lg font-bold">${employee.fullName}</h3>
                <p>${employee.role}</p>
                <img src="${employee.resumeImage}" alt="Resume image" class="mt-2 cursor-pointer" width="100" height="100" onclick="showFullImage('${employee.resumeImage}')">
            `;
            profile.classList.remove('hidden');
        });
}

function closeEmployeeProfile() {
    const profile = document.getElementById('employee-profile');
    profile.classList.add('hidden');
}

function showFullImage(imageUrl) {
    const fullImageOverlay = document.createElement('div');
    fullImageOverlay.className = 'fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center';
    fullImageOverlay.innerHTML = `
        <img src="${imageUrl}" alt="Full size image" class="rounded-lg">
        <button class="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded" onclick="closeFullImage()">Close</button>
    `;
    document.body.appendChild(fullImageOverlay);

    function handleEscape(event) {
        if (event.key === 'Escape') {
            closeFullImage();
        }
    }

    document.addEventListener('keydown', handleEscape);

    function closeFullImage() {
        fullImageOverlay.remove();
        document.removeEventListener('keydown', handleEscape);
    }
}

function logout() {
    document.getElementById('main-content').style.display = "none";
    document.getElementById('login-screen').style.display = "flex";
}

const navBar = document.getElementById('nav-bar');
let navTimeout;

function showNavBar() {
    clearTimeout(navTimeout);
    navBar.style.opacity = 1;
    navTimeout = setTimeout(() => {
        navBar.style.opacity = 0;
    }, 10000);
}

document.addEventListener('mousemove', showNavBar);
document.addEventListener('touchstart', showNavBar);

document.getElementById('add-employee').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const employeeData = {
        fullName: formData.get('fullName'),
        role: formData.get('role'),
        username: formData.get('username'),
        password: formData.get('password'),
        faceImage: URL.createObjectURL(formData.get('faceImage')),
        resumeImage: URL.createObjectURL(formData.get('resumeImage'))
    };

    fetch('/employees', {
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
        fetchEmployees();
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

document.getElementById('remove-employee').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = event.target[0].value;

    fetch(`/employees/${username}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert('Employee removed successfully!');
        event.target.reset();
        fetchEmployees();
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function fetchEmployees() {
    fetch('/employees')
        .then(response => response.json())
        .then(data => {
            const employeeList = document.getElementById('employee-list');
            employeeList.innerHTML = '';

            data.forEach((employee, index) => {
                const employeeCard = document.createElement('div');
                employeeCard.className = 'bg-gray-100 p-4 rounded-lg shadow-lg hover:bg-gray-200 cursor-pointer';
                employeeCard.onclick = () => showEmployeeProfile(employee.id);

                const faceImage = document.createElement('img');
                faceImage.src = employee.faceImage;
                faceImage.alt = 'Employee face';
                faceImage.className = 'rounded-full mb-2';
                faceImage.width = 100;
                faceImage.height = 100;

                const fullName = document.createElement('h3');
                fullName.className = 'text-lg font-bold';
                fullName.textContent = employee.fullName;

                const role = document.createElement('p');
                role.textContent = employee.role;

                const resumeImage = document.createElement('img');
                resumeImage.src = employee.resumeImage;
                resumeImage.alt = 'Resume image';
                resumeImage.className = 'mt-2';
                resumeImage.width = 100;
                resumeImage.height = 100;

                employeeCard.appendChild(faceImage);
                employeeCard.appendChild(fullName);
                employeeCard.appendChild(role);
                employeeCard.appendChild(resumeImage);

                employeeList.appendChild(employeeCard);
            });
        });
}