/**
 * Cloudinary Unsigned Upload Helper
 */

export async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary config is incomplete in environment variables (VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET)');
  }

  // Client-side validations
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WEBP formats are allowed.');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File exceeds the 5MB size limit.');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Cloudinary upload failure response:', errText);
    throw new Error(`Cloudinary upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error('Cloudinary response did not contain secure_url');
  }

  return data.secure_url;
}
