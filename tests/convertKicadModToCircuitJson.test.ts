import { describe, expect, it } from "bun:test";
import { convertKicadModToCircuitJson } from "../src/convertKicadModToCircuitJson";

const footprintWithRectangularPinOne = `
  (footprint "Pin1Test"
    (version 20240108)
    (generator pcbnew)
    (layer "F.Cu")
    (pad "1" thru_hole rect
      (at 0 0)
      (size 2 2)
      (drill 1)
      (layers "*.Cu" "*.Mask"))
    (pad "2" thru_hole circle
      (at 2.54 0)
      (size 2 2)
      (drill 1)
      (layers "*.Cu" "*.Mask")))
`;

const footprintWithRotatedOvalNpth = `
  (footprint "RotatedSlotTest"
    (version 20240108)
    (generator pcbnew)
    (layer "F.Cu")
    (pad "" np_thru_hole oval
      (at 1 2 30)
      (size 1.5 2)
      (drill oval 1.5 2)
      (layers "F&B.Cu" "*.Mask")))
`;

describe("convertKicadModToCircuitJson", () => {
  it("preserves a rectangular through-hole pin 1", () => {
    const circuitJson = convertKicadModToCircuitJson(
      "Pin1Test.kicad_mod",
      footprintWithRectangularPinOne
    );

    const pinOne = circuitJson.find(
      (element) =>
        element.type === "pcb_plated_hole" && element.port_hints?.includes("1")
    );

    expect(pinOne).toMatchObject({
      type: "pcb_plated_hole",
      shape: "circular_hole_with_rect_pad",
      pad_shape: "rect",
      hole_shape: "circle",
    });
  });

  it("preserves rotated oval non-plated slots", () => {
    const circuitJson = convertKicadModToCircuitJson(
      "RotatedSlotTest.kicad_mod",
      footprintWithRotatedOvalNpth
    );

    const slot = circuitJson.find((element) => element.type === "pcb_hole");

    expect(slot).toMatchObject({
      type: "pcb_hole",
      hole_shape: "rotated_pill",
      hole_width: 1.5,
      hole_height: 2,
      ccw_rotation: 30,
    });
  });
});
