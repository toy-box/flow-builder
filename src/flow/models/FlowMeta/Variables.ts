import {
  define,
  observable,
} from '@formily/reactive'
import { IFieldMeta, MetaValueType } from '@toy-box/meta-schema';
import { IFlowResourceType } from '../../types'

export class Variables {
  variables: IFieldMeta[] = []
  variableArray: IFieldMeta[] = []
  variableArrayRecord: IFieldMeta[] = []
  variableNotArray: IFieldMeta[] = []

  constructor(variables?: IFieldMeta[]) {
    this.variables = variables || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      variables: observable.deep,
      variableArray: observable.deep,
      variableArrayRecord: observable.deep,
      variableNotArray: observable.deep,
    })
  }

  initDatas = (templates: IFieldMeta[]) => {
    this.variables = templates
    this.initVariableOfDatas()
  }

  initVariableOfDatas = () => {
    this.variables.forEach((v) => {
      if (v?.type === MetaValueType.ARRAY) {
        if (v?.items?.type === MetaValueType.OBJECT || v?.items?.type  === MetaValueType.OBJECT_ID) {
          const obj = { ...v }
          obj.type = IFlowResourceType.VARIABLE_ARRAY_RECORD
          this.variableArrayRecord.push(obj)
        } else {
          const obj = { ...v }
          obj.type = IFlowResourceType.VARIABLE_ARRAY
          this.variableArray.push(obj)
        }
      } else {
        this.variableNotArray.push(v)
      }
    })
  }

  updataVariableOfData = (variable: IFieldMeta, isEdit?: boolean) => {
    if (!isEdit) {
      if (variable?.type === MetaValueType.ARRAY) {
        if (variable?.items?.type === MetaValueType.OBJECT || variable?.items?.type  === MetaValueType.OBJECT_ID) {
          variable.type = IFlowResourceType.VARIABLE_ARRAY_RECORD
          this.variableArrayRecord.push(variable)
        } else {
          variable.type = IFlowResourceType.VARIABLE_ARRAY
          this.variableArray.push(variable)
        }
      } else {
        this.variableNotArray.push(variable)
      }
    } else {
      if (variable?.type === MetaValueType.ARRAY) {
        if (variable?.items?.type === MetaValueType.OBJECT || variable?.items?.type  === MetaValueType.OBJECT_ID) {
          const idx = this.variableArrayRecord.findIndex((de) => de.key === variable.key)
          variable.type = IFlowResourceType.VARIABLE_ARRAY_RECORD
          if (idx > -1) this.variableArrayRecord.splice(idx, 1, variable)
        } else {
          const idx = this.variableArray.findIndex((de) => de.key === variable.key)
          variable.type = IFlowResourceType.VARIABLE_ARRAY
          if (idx > -1) this.variableArray.splice(idx, 1, variable)
        }
      } else {
        const idx = this.variableNotArray.findIndex((de) => de.key === variable.key)
        if (idx > -1) this.variableNotArray.splice(idx, 1, variable)
      }
    }
  }

  onAdd = (variable: IFieldMeta) => {
    this.variables.push(variable)
    this.updataVariableOfData(variable)
  }

  onEdit = (variable: IFieldMeta) => {
    const idx = this.variables.findIndex((de) => de.key === variable.key)
    if (idx > -1) this.variables.splice(idx, 1, variable)
    this.updataVariableOfData(variable, true)
  }
}