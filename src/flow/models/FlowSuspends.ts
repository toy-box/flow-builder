import {
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam } from '../types'

export class FlowSuspends {
  suspends: FlowMetaParam[] = []

  constructor(suspends?: FlowMetaParam[]) {
    this.suspends = suspends || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      suspends: observable.deep,
    })
  }

  initDatas = (suspends: FlowMetaParam[]) => {
    this.suspends = suspends
  }

  onAdd = (flowSuspend: FlowMetaParam) => {
    this.suspends.push(flowSuspend)
  }

  onEdit = (flowSuspend: FlowMetaParam) => {
    const idx = this.suspends.findIndex((de) => de.id === flowSuspend.id)
    if (idx > -1) this.suspends.splice(idx, 1, flowSuspend)
  }
}