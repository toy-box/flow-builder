import React, { useEffect, useCallback } from 'react';
import { Graph } from '@antv/x6';
import { AntvCanvas as FlowCanvas } from '@toy-box/flow-graph';
import { observer } from '@formily/reactive-react'
import { connect, StartNode, ExtendNode, EndNode, DecisionNode, LoopNode,
  ActionNode, AssignNode, RecordCreateNode, RecordSearchNode, RecordEdithNode,
  RecordDeletehNode, CollectionSortNode, LabelNode } from '@toy-box/flow-nodes';
import { useFlowGraph } from '../../../flow/hooks/useFlowGraph'
import { ExtendPanel } from './ExtendPanel';
import { DecisionPanel } from './DecisionPanel';
import { LoopPanel } from './LoopPanel';
import { AssignPanel } from './AssignPanel';
import { CollectionSortPanel } from './CollectionSortPanel';
import { RecordCreatePanel } from './RecordCreatePanel';
import { RecordDeletePanel } from './RecordDeletePanel';
import { RecordEditPanel } from './RecordEditPanel';
import { RecordSearchPanel } from './RecordSearchPanel';
import { SuspendPanel } from './SuspendPanel';
import { LabelPanel } from './LabelPanel';
import { LabelNodePanel } from './LabelNodePanel';
import { StartPanel } from './StartPanel';
import { StartLabelPanel } from './StartLabelPanel';
import { FlowMetaType } from '../../../flow/types';

export const AntvCanvas = observer(() => {
  const flowGraph = useFlowGraph();
  const flow = flowGraph.flowGraph;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const graph = new Graph({
      container: document.getElementById('flow-canvas') || undefined,
      panning: true,
      grid: true,
      background: {
        color: '#fafafa',
      },
      frozen: true,
    });
    graph.positionContent('top')
    flow.setCanvas(
      new FlowCanvas({
        flowGraph: flow.flowGraph,
        canvas: graph,
        components: {
          StartNode: connect(StartNode, <StartPanel flowGraph={flowGraph} />, <StartLabelPanel flowGraph={flowGraph} flowNodeType={FlowMetaType.ASSIGNMENT} />),
          ExtendNode: connect(ExtendNode, <ExtendPanel flowGraph={flowGraph} />),
          LabelNode: connect(LabelNode, <LabelNodePanel flowGraph={flowGraph} />),
          EndNode: connect(EndNode),
          AssignNode: connect(AssignNode, <AssignPanel flowGraph={flowGraph} />, <LabelPanel flowGraph={flowGraph} flowNodeType={FlowMetaType.ASSIGNMENT} />),
          DecisionNode: connect(DecisionNode, <DecisionPanel flowGraph={flowGraph} />, <LabelPanel flowGraph={flowGraph} flowNodeType={FlowMetaType.DECISION} />),
          SuspendNode: connect(ActionNode, <SuspendPanel flowGraph={flowGraph} />, <LabelPanel flowGraph={flowGraph} flowNodeType={FlowMetaType.WAIT} />),
          LoopNode: connect(LoopNode, <LoopPanel flowGraph={flowGraph} />, <LabelPanel flowGraph={flowGraph} flowNodeType={FlowMetaType.LOOP} />),
          CollectionSortNode: connect(CollectionSortNode, <CollectionSortPanel flowGraph={flowGraph} />, <LabelPanel flowGraph={flowGraph} flowNodeType={FlowMetaType.SORT_COLLECTION_PROCESSOR} />),
          RecordCreateNode: connect(RecordCreateNode, <RecordCreatePanel flowGraph={flowGraph} />, <LabelPanel flowGraph={flowGraph} flowNodeType={FlowMetaType.RECORD_CREATE} />),
          RecordDeletehNode: connect(RecordDeletehNode, <RecordDeletePanel flowGraph={flowGraph} />, <LabelPanel flowGraph={flowGraph} flowNodeType={FlowMetaType.RECORD_DELETE} />),
          RecordEdithNode: connect(RecordEdithNode, <RecordEditPanel flowGraph={flowGraph} />, <LabelPanel flowGraph={flowGraph} flowNodeType={FlowMetaType.RECORD_UPDATE} />),
          RecordSearchNode: connect(RecordSearchNode, <RecordSearchPanel flowGraph={flowGraph} />, <LabelPanel flowGraph={flowGraph} flowNodeType={FlowMetaType.RECORD_LOOKUP} />),
        }
      })
    );
  }, [flow, flowGraph]);

  useEffect(() => {
    flow.setFlowNode(flowGraph.flowNodes as any[])
  }, [flow, flowGraph.flowNodes])

  return (
    <div id="flow-canvas" style={{ flex: 1 }}></div>
  );
});
