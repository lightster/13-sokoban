import {
  FLOOR,
  OUTSIDE_TOP_LEFT,
  OUTSIDE_TOP,
  OUTSIDE_TOP_RIGHT,
  OUTSIDE_LEFT,
  SHADOW_TOP_LEFT,
  SHADOW_TOP,
  SHADOW_TOP_RIGHT,
  OUTSIDE_RIGHT,
  SHADOW_LEFT,
  OUTSIDE_BOTTOM_LEFT,
  OUTSIDE_BOTTOM,
  OUTSIDE_BOTTOM_RIGHT,
} from "../Tileset.js";
import { MapSpec } from "../types.js";

const map: MapSpec = {
  width: 15,
  height: 15,
  background: {
    data: [
      ...Array(15).fill(FLOOR),
      ...[
        FLOOR,
        SHADOW_TOP_LEFT,
        ...Array(15 - 4).fill(SHADOW_TOP),
        SHADOW_TOP_RIGHT,
        FLOOR,
      ],
      ...Array(15 - 3)
        .fill([FLOOR, SHADOW_LEFT, ...Array(15 - 3).fill(FLOOR), FLOOR])
        .flat(),
      ...Array(15).fill(FLOOR),
    ],
  },
  structures: {
    data: [
      OUTSIDE_TOP_LEFT,
      ...Array(15 - 2).fill(OUTSIDE_TOP),
      OUTSIDE_TOP_RIGHT,
      OUTSIDE_LEFT,
      ...Array(15 - 2).fill(0),
      OUTSIDE_RIGHT,
      ...Array(15 - 3)
        .fill([OUTSIDE_LEFT, ...Array(15 - 2).fill(0), OUTSIDE_RIGHT])
        .flat(),
      OUTSIDE_BOTTOM_LEFT,
      ...Array(15 - 2).fill(OUTSIDE_BOTTOM),
      OUTSIDE_BOTTOM_RIGHT,
    ],
  },
  objects: {
    data: `
---------------
-PBBBBBBBBBB-B-
--B-B-------BB-
--BB-BBBBBBB-B-
--BB-BBBB-BB-B-
--BB-B-B-BBB-B-
--BB-BBCB-BB-B-
--BB-BBBB-BB-B-
--BB-BBBB-BB-B-
--BBB----B-B-B-
--BB-BBBBBBB-B-
--BBBBBBBBBB-B-
-B----------B--
--BBBBBBBBBBBB-
---------------
`,
  },
};

export default map;
