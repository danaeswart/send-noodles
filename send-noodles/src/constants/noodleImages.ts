// Vector/illustration assets in assets/noodle images/, added by hand and
// randomized wherever a noodle icon is shown. Add more require() entries
// here as more files land in that folder.
export const NOODLE_IMAGES = [require("../../assets/noodle images/noodle1.png")];

export function randomNoodleImage() {
  return NOODLE_IMAGES[Math.floor(Math.random() * NOODLE_IMAGES.length)];
}
