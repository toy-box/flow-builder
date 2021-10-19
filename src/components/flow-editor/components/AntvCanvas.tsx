import React, { useEffect, useCallback } from 'react';
import { Graph } from '@antv/x6';
import { AntvCanvas as FlowCanvas } from '@toy-box/flow-graph';
import { observer } from '@formily/reactive-react'
import { connect, StartNode, ExtendNode, EndNode, DecisionNode, LoopNode,
  ActionNode, AssignNode, RecordCreateNode, RecordSearchNode, RecordEdithNode,
  RecordDeletehNode, CollectionSortNode } from '@toy-box/flow-nodes';
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

const STAND_SIZE = 56;

export const AntvCanvas = () => {
  const flowGraph = useFlowGraph();
  const flow = flowGraph.flowGraph;

  const submit = useCallback(
    (id, type, data) => {
      const graph = new Graph({
        container: document.getElementById('flow-canvas') || undefined,
        panning: true,
        grid: true,
        background: {
          color: '#fafafa',
        },
        frozen: true,
      });
      flow.setCanvas(
        new FlowCanvas({
          flowGraph: flow.flowGraph,
          canvas: graph,
          components: {
            StartNode: connect(StartNode, () => {
              return <div>start</div>;
            }),
            ExtendNode: connect(ExtendNode, <ExtendPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) =>submit(id, type, data)} />),
            EndNode: connect(EndNode),
            AssignNode: connect(AssignNode, <AssignPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
            DecisionNode: connect(DecisionNode, <DecisionPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
            SuspendNode: connect(ActionNode, <SuspendPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
            LoopNode: connect(LoopNode, <LoopPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
            CollectionSortNode: connect(CollectionSortNode, <CollectionSortPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
            RecordCreateNode: connect(RecordCreateNode, <RecordCreatePanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
            RecordDeletehNode: connect(RecordDeletehNode, <RecordDeletePanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
            RecordEdithNode: connect(RecordEdithNode, <RecordEditPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
            RecordSearchNode: connect(RecordSearchNode, <RecordSearchPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
          },
        })
      );
      flow.setFlowNode(flowGraph.flowNodes as any[])
    },
    [flow, flowGraph],
  )

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
    flow.setCanvas(
      new FlowCanvas({
        flowGraph: flow.flowGraph,
        canvas: graph,
        components: {
          StartNode: connect(StartNode, () => {
            return <div>start</div>;
          }),
          ExtendNode: connect(ExtendNode, <ExtendPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) =>submit(id, type, data)} />),
          EndNode: connect(EndNode),
          AssignNode: connect(AssignNode, <AssignPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
          DecisionNode: connect(DecisionNode, <DecisionPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
          SuspendNode: connect(ActionNode, <SuspendPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
          LoopNode: connect(LoopNode, <LoopPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
          CollectionSortNode: connect(CollectionSortNode, <CollectionSortPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
          RecordCreateNode: connect(RecordCreateNode, <RecordCreatePanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
          RecordDeletehNode: connect(RecordDeletehNode, <RecordDeletePanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
          RecordEdithNode: connect(RecordEdithNode, <RecordEditPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
          RecordSearchNode: connect(RecordSearchNode, <RecordSearchPanel flowGraph={flowGraph} callbackFunc={(id: string, type, data) => submit(id, type, data)} />),
        }
      })
    );
  }, [flow, flowGraph, submit]);

  useEffect(() => {
    console.log(111111111111)
    flow.setFlowNode(flowGraph.flowNodes as any[])
  }, [flow, flowGraph.flowNodes])

  return (
    <div id="flow-canvas" style={{ flex: 1 }}></div>
  );
};
