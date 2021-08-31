import {
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam } from '../types'

export class FlowAssignments {
  assignments: FlowMetaParam[] = []

  constructor(flowAssignments?: FlowMetaParam[]) {
    this.assignments = flowAssignments || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      assignments: observable.deep,
    })
  }

  initDatas = (flowAssignments: FlowMetaParam[]) => {
    this.assignments = flowAssignments
  }

  onAdd = (flowAssignment: FlowMetaParam) => {
    this.assignments.push(flowAssignment)
  }

  onEdit = (flowAssignment: FlowMetaParam) => {
    const idx = this.assignments.findIndex((ag) => ag.id === flowAssignment.id)
    if (idx > -1) this.assignments.splice(idx, 1, flowAssignment)
  }
}