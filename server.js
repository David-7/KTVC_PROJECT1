require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
console.log('Maintenance Mode:', MAINTENANCE_MODE);

// Middleware to check maintenance mode
app.use((req, res, next) => {
    if (MAINTENANCE_MODE) {
        const maintenanceFilePath = path.join(__dirname, 'maintenance.html'); // Adjusted to current folder
        res.sendFile(maintenanceFilePath);
    } else {
        next();
    }
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store hashed passwords
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Endpoint to verify admin password
app.post('/api/authenticate', (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    const isMatch = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
    if (isMatch) {
        return res.status(200).json({ message: 'Authentication successful' });
    } else {
        return res.status(401).json({ message: 'Invalid password' });
    }
});

// Endpoint to get the maintenance mode status
app.get('/api/maintenance-mode', (req, res) => {
    const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
    res.json({ maintenanceMode: MAINTENANCE_MODE });
});

// Endpoint to change passwords
app.post('/api/change-password', (req, res) => {
    const { developerPassword, newPassword, target } = req.body;

    // Verify the developer password
    const isPasswordCorrect = bcrypt.compareSync(developerPassword, process.env.DEVELOPER_PASSWORD_HASH);
    if (!isPasswordCorrect) {
        return res.status(403).json({ message: 'Access denied: Invalid developer password.' });
    }

    // Update the target password
    if (target === 'admin') {
        updateEnvFile('ADMIN_PASSWORD_HASH', bcrypt.hashSync(newPassword, 10));
        res.status(200).json({ message: 'Admin password updated successfully.' });
    } else if (target === 'system') {
        updateEnvFile('SYSTEM_PASSWORD_HASH', bcrypt.hashSync(newPassword, 10));
        res.status(200).json({ message: 'System password updated successfully.' });
    } else {
        res.status(400).json({ message: 'Invalid target specified.' });
    }
});

// Function to update the .env file
function updateEnvFile(key, value) {
    const envPath = path.join(__dirname, '.env');
    const envVars = fs.readFileSync(envPath, 'utf8').split('\n');
    const updatedVars = envVars.map(line => {
        if (line.startsWith(`${key}=`)) {
            return `${key}=${value}`;
        }
        return line;
    });
    fs.writeFileSync(envPath, updatedVars.join('\n'));
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});