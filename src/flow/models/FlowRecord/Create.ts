import {
  action,
  define,
  observable,
} from '@formily/reactive'
import { ICompareOperation } from '@toy-box/meta-schema';
import { FlowMetaParam, TargetReference } from '../../types'

export class RecordCreate {
  id: string
  name: string
  description?: string
  connector?: TargetReference
  defaultConnector?: TargetReference
  registerId?: string
  inputAssignments?: ICompareOperation[]
  storeOutputAutomatically?: boolean
  assignRecordIdToReference?: string

  constructor(recordCreate: FlowMetaParam) {
    this.id = recordCreate.id
    this.name = recordCreate.name
    this.description = recordCreate.description
    this.connector = recordCreate.connector
    this.defaultConnector = recordCreate.defaultConnector
    this.registerId = recordCreate.registerId
    this.inputAssignments = recordCreate.inputAssignments
    this.storeOutputAutomatically = recordCreate.storeOutputAutomatically
    this.assignRecordIdToReference = recordCreate.assignRecordIdToReference
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
      inputAssignments: observable.shallow,
      storeOutputAutomatically: observable.ref,
      assignRecordIdToReference: observable.ref,
      onEdit: action
    })
  }

  onEdit = (recordCreate: FlowMetaParam) => {
    this.id = recordCreate.id
    this.name = recordCreate.name
    this.description = recordCreate.description
    this.connector = recordCreate.connector
    this.defaultConnector = recordCreate.defaultConnector
    this.registerId = recordCreate.registerId
    this.inputAssignments = recordCreate.inputAssignments
    this.storeOutputAutomatically = recordCreate.storeOutputAutomatically
    this.assignRecordIdToReference = recordCreate.assignRecordIdToReference
  }
}