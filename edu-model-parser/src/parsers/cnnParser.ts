import { ModelParser } from "../schema/modelGraph";
import { parseWithDefaults } from "./baseParser";

export const cnnParser: ModelParser = (input) =>
  parseWithDefaults(input, "cnn");
