import CryptoJS from "crypto-js";

// 1. Generate a Consistent Shared Key for two users
export const getSharedKey = (userA: string, userB: string) => {
    // Sort names so "Alice"+"Bob" and "Bob"+"Alice" make the SAME key
    const participants = [userA, userB].sort().join("-");
    return CryptoJS.SHA256(participants).toString();
};

// 2. Encrypt (Before sending)
export const encryptMessage = (text: string, sharedKey: string) => {
    return CryptoJS.AES.encrypt(text, sharedKey).toString();
};

// 3. Decrypt (After receiving)
export const decryptMessage = (cipherText: string, sharedKey: string) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, sharedKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};
