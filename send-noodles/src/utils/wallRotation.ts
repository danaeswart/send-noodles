// The Gallery Wall's whole canvas is rendered rotated 90deg to turn a
// "landscape" layout into something that fits the upright phone (see
// GalleryWallScreen). Shared here so both the screen and WallFrame
// agree on the same rotation.
export const WALL_ROTATE_DEG: 90 | -90 = 90;

// react-native-gesture-handler reports pan deltas in real screen-space
// pixels, but a dragged frame's translateX/Y are applied *inside* the
// rotated canvas, in that canvas's own pre-rotation local axes. This
// converts a screen-space delta into that local space so a drag tracks
// the finger instead of appearing rotated 90deg off from it.
export function screenDeltaToLocal(dxScreen: number, dyScreen: number) {
  "worklet";
  return WALL_ROTATE_DEG === 90
    ? { dx: dyScreen, dy: -dxScreen }
    : { dx: -dyScreen, dy: dxScreen };
}
