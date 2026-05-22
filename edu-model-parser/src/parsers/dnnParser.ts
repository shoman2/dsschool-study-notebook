import { ModelParser } from "../schema/modelGraph";
import { parseWithDefaults } from "./baseParser";

export const dnnParser: ModelParser = (input) =>
  parseWithDefaults(input, "dnn");
