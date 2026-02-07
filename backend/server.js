const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userFilePath = path.join(__dirname, 'users.json');

const readUsers = () => {
  if (!fs.existsSync(userFilePath)) {
    fs.writeFileSync(userFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(userFilePath, 'utf8');
  return JSON.parse(data);
};

const writeUsers = (users) => {
  fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2));
};
app.get('/', (req, res) => {
  res.send('Welcome to the registration API');
});
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const users = readUsers();

  const userExists = users.some((user) => user.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = { id: users.length + 1, name, email, password };
  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ message: 'User registered successfully', user: newUser });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});