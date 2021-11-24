import { IDesignerRegistry } from "./registry";

export interface IDesignerLocales {
  messages: {
    [ISOCode: string]: {
      [key: string]: any
    }
  }
  language: string
}

export interface IDesignerContext {
  prefix: string
  GlobalRegistry: IDesignerRegistry
  serviceObj: IFieldService
}

export interface IFieldService {
  getMetaObjectData: (
    value?: string
  ) => Promise<any>
}