document.getElementById("registrForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const fname = document.getElementById("fname").value.trim();
    const lname = document.getElementById("lname").value.trim();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordCon = document.getElementById("passwordCon").value;
    const number = document.getElementById("number").value.trim();
    const birthdate = document.getElementById("birthdate").value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const country = document.getElementById("country").value;
    const agreement = document.getElementById("agreement").value;

    if (password != passwordCon) {
        alert("The passwords do not match!");
        return
    }

    if (!gender) {
        alert("Who are you?");
        return
    }
    if (!agreement) {
        alert("You must agree to the data processing!");
        return
    }

    const photo = document.getElementById("photo");
    
    if (!(photo.files.length > 0)) {
        alert("Photo are not uploaded!");
        return
    }

    const data = {
        fname,
        lname,
        email,
        password,
        number,
        birthdate,
        gender,
        country,
        agreement
    }
    //console.log(data)
    fetch("/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert("Registration succeeded");
        const formData = new FormData();
        formData.append("photo", photo.files[0]);
        formData.append("id", data.id);

        return fetch("/upload-photo", {
            method: "POST",
            body: formData
        });
    })
    .then(responsePhoto => responsePhoto.json())
    .then(dataPhoto => {
        if(dataPhoto) {
            alert("Photo uploaded successfully!");
        }
    })
    .catch(error => alert("Error: " + error.message))
})