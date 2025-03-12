document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent page reload

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    console.log("Username entered:", username);
    console.log("Password entered:", password);

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
        console.log("Server response:", data);

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

            // Show the Order buttons section
            document.getElementById("order-buttons").classList.remove("hidden");

            // ✅ Attach event listeners again
            setupEventListeners();
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error("Error:", error));
});

// ✅ Function to reattach event listeners after login
function setupEventListeners() {
    document.querySelectorAll("#order-buttons button").forEach(button => {
        button.addEventListener("click", function() {
            alert(`You clicked: ${this.textContent}`);
        });
    });

    // ✅ Make sure settings menu toggles on click
    const settingsButton = document.getElementById("settings-button");
    if (settingsButton) {
        settingsButton.addEventListener("click", toggleSettings);
    }
}

// ✅ Toggle Settings Menu on Click
function toggleSettings() {
    let dropdown = document.getElementById("settings-dropdown");
    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
}

// ✅ Run event listener setup when DOM loads
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
});
