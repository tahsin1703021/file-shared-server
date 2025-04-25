import crypto from 'crypto';


const createPublicKey = (key) => crypto.randomBytes(16).toString('hex');
const createPrivateKey = (key) => crypto.randomBytes(32).toString('hex');

export default {
    createPublicKey,
    createPrivateKey
}