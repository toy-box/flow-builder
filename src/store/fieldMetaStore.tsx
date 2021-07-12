import { makeAutoObservable } from 'mobx'
import { IFieldMeta } from '@toy-box/meta-schema';

export const fieldMetaStore = makeAutoObservable({
  fieldMetas: [] as IFieldMeta[],
  initFieldMetas(data: IFieldMeta[]) {
    fieldMetaStore.fieldMetas = data
  },
  updateFieldMetas(data: IFieldMeta[]) {
    fieldMetaStore.fieldMetas = data
  },
  fieldServices: null as any,
  initFieldServices(data: any) {
    fieldMetaStore.fieldServices = data
  }
})
