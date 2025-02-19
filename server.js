const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {v4: uuidv4} = require("uuid")
const bcrypt = require("bcrypt")

const saltRounds = 10;

const app = express();

const PORT = 5000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({storage: storage});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public","registration.html"));
});

app.post("/register", async (req, res) => {
    const { fname, lname, email, password, number, birthdate, gender, country, agreement } = req.body;

    if (!fname || !lname || !email || !password || !number || !birthdate || !gender || !country || !agreement) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userId = uuidv4();

    const clientData = {
        id: userId,
        fname,
        lname,
        email,
        password: hashedPassword,
        number,
        birthdate,
        gender,
        country,
        agreement,
        photo: null
    };

    const filePath = path.join(__dirname, "clients.json");

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ error: "Failed to read JSON file" });
        }

        const clients = data? JSON.parse(data) : [];

        clients.push(clientData);

        fs.writeFile(filePath, JSON.stringify(clients, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to write JSON file" });
            }

            res.status(200).json({ message: "Registration succeeded", id: userId });
        });
    })

    } catch (error) {
        res.status(500).json({ error: "Error hashing password" });
    }
})

app.post("/upload-photo", upload.single("photo"), (req,res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No photo uploaded" });
    }

    const photoName = req.file.filename;
    const userId = req.body.id;

    const filePath = path.join(__dirname, "clients.json");

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read JSON file" });
        }

        const clients = JSON.parse(data);

        const userIndex = clients.findIndex(client => client.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: "User not found" });
        }

        clients[userIndex].photo = photoName;


        fs.writeFile(filePath, JSON.stringify(clients, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to update JSON file" });
            }

            res.status(200).json({ message: "Photo uploaded successfully", photo: photoName });
        });
    });
})

app.get("/administration", (req, res) => {
    res.sendFile(path.join(__dirname, "public","admin.html"));
});

app.get("/administration/users", (req, res) => {
    const filePath = path.join(__dirname, "clients.json");

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read JSON file" });
        }

        const clients = JSON.parse(data);
        
        res.json(clients);
    })
});

app.put("/administration/user/:id", (req, res) => {
    const userId = req.params.id;
    const { fname, lname, email, number, birthdate, gender, country} = req.body;

    
    const fieldsToUpdate = { fname, lname, email, number, birthdate, gender, country};

    const filePath = path.join(__dirname, "clients.json");

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read JSON file" });
        }

        const clients = JSON.parse(data);
    
        const userIndex = clients.findIndex(client => client.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: "User not found" });
        }

        for (let field in fieldsToUpdate) {
            if (fieldsToUpdate[field]) {
                clients[userIndex][field] = fieldsToUpdate[field];
            }
        }


        fs.writeFile(filePath, JSON.stringify(clients, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to update JSON file" });
            }

            res.status(200).json({ message: "Updated successfully"});
        });
    })
});

app.delete("/administration/user/:id", (req, res) => {
    const userId = req.params.id; 

    const filePath = path.join(__dirname, "clients.json");


    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read JSON file" });
        }

        const clients = JSON.parse(data);

        const userIndex = clients.findIndex(client => client.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: "User not found" });
        }

        clients.splice(userIndex, 1);

        fs.writeFile(filePath, JSON.stringify(clients, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to update JSON file" });
            }

            res.status(200).json({ message: "User deleted successfully" });
        });
    });
});

app.listen(PORT, () => {
    console.log("Server running")
})