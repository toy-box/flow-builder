import {
  action,
  define,
  observable,
} from '@formily/reactive'
import { ICompareOperation } from '@toy-box/meta-schema';
import { FlowMetaParam, TargetReference, IInputAssignment } from '../../types'

export class RecordCreate {
  id: string
  name: string
  description?: string
  connector?: TargetReference
  faultConnector?: TargetReference
  registerId?: string
  inputAssignments?: IInputAssignment[]
  storeOutputAutomatically?: boolean
  assignRecordIdToReference?: string

  constructor(recordCreate: FlowMetaParam) {
    this.id = recordCreate.id
    this.name = recordCreate.name
    this.description = recordCreate.description
    this.connector = recordCreate.connector
    this.faultConnector = recordCreate.faultConnector
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
      faultConnector: observable.deep,
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
    this.faultConnector = recordCreate.faultConnector
    this.registerId = recordCreate.registerId
    this.inputAssignments = recordCreate.inputAssignments
    this.storeOutputAutomatically = recordCreate.storeOutputAutomatically
    this.assignRecordIdToReference = recordCreate.assignRecordIdToReference
  }
}