import React, { useMemo, useState } from 'react';
import './ModelGraphView.css';

export type ModelType = 'cnn' | 'rnn' | 'gru' | 'transformer' | 'microgpt' | 'generic';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  layerIndex?: number;
  inputShape?: string;
  outputShape?: string;
  params?: number;
  activation?: string;
  description?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  kind?: 'default' | 'skip' | 'time' | 'branch';
}

export interface ModelGraph {
  modelType: ModelType;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface ModelGraphViewProps {
  modelGraph: ModelGraph;
  className?: string;
}

const HIGHLIGHT_RULES: Record<ModelType, string[]> = {
  cnn: ['conv', 'pool', 'flatten', 'dense'],
  rnn: ['embedding', 'rnn', 'time-step', 'recurrent', 'dense'],
  gru: ['embedding', 'gru', 'time-step', 'recurrent', 'dense'],
  transformer: ['embedding', 'mha', 'attention', 'ffn', 'residual', 'layer norm', 'norm'],
  microgpt: ['embedding', 'mha', 'attention', 'ffn', 'residual', 'layer norm', 'norm'],
  generic: []
};

const EDUCATION_TOOLTIPS: Record<ModelType, string> = {
  cnn: 'Conv는 공간 특징을 추출하고 Pool은 축약합니다. Flatten 후 Dense에서 최종 분류/회귀를 수행합니다.',
  rnn: 'RNN은 h_t = f(x_t, h_{t-1}) 형태로 time-step마다 hidden state를 갱신합니다.',
  gru: 'GRU update gate: z_t = σ(W_z·[h_{t-1}, x_t]). 후보 상태와 이전 상태를 혼합해 장기 의존성을 보존합니다.',
  transformer:
    'Attention score는 softmax(QK^T / √d_k)로 계산하고, residual + layer norm으로 정보 흐름을 안정화합니다.',
  microgpt:
    'MicroGPT 블록은 embedding → causal MHA → FFN, 각 단계에 residual/layer norm이 결합됩니다.',
  generic: '노드 클릭 시 텐서 shape, 파라미터 수, activation 정보를 확인하세요.'
};

function groupNodesByLayer(nodes: GraphNode[]): GraphNode[][] {
  const hasLayer = nodes.some((n) => typeof n.layerIndex === 'number');
  if (hasLayer) {
    const buckets = new Map<number, GraphNode[]>();
    for (const node of nodes) {
      const idx = node.layerIndex ?? 0;
      if (!buckets.has(idx)) {
        buckets.set(idx, []);
      }
      buckets.get(idx)?.push(node);
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a - b)
      .map(([, group]) => group);
  }

  return nodes.map((node) => [node]);
}

function isHighlighted(node: GraphNode, modelType: ModelType): boolean {
  const words = HIGHLIGHT_RULES[modelType];
  if (!words.length) {
    return false;
  }

  const mergedText = `${node.type} ${node.label}`.toLowerCase();
  return words.some((keyword) => mergedText.includes(keyword));
}

export function ModelGraphView({ modelGraph, className }: ModelGraphViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(modelGraph.nodes[0]?.id ?? null);
  const [educationMode, setEducationMode] = useState(false);

  const layers = useMemo(() => groupNodesByLayer(modelGraph.nodes), [modelGraph.nodes]);
  const selectedNode = modelGraph.nodes.find((node) => node.id === selectedNodeId) ?? null;

  return (
    <div className={`model-graph-view ${className ?? ''}`.trim()}>
      <div className="model-graph-toolbar">
        <strong>{modelGraph.modelType.toUpperCase()} Graph</strong>
        <label className="education-toggle">
          <input
            type="checkbox"
            checked={educationMode}
            onChange={(e) => setEducationMode(e.target.checked)}
          />
          교육 모드
        </label>
      </div>

      {educationMode && <div className="education-hint">💡 {EDUCATION_TOOLTIPS[modelGraph.modelType]}</div>}

      <div className="graph-content">
        <div className="graph-canvas" role="list" aria-label="Model graph layers">
          {layers.map((layerNodes, layerIdx) => (
            <div className="layer-column" key={`layer-${layerIdx}`}>
              <div className="layer-title">Layer {layerIdx + 1}</div>
              {layerNodes.map((node) => {
                const active = node.id === selectedNodeId;
                const highlighted = isHighlighted(node, modelGraph.modelType);

                return (
                  <button
                    key={node.id}
                    type="button"
                    className={[
                      'graph-node',
                      active ? 'active' : '',
                      highlighted ? 'highlighted' : '',
                      educationMode ? 'education' : ''
                    ]
                      .join(' ')
                      .trim()}
                    onClick={() => setSelectedNodeId(node.id)}
                    title={educationMode ? node.description ?? EDUCATION_TOOLTIPS[modelGraph.modelType] : node.label}
                  >
                    <span className="node-label">{node.label}</span>
                    <span className="node-type">{node.type}</span>
                  </button>
                );
              })}
            </div>
          ))}

          <div className="edge-list" aria-label="Model graph edges">
            {modelGraph.edges.map((edge, index) => (
              <div key={`${edge.from}-${edge.to}-${index}`} className={`edge edge-${edge.kind ?? 'default'}`}>
                <span>{edge.from}</span> → <span>{edge.to}</span>
                {edge.kind === 'skip' && <em className="edge-badge">skip-connection</em>}
                {edge.kind === 'branch' && <em className="edge-badge">branch</em>}
                {edge.kind === 'time' && <em className="edge-badge">time-step</em>}
                {edge.label ? <small className="edge-label">({edge.label})</small> : null}
              </div>
            ))}
          </div>
        </div>

        <aside className="shape-panel">
          <h3>Tensor Shape</h3>
          {!selectedNode && <p>노드를 선택하면 shape 정보를 표시합니다.</p>}
          {selectedNode && (
            <dl>
              <dt>Layer</dt>
              <dd>{selectedNode.label}</dd>
              <dt>Input Shape</dt>
              <dd>{selectedNode.inputShape ?? '-'}</dd>
              <dt>Output Shape</dt>
              <dd>{selectedNode.outputShape ?? '-'}</dd>
              <dt>Parameters</dt>
              <dd>{selectedNode.params?.toLocaleString() ?? '-'}</dd>
              <dt>Activation</dt>
              <dd>{selectedNode.activation ?? '-'}</dd>
            </dl>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ModelGraphView;
