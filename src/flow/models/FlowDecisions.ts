import {
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam } from '../types'

export class FlowDecisions {
  decisions: FlowMetaParam[] = []

  constructor(flowDecisions?: FlowMetaParam[]) {
    this.decisions = flowDecisions || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      decisions: observable.deep,
    })
  }

  initDatas = (flowDecisions: FlowMetaParam[]) => {
    this.decisions = flowDecisions
  }

  onAdd = (flowDecision: FlowMetaParam) => {
    this.decisions.push(flowDecision)
  }

  onEdit = (flowDecision: FlowMetaParam) => {
    const idx = this.decisions.findIndex((de) => de.id === flowDecision.id)
    if (idx > -1) this.decisions.splice(idx, 1, flowDecision)
  }
}