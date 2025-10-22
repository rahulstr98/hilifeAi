import imageCompression from "browser-image-compression";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/Appcontext";
import { SERVICE } from "../services/Baseservice";

async function handleProfileImage(profileImage, name) {
  if (!profileImage) return null;

  let base64Data = profileImage;

  // 1️⃣ If it has "data:image/..." prefix, extract only the base64 part
  if (profileImage.includes(",")) {
    base64Data = profileImage.split(",")[1];
  }

  // 2️⃣ Convert base64 → Blob
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/png" });

  // 3️⃣ Compress image
  const options = {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  const compressedBlob = await imageCompression(blob, options);

  // 4️⃣ Convert back to Base64 (for backend)
  const compressedBase64 = await imageCompression.getDataUrlFromFile(compressedBlob);
  const compressedBase64Data = compressedBase64.split(",")[1];

  return compressedBase64Data;
}

const BiometricVisitorAddition = async ({ company, branch, name, photo, date }) => {
  const { auth } = useContext(AuthContext);
  try {
    // ✅ await handleProfileImage()
    const profileImage = await handleProfileImage(photo, "ProfilePhoto");

    // ✅ axios.post syntax fix — data first, then headers in config
    const visitorAdd = await axios.post(
      SERVICE.BIOMETRIC_VISITOR_ADDITION,
      {
        company,
        branch,
        name,
        photo: profileImage,
        expirydate: date,
      },
      {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      }
    );

    console.log("Visitor added:", visitorAdd.data);
  } catch (err) {
    console.error("Biometric Visitor Error:", err.message);
  }
};


export default BiometricVisitorAddition;