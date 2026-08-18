import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "./config";

type UploadImageArgs = {
  uri: string;
  publicId: string;
  folder: string;
};

// Unsigned upload straight from the client — no backend involved, and
// none needed (see config.ts for why this is safe without an API
// secret). React Native's FormData accepts a {uri, type, name} object
// in place of a real File/Blob, which is the reliable way to attach a
// local file:// URI here — unlike fetch(uri).blob(), which silently
// produces malformed blobs for local files on-device.
export async function uploadImageToCloudinary({ uri, publicId, folder }: UploadImageArgs): Promise<string> {
  const formData = new FormData();
  formData.append("file", { uri, type: "image/jpeg", name: `${publicId}.jpg` } as unknown as Blob);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("public_id", publicId);
  formData.append("folder", folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Image upload failed (${response.status}).`);
  }

  return data.secure_url as string;
}
