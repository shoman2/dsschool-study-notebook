import { ModelGraph, ModelNode, ParserInput } from "../schema/modelGraph";

const asArray = (value: unknown): Array<Record<string, unknown>> =>
  Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];

const asTensorShape = (value: unknown): Array<number | null> | undefined => {
  if (!Array.isArray(value)) return undefined;
  return value.map((v) => (typeof v === "number" ? v : null));
};

const toNode = (raw: Record<string, unknown>, index: number): ModelNode => ({
  id: String(raw.id ?? `node-${index}`),
  type: String(raw.type ?? raw.className ?? "layer"),
  name: typeof raw.name === "string" ? raw.name : undefined,
  tensorShape: asTensorShape(raw.tensorShape ?? raw.batchInputShape ?? raw.outputShape),
  activation: typeof raw.activation === "string" ? raw.activation : undefined,
  params: typeof raw.params === "object" && raw.params !== null
    ? (raw.params as Record<string, unknown>)
    : raw.config && typeof raw.config === "object"
      ? (raw.config as Record<string, unknown>)
      : undefined,
  notes: typeof raw.notes === "string" ? raw.notes : undefined
});

export const parseWithDefaults = (
  input: ParserInput,
  parserName: string
): ModelGraph => {
  const layerLike = asArray(input.layers).length > 0 ? asArray(input.layers) : asArray(input.nodes);
  const nodes = layerLike.map(toNode);

  const edges = nodes.slice(0, -1).map((node, idx) => ({
    from: node.id,
    to: nodes[idx + 1].id,
    notes: "auto-linked sequential flow"
  }));

  return {
    nodes,
    edges,
    tensorShape: asTensorShape(input.tensorShape),
    activation: typeof input.activation === "string" ? input.activation : undefined,
    params: typeof input.params === "object" && input.params !== null
      ? (input.params as Record<string, unknown>)
      : undefined,
    notes: typeof input.notes === "string"
      ? input.notes
      : `${parserName} parser normalized model input`
  };
};
