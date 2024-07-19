function generateRandomMyReferalCode() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';

    let firstPart = '';
    for (let i = 0; i < 4; i++) {
        firstPart += alphabet.charAt(Math.floor(Math.random() * alphabet.length)).toUpperCase();
    }

    let secondPart = '';
    for (let i = 0; i < 6; i++) {
        secondPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return firstPart + secondPart;
}

module.exports = generateRandomMyReferalCode;

