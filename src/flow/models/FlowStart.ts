import {
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam } from '../types'

export class FlowStart {
  start: FlowMetaParam | undefined

  constructor(flowStart?: FlowMetaParam) {
    this.start = flowStart
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      start: observable.deep,
    })
  }

  initData = (flowStart: FlowMetaParam) => {
    this.start = flowStart
  }

  onEdit = (flowStart: FlowMetaParam) => {
    this.start = flowStart
  }
}