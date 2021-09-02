import {
  define,
  observable,
  action,
} from '@formily/reactive'
import { FlowMetaParam } from '../types'

export class FlowLoop {
  id: string
  name: string
  connector?: {
    targetReference: string | null
  }
  defaultConnector?: {
    targetReference: string | null
  }
  nextValueConnector?: {
    targetReference: string | null
  }
  collectionReference?: string
  iterationOrder?: string

  constructor(flowLoop: FlowMetaParam) {
    this.id = flowLoop.id
    this.name = flowLoop.name
    this.connector = flowLoop.connector
    this.defaultConnector = flowLoop.defaultConnector
    this.nextValueConnector = flowLoop.nextValueConnector
    this.collectionReference = flowLoop.collectionReference
    this.iterationOrder = flowLoop.iterationOrder
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      connector: observable.deep,
      defaultConnector: observable.deep,
      nextValueConnector: observable.deep,
      collectionReference: observable.ref,
      iterationOrder: observable.ref,
      onEdit: action
    })
  }

  onEdit = (flowLoop: FlowMetaParam) => {
    this.id = flowLoop.id
    this.name = flowLoop.name
    this.connector = flowLoop.connector
    this.defaultConnector = flowLoop.defaultConnector
    this.nextValueConnector = flowLoop.nextValueConnector
    this.collectionReference = flowLoop.collectionReference
    this.iterationOrder = flowLoop.iterationOrder
  }
}