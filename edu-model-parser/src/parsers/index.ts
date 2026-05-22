import { ModelParser } from "../schema/modelGraph";
import { annParser } from "./annParser";
import { cnnParser } from "./cnnParser";
import { dnnParser } from "./dnnParser";
import { gruParser } from "./gruParser";
import { microgptParser } from "./microgptParser";
import { rnnParser } from "./rnnParser";
import { transformerParser } from "./transformerParser";

const parserRegistry: Record<string, ModelParser> = {
  ann: annParser,
  dnn: dnnParser,
  cnn: cnnParser,
  rnn: rnnParser,
  gru: gruParser,
  transformer: transformerParser,
  microgpt: microgptParser
};

export const getParserByModelType = (modelType: string): ModelParser => {
  const parser = parserRegistry[modelType.toLowerCase()];
  if (!parser) {
    throw new Error(`Unsupported model type: ${modelType}`);
  }
  return parser;
};

export { parserRegistry };
