export type TensorShape = Array<number | null>;

export interface ModelNode {
  id: string;
  type: string;
  name?: string;
  tensorShape?: TensorShape;
  activation?: string;
  params?: Record<string, unknown>;
  notes?: string;
}

export interface ModelEdge {
  from: string;
  to: string;
  notes?: string;
}

export interface ModelGraph {
  nodes: ModelNode[];
  edges: ModelEdge[];
  tensorShape?: TensorShape;
  activation?: string;
  params?: Record<string, unknown>;
  notes?: string;
}

export type ParserInput = {
  modelType?: string;
  layers?: Array<Record<string, unknown>>;
  nodes?: Array<Record<string, unknown>>;
  edges?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type ModelParser = (input: ParserInput) => ModelGraph;
