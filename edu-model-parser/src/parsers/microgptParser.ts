import { ModelParser } from "../schema/modelGraph";
import { parseWithDefaults } from "./baseParser";

export const microgptParser: ModelParser = (input) =>
  parseWithDefaults(input, "microgpt");
