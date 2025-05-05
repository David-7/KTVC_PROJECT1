const bcrypt = require('bcrypt');
const password = 'WALLSTREET_45-the-DEVELOPER'; // Replace with your desired developer password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Generated Hash:', hash);
    }
});