import { ModelParser } from "../schema/modelGraph";
import { parseWithDefaults } from "./baseParser";

export const gruParser: ModelParser = (input) =>
  parseWithDefaults(input, "gru");
