import {
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam } from '../types'

export class FlowSortCollectionProcessor {
  sortCollectionProcessor: FlowMetaParam[] = []

  constructor(flowSortCollections?: FlowMetaParam[]) {
    this.sortCollectionProcessor = flowSortCollections || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      sortCollectionProcessor: observable.deep,
    })
  }

  initDatas = (flowSortCollections: FlowMetaParam[]) => {
    this.sortCollectionProcessor = flowSortCollections
  }

  onAdd = (flowSortCollection: FlowMetaParam) => {
    this.sortCollectionProcessor.push(flowSortCollection)
  }

  onEdit = (flowSortCollection: FlowMetaParam) => {
    const idx = this.sortCollectionProcessor.findIndex((de) => de.id === flowSortCollection.id)
    if (idx > -1) this.sortCollectionProcessor.splice(idx, 1, flowSortCollection)
  }
}