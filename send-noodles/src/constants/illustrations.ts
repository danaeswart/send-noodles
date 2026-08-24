// Illustration art for the Home challenge cards, in assets/illustrations/.
// Metro needs a static require() per file — it can't glob the folder at
// build time — so each new illustrationN.png dropped in there needs one
// line added below to actually enter the random-pick pool.
export const ILLUSTRATIONS: number[] = [
  require("../../assets/illustrations/illustration1.png"),
  require("../../assets/illustrations/illustration2.png"),
];

export function randomIllustration(): number {
  return ILLUSTRATIONS[Math.floor(Math.random() * ILLUSTRATIONS.length)];
}
