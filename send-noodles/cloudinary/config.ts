// Cloudinary account these snaps upload to. Both values are safe to ship
// in the client: a cloud name and an *unsigned* upload preset name are
// meant to be public — unlike an API key/secret, they can't be used to
// do anything beyond what the preset itself allows, and no API
// key/secret appears anywhere in this app. Configured in the Cloudinary
// console under Settings → Upload → Upload presets.
export const CLOUDINARY_CLOUD_NAME = "drieue552";
export const CLOUDINARY_UPLOAD_PRESET = "send_noodles_snaps";
