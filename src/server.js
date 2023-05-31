const express = require('express');
const path = require('path');

const app = express();
const port = 3005;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a routes for HTML files
app.get("/login", function (req, res) {
    res.sendFile(__dirname + "/Frontend/Login.html", "/Login.css"); //hier mit CSS
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/Frontend/home.html");
});

app.get("/signup", function (req, res) {
    res.sendFile(__dirname + "/Frontend/register.html");
});
app.get("/Game", function (req, res) {
    res.sendFile(__dirname + "/Frontend/Spielpage.html", "/spielpage.css");
});

app.get("/watch", function (req, res) {
    res.sendFile(__dirname + "/Frontend/watch.html", "/spielpage.css");
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
