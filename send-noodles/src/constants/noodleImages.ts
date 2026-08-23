// Vector/illustration assets in assets/noodle images/, added by hand and
// randomized wherever a noodle icon is shown (the send-page drag handle,
// the noodle-sent confetti). Metro needs a static require() per file — it
// can't glob the folder at build time — so each new noodleN.png dropped
// in there needs one line added below to actually enter the pool.
export const NOODLE_IMAGES = [
  require("../../assets/noodle images/noodle1.png"),
  require("../../assets/noodle images/noodle2.png"),
];

export function randomNoodleImage() {
  return NOODLE_IMAGES[Math.floor(Math.random() * NOODLE_IMAGES.length)];
}
