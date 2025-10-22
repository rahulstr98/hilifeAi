import CryptoJS from 'crypto-js';

export const secretKey = '2023/hrms/v1';

export function encryptRoute(route) {
  const encrypted = CryptoJS.AES.encrypt(route, secretKey).toString();
  return encodeURIComponent(encrypted);
}

export function decryptRoute(encryptedRoute) {
  const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedRoute), secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}
