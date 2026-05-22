import { ModelParser } from "../schema/modelGraph";
import { parseWithDefaults } from "./baseParser";

export const rnnParser: ModelParser = (input) =>
  parseWithDefaults(input, "rnn");
