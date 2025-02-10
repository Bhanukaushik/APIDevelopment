const crypto = require('crypto');

// Generate a cryptographically strong random key (e.g., 64 bytes)
const secretKey = crypto.randomBytes(64).toString('hex');

console.log('Your Secret Key:', secretKey);