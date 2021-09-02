import {
  action,
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam, SortOption, TargetReference } from '../types'

export class FlowSortCollectionProcessor {
  id: string
  name: string
  description?: string
  connector?: TargetReference
  defaultConnector?: TargetReference
  collectionReference?: string
  limit?: null | number
  sortOptions?: SortOption[]

  constructor(flowSortCollection: FlowMetaParam) {
    this.id = flowSortCollection.id
    this.name = flowSortCollection.name
    this.connector = flowSortCollection.connector
    this.defaultConnector = flowSortCollection.defaultConnector
    this.collectionReference = flowSortCollection.collectionReference
    this.limit = flowSortCollection.limit
    this.sortOptions = flowSortCollection.sortOptions
    this.description = flowSortCollection.description
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      connector: observable.deep,
      defaultConnector: observable.deep,
      collectionReference: observable.ref,
      limit: observable.ref,
      sortOptions: observable.shallow,
      onEdit: action
    })
  }

  onEdit = (flowSortCollection: FlowMetaParam) => {
    this.id = flowSortCollection.id
    this.name = flowSortCollection.name
    this.connector = flowSortCollection.connector
    this.defaultConnector = flowSortCollection.defaultConnector
    this.collectionReference = flowSortCollection.collectionReference
    this.limit = flowSortCollection.limit
    this.sortOptions = flowSortCollection.sortOptions
    this.description = flowSortCollection.description
  }
}