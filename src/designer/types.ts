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
}