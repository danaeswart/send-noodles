import { Platform } from "react-native";

export const colors = {
  ink: "#141414",
  paper: "#F3EEE2",
  paperDim: "#EAE5D6",
  accent: "#3F6E66",
  alert: "#B8563A",
  line: "#D8D2C0",
  muted: "#8C8672",
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const radius = { none: 0, sm: 2 };

const serifFamily = Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" });

export const type = {
  display: { fontSize: 34, fontWeight: "800" as const, letterSpacing: -0.5 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  heading: { fontSize: 20, fontWeight: "700" as const },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: "500" as const },
  // Italic serif — the headline/timer treatment unique to the daily
  // challenge feed. Deliberately not reused on other screens; this is
  // this screen's one signature element.
  serifDisplay: {
    fontFamily: serifFamily,
    fontWeight: "700" as const,
    fontStyle: "italic" as const,
    letterSpacing: -0.5,
  },
};
