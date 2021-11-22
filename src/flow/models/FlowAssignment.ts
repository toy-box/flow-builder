import {
  define,
  observable,
  action
} from '@formily/reactive'
import { ICompareOperation } from '@toy-box/meta-schema';
import { FlowMetaParam, TargetReference, IAssignmentData } from '../types'

export class FlowAssignment {
  id: string
  name: string
  description?: string
  connector?: TargetReference
  defaultConnector?: TargetReference
  assignmentItems?: IAssignmentData[]

  constructor(flowAssignment: FlowMetaParam) {
    this.id = flowAssignment.id
    this.name = flowAssignment.name
    this.description = flowAssignment.description
    this.connector = flowAssignment.connector
    this.defaultConnector = flowAssignment.defaultConnector
    this.assignmentItems = flowAssignment.assignmentItems
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      description: observable.ref,
      connector: observable.deep,
      defaultConnector: observable.deep,
      assignmentItems: observable.deep,
      onEdit: action
    })
  }

  onEdit = (flowAssignment: FlowMetaParam) => {
    this.id = flowAssignment.id
    this.name = flowAssignment.name
    this.description = flowAssignment.description
    this.connector = flowAssignment.connector
    this.defaultConnector = flowAssignment.defaultConnector
    this.assignmentItems = flowAssignment.assignmentItems
  }
}