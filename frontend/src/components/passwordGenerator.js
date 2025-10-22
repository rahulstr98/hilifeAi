// utils/passwordGenerator.js

 export const generatePassword = (firstname, lastname, dob, rules) =>{
  const {
    minimumlength = 8,
    maximumlength = 20,
    lowercase = 1,
    uppercase = 1,
    specialcharacter = 1,
  } = rules;

  // Allowed sources
  const specials = "@#$&";
  const letters = (firstname + lastname).replace(/[^a-zA-Z]/g, "") || "User"; // fallback if no name
  const numbers = dob ? dob.replace(/\D/g, "") : "1234"; // only digits from DOB

  let passwordChars = [];

  // ✅ Add required lowercase
  for (let i = 0; i < lowercase; i++) {
    passwordChars.push(
      letters.toLowerCase()[Math.floor(Math.random() * letters.length)] || "a"
    );
  }

  // ✅ Add required uppercase
  for (let i = 0; i < uppercase; i++) {
    passwordChars.push(
      letters.toUpperCase()[Math.floor(Math.random() * letters.length)] || "A"
    );
  }

  // ✅ Add required special characters
  for (let i = 0; i < specialcharacter; i++) {
    passwordChars.push(specials[Math.floor(Math.random() * specials.length)]);
  }

  // ✅ Add at least 2 digits from DOB
  if (numbers.length > 0) {
    passwordChars.push(numbers.slice(0, 2));
  }

  // ✅ Fill the rest until minimum length (mix of letters + numbers + specials)
  const allChars = letters + numbers + specials;
  while (passwordChars.join("").length < minimumlength) {
    passwordChars.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // ✅ Ensure not exceeding maximum length
  if (passwordChars.join("").length > maximumlength) {
    passwordChars = passwordChars.slice(0, maximumlength);
  }

  // ✅ Shuffle the result
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}

  export const validatePassword =   (password, rules) =>{
  const errors = [];

  if (!password || password.trim() === "") {
    errors.push("Password is required");
    return { isValid: false, errors };
  }

  if (password.length < Number(rules?.minimumlength || 8)) {
    errors.push(`Password must be at least ${Number(rules?.minimumlength || 8)} characters long`);
    // return { isValid: errors.length === 0, errors };
  }

  if (password.length > Number(rules?.maximumlengh || 20)) {
    errors.push(`Password must not exceed ${Number(rules?.maximumlengh || 20)} characters`);
    // return { isValid: errors.length === 0, errors };
  }

  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  if (lowercaseCount < Number(rules.lowercase || 0)) {
    errors.push(`Password must contain at least ${Number(rules.lowercase || 0)} lowercase letters`);
    // return { isValid: errors.length === 0, errors };
  }

  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  if (uppercaseCount < Number(rules?.uppercase || 0)) {
    errors.push(`Password must contain at least ${Number(rules?.uppercase || 0)} uppercase letters`);
    // return { isValid: errors.length === 0, errors };
  }

  const specialCharCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
  if (specialCharCount < Number(rules?.specialcharacter || 0)) {
    errors.push(`Password must contain at least ${Number(rules?.specialcharacter || 0)} special characters`);
    // return { isValid: errors.length === 0, errors };
  }
return { isValid: errors.length === 0, errors };
  
}


// ✅ Reusable helper to attach actual File objects
export const attachFilesToObjects = async (dataArray, fileBaseUrl, fileKey = "filename") => {
  if (!Array.isArray(dataArray) || dataArray?.length === 0) return [];

  const updatedArray = await Promise.all(
    dataArray.map(async (item) => {
      if (item?.[fileKey]) {
        try {
          const response = await fetch(`${fileBaseUrl}/${item[fileKey]}`);
          const blob = await response.blob();

          // Create a File object (filename preserved)
          const file = new File([blob], item[fileKey], { type: blob.type });

          return {
            ...item,
            file, // ✅ Attach file directly here
            filename:""
          };
        } catch (err) {
          console.error("Error fetching file:", err);
          return item; // fallback if fetch fails
        }
      }
      return item; // unchanged if no filename
    })
  );

  return updatedArray;
};

// module.exports = { generatePassword,validatePassword };
