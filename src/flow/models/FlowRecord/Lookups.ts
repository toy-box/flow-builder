import {
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam } from '../../types'

export class RecordLookups {
  recordLookups: FlowMetaParam[] = []

  constructor(recordLookups?: FlowMetaParam[]) {
    this.recordLookups = recordLookups || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      recordLookups: observable.deep,
    })
  }

  initDatas = (recordLookups: FlowMetaParam[]) => {
    this.recordLookups = recordLookups
  }

  onAdd = (recordLookup: FlowMetaParam) => {
    this.recordLookups.push(recordLookup)
  }

  onEdit = (recordLookup: FlowMetaParam) => {
    const idx = this.recordLookups.findIndex((de) => de.id === recordLookup.id)
    if (idx > -1) this.recordLookups.splice(idx, 1, recordLookup)
  }
}