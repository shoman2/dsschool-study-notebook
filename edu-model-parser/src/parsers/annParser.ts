import { ModelParser } from "../schema/modelGraph";
import { parseWithDefaults } from "./baseParser";

export const annParser: ModelParser = (input) =>
  parseWithDefaults(input, "ann");
