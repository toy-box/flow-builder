import {
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam } from '../types'

export class FlowLoops {
  loops: FlowMetaParam[] = []

  constructor(flowLoops?: FlowMetaParam[]) {
    this.loops = flowLoops || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      loops: observable.deep,
    })
  }

  initDatas = (flowLoops: FlowMetaParam[]) => {
    this.loops = flowLoops
  }

  onAdd = (flowLoop: FlowMetaParam) => {
    this.loops.push(flowLoop)
  }

  onEdit = (flowLoop: FlowMetaParam) => {
    const idx = this.loops.findIndex((de) => de.id === flowLoop.id)
    if (idx > -1) this.loops.splice(idx, 1, flowLoop)
  }
}