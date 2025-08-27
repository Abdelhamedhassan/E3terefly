import CryptoJS from "crypto-js";

export const encryptData = async ({ plainText = "", secrectKey = process.env.ENCRYPTION_SECRET_KEY } = {}) => {
  return CryptoJS.AES.encrypt(plainText, secrectKey).toString();
};

export const decryptData = async ({ cipherText = "", secrectKey = process.env.ENCRYPTION_SECRET_KEY } = {}) => {
  return CryptoJS.AES.decrypt(cipherText, secrectKey).toString(
    CryptoJS.enc.Utf8
  );
};
