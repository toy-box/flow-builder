/*
 * @Author: OBKoro1
 * @Date: 2021-09-01 07:21:31
 * @LastEditTime: 2021-09-01 16:22:14
 * @LastEditors: Do not edit
 * @FilePath: /flow-builder/src/flow/models/FlowAssignment.ts
 * @Description: 
 */
import {
  define,
  observable,
} from '@formily/reactive'
import { ICompareOperation } from '@toy-box/meta-schema';
import { FlowMetaParam } from '../types'

export class FlowAssignment {
  id: string
  name: string
  description?: string
  connector?: {
    targetReference: string | null
  }
  defaultConnector?: {
    targetReference: string | null
  }
  criteria?: {
    conditions: ICompareOperation[]
  }

  constructor(flowAssignment: FlowMetaParam) {
    this.id = flowAssignment.id
    this.name = flowAssignment.name
    this.description = flowAssignment.description
    this.connector = flowAssignment.connector
    this.defaultConnector = flowAssignment.defaultConnector
    this.criteria = flowAssignment.criteria
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      description: observable.ref,
      connector: observable.deep,
      defaultConnector: observable.deep,
      criteria: observable.deep
    })
  }

  onEdit = (flowAssignment: FlowMetaParam) => {
    this.id = flowAssignment.id
    this.name = flowAssignment.name
    this.description = flowAssignment.description
    this.connector = flowAssignment.connector
    this.defaultConnector = flowAssignment.defaultConnector
    this.criteria = flowAssignment.criteria
  }
}