import {
  define,
  observable,
} from '@formily/reactive'
import { IFieldMeta } from '@toy-box/meta-schema';

export class Constants {
  constants: IFieldMeta[] = []

  constructor(constants?: IFieldMeta[]) {
    this.constants = constants || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      constants: observable.deep,
    })
  }

  initDatas = (constants: IFieldMeta[]) => {
    this.constants = constants
  }

  onAdd = (constant: IFieldMeta) => {
    this.constants.push(constant)
  }

  onEdit = (constant: IFieldMeta) => {
    const idx = this.constants.findIndex((de) => de.key === constant.key)
    if (idx > -1) this.constants.splice(idx, 1, constant)
  }
}