import { observable } from '@formily/reactive'
import { IFieldMeta, IFieldGroupMeta } from '@toy-box/meta-schema';

export const fieldMetaStore = observable.deep({
  fieldMetas: [] as IFieldMeta[] | IFieldGroupMeta[],
  initFieldMetas(data: IFieldMeta[] | IFieldGroupMeta[]) {
    fieldMetaStore.fieldMetas = data
  },
  updateFieldMetas(data: IFieldMeta[] | IFieldGroupMeta[]) {
    fieldMetaStore.fieldMetas = data
  },
  fieldServices: null as any,
  initFieldServices(data: any) {
    fieldMetaStore.fieldServices = data
  },
  registers: [] as any[],
  initRegisters(data: any[]) {
    fieldMetaStore.registers = data
  }
})
