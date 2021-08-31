import {
  define,
  observable,
} from '@formily/reactive'
import { IFieldMeta } from '@toy-box/meta-schema';

export class Formulas {
  formulas: IFieldMeta[] = []

  constructor(formulas?: IFieldMeta[]) {
    this.formulas = formulas || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      formulas: observable.deep,
    })
  }

  initDatas = (formulas: IFieldMeta[]) => {
    this.formulas = formulas
  }

  onAdd = (formula: IFieldMeta) => {
    this.formulas.push(formula)
  }

  onEdit = (formula: IFieldMeta) => {
    const idx = this.formulas.findIndex((de) => de.key === formula.key)
    if (idx > -1) this.formulas.splice(idx, 1, formula)
  }
}