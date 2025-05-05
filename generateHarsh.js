const bcrypt = require('bcrypt');

const password = 'KANDARA_1990TVC'; // Replace with your actual password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
    } else {
        console.log('Generated Hash:', hash);
    }
});