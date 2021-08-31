import {
  define,
  observable,
} from '@formily/reactive'
import { IFieldMeta } from '@toy-box/meta-schema';

export class Templates {
  templates: IFieldMeta[] = []

  constructor(templates?: IFieldMeta[]) {
    this.templates = templates || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      templates: observable.deep,
    })
  }

  initDatas = (templates: IFieldMeta[]) => {
    this.templates = templates
  }

  onAdd = (temp: IFieldMeta) => {
    this.templates.push(temp)
  }

  onEdit = (temp: IFieldMeta) => {
    const idx = this.templates.findIndex((de) => de.key === temp.key)
    if (idx > -1) this.templates.splice(idx, 1, temp)
  }
}