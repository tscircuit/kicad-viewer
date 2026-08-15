import { KicadFootprintToCircuitJsonConverter } from "kicad-to-circuit-json";

export const convertKicadModToCircuitJson = (
  fileName: string,
  fileContent: string
) => {
  const converter = new KicadFootprintToCircuitJsonConverter();
  converter.addFile(fileName, fileContent);
  converter.runUntilFinished();
  return converter.getOutput();
};
