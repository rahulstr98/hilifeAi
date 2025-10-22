export const getBase64ImageFromUrl = async (imageUrl, maxWidth = 200, maxHeight = 100, targetSizeKB = 50) => {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = imageUrl;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Resize maintaining aspect ratio
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Try to compress to under 50KB
      let quality = 0.9;
      let base64 = '';
      // do {
      //     base64 = canvas.toDataURL('image/jpeg', quality);
      //     const sizeInKB = Math.round((base64.length * (3 / 4)) / 1024); // base64 size to KB
      //     if (sizeInKB <= targetSizeKB || quality < 0.1) break;
      //     quality -= 0.05; // reduce quality gradually
      // } while (true);

      const targetBytes = targetSizeKB * 1024;

      while (quality >= 0.3) {
        base64 = canvas.toDataURL('image/jpeg', quality); // Use 'jpeg' for better compression
        const byteSize = Math.round((base64.length * 3) / 4); // Estimate size in bytes

        if (byteSize <= targetBytes) {
          return resolve(base64);
        }

        quality -= 0.05;
      }

      resolve(base64);
    };

    img.onerror = (err) => reject(err);
  });
};
