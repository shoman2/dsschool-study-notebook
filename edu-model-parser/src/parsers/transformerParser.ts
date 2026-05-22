import { ModelParser } from "../schema/modelGraph";
import { parseWithDefaults } from "./baseParser";

export const transformerParser: ModelParser = (input) =>
  parseWithDefaults(input, "transformer");
