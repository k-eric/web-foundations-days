const loadUsersBtn = document.getElementById('load-users');
const filterInput = document.getElementById("filter-input");
const statusP = document.getElementById("status");
const usersList = document.getElementById("users-list");

let allUsers = [];

async function loadUsers() {
    loadUsersBtn.disabled = true;
    statusP.textContent = "Loading users...";
    usersList.textContent = "";

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!response.ok) {
            throw new Error(`Failed to fetch users (Status: ${response.status})`);
        }

        allUsers = await response.json();
        statusP.textContent = `Successfully loaded ${allUsers.length} users.`;
        renderUsers(allUsers);
    } catch (error) {
        statusP.textContent = `Error: ${error.message}`;
    } finally {
        loadUsersBtn.disabled = false;
    }
}

function renderUsers(usersToRender) {
    usersList.textContent = "";

    if (usersToRender.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No users match your filter.";
        usersList.appendChild(li);
        return;
    }

    usersToRender.forEach((user) => {
        const li = document.createElement("li");
        li.className = "user-card";

        const nameH3 = document.createElement("h3");
        nameH3.textContent = user.name;

        const emailP = document.createElement("p");
        emailP.textContent = `Email: ${user.email}`;

        const cityP = document.createElement("p");
        cityP.textContent = `City: ${user.address.city}`;

        const companyP = document.createElement("p");
        companyP.textContent = `Company: ${user.company.name}`;

        li.appendChild(nameH3);
        li.appendChild(emailP);
        li.appendChild(cityP);
        li.appendChild(companyP);
        usersList.appendChild(li);
    });
}

loadUsersBtn.addEventListener("click", loadUsers);

filterInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filteredUsers = allUsers.filter((user) =>
        user.name.toLowerCase().includes(query)
    );
    renderUsers(filteredUsers);
});
    