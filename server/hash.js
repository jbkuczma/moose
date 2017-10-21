const crypto = require('crypto');

/**
 * generates random string (a salt) for the password
 * @param {number} length - length of random string
 */
let generateRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length/2))
                 .toString('hex')
                 .slice(0, length);
}

/**
 * hash the password via sha512
 * @param {String} password 
 * @param {String} salt 
 */
let sha512 = function(password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    }
}

function saltAndHashPassword(password) {
    let salt = generateRandomString(16);
    let hashed = sha512(password, salt);
    return hashed
}

module.exports = {
    saltAndHashPassword,
    sha512
}