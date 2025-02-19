document.addEventListener("DOMContentLoaded", () => {
    fetch("/administration/users")
        .then(response => response.json())
        .then(users => {
            const tableBody = document.getElementById("client-table-body");
            tableBody.innerHTML = ""; 

            users.forEach(user => {
                const row = document.createElement("div");
                row.classList.add("row");
                row.id = `user-row-${user.id}`; // Додаю ID для видалення рядка

                row.innerHTML = `
                    <div class="cell">${user.id}</div>
                    <div class="cell"><input type="text" value="${user.fname}" id="fname-${user.id}"></div>
                    <div class="cell"><input type="text" value="${user.lname}" id="lname-${user.id}"></div>
                    <div class="cell">${user.email}</div>
                    <div class="cell">${user.number}</div>
                    <div class="cell">${user.birthdate}</div>
                    <div class="cell">${user.gender}</div>
                    <div class="cell">${user.country}</div>
                    <div class="cell">
                        <button class="update-button" onclick="updateUser('${user.id}')">Update</button>
                        <button class="delete-button" onclick="deleteUser('${user.id}')">Delete</button>
                    </div>
                `;

                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error loading users:", error));
});

function updateUser(userId) {
    const fname = document.getElementById(`fname-${userId}`).value;
    const lname = document.getElementById(`lname-${userId}`).value;

    const updatedData = { fname, lname };

    fetch(`/administration/user/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (!response.ok) throw new Error("Update failed");
        return response.json();
    })
    .then(() => {
        alert("Updated successfully!");
    })
    .catch(error => {
        console.error("Error updating user:", error);
        alert("Update failed!");
    });
}

function deleteUser(userId) {
    fetch(`/administration/user/${userId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("Delete failed");
        return response.json();
    })
    .then(() => {
        document.getElementById(`user-row-${userId}`).remove(); // Видаляємо рядок після успішного видалення
        alert("User deleted successfully!");
    })
    .catch(error => {
        console.error("Error deleting user:", error);
        alert("Delete failed!");
    });
}
