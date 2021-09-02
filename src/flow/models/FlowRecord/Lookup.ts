import {
  define,
  observable,
  action
} from '@formily/reactive'
import { ICompareOperation } from '@toy-box/meta-schema';
import { FlowMetaParam, TargetReference, Criteria, SortOrder } from '../../types'

export class RecordLookup {
  id: string
  name: string
  description?: string
  connector?: TargetReference
  defaultConnector?: TargetReference
  criteria?: Criteria
  registerId?: string
  outputAssignments?: ICompareOperation[]
  outputReference?: null | string
  queriedFields?: string[]
  sortOrder?: SortOrder
  sortField?: string
  getFirstRecordOnly?: boolean
  storeOutputAutomatically?: boolean

  constructor(recordLookup: FlowMetaParam) {
    this.id = recordLookup.id
    this.name = recordLookup.name
    this.description = recordLookup.description
    this.connector = recordLookup.connector
    this.defaultConnector = recordLookup.defaultConnector
    this.registerId = recordLookup.registerId
    this.criteria = recordLookup.criteria
    this.outputAssignments = recordLookup.outputAssignments
    this.outputReference = recordLookup.outputReference
    this.queriedFields = recordLookup.queriedFields
    this.sortOrder = recordLookup.sortOrder
    this.sortField = recordLookup.sortField
    this.getFirstRecordOnly = recordLookup.getFirstRecordOnly
    this.storeOutputAutomatically = recordLookup.storeOutputAutomatically
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      description: observable.ref,
      connector: observable.deep,
      defaultConnector: observable.deep,
      registerId: observable.ref,
      criteria: observable.deep,
      outputAssignments: observable.shallow,
      outputReference: observable.ref,
      queriedFields: observable.shallow,
      sortOrder: observable.deep,
      sortField: observable.ref,
      getFirstRecordOnly: observable.ref,
      storeOutputAutomatically: observable.ref,
      onEdit: action
    })
  }

  onEdit = (recordLookup: FlowMetaParam) => {
    this.id = recordLookup.id
    this.name = recordLookup.name
    this.description = recordLookup.description
    this.connector = recordLookup.connector
    this.defaultConnector = recordLookup.defaultConnector
    this.registerId = recordLookup.registerId
    this.criteria = recordLookup.criteria
    this.outputAssignments = recordLookup.outputAssignments
    this.outputReference = recordLookup.outputReference
    this.queriedFields = recordLookup.queriedFields
    this.sortOrder = recordLookup.sortOrder
    this.sortField = recordLookup.sortField
    this.getFirstRecordOnly = recordLookup.getFirstRecordOnly
    this.storeOutputAutomatically = recordLookup.storeOutputAutomatically
  }
}