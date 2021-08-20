

import { define, observable } from '@formily/reactive'
import { isPlainObj, each } from '@toy-box/toybox-shared'
import get from 'lodash.get'
import { IDesignerLocales } from './types'

const getBrowserlanguage = () => {
  /* istanbul ignore next */
  if (!window.navigator) {
    return 'zh-CN'
  }
  return (
    window.navigator?.language || 'zh-CN'
  )
}


const getISOCode = (language: string) => {
  let isoCode = DESIGNER_LOCALES.language
  let lang = cleanSpace(language)
  if (DESIGNER_LOCALES.messages[lang]) {
    return lang
  }
  return isoCode
}

const DESIGNER_ICONS_MAP: Record<string, any> = {}

const DESIGNER_LOCALES: IDesignerLocales = define(
  {
    messages: {},
    language: getBrowserlanguage(),
  },
  {
    language: observable.ref,
  }
)

const cleanSpace = (str: string) => {
  return String(str).replace(/\s+/g, '_').toLocaleLowerCase()
}


const mergeLocales = (target: any, source: any) => {
  if (isPlainObj(target) && isPlainObj(source)) {
    each(source, function (value, key) {
      const token = cleanSpace(key)
      const messages: any = mergeLocales((target as any)[key] || (target as any)[token], value);
      (target as Record<string, any>)[token] = messages
      (target as Record<string, any>)[key] = messages
    })
    return target
  } else if (isPlainObj(source)) {
    const result: any = Array.isArray(source) ? [] : {}
    each(source, function (value, key) {
      const messages = mergeLocales(undefined, value)
      result[cleanSpace(key)] = messages
      result[key] = messages
    })
    return result
  }
  return source
}

const DESIGNER_REGISTRY = {
  registerDesignerIcons: (map: Record<string, any>) => {
    Object.assign(DESIGNER_ICONS_MAP, map)
  },

  getDesignerIcon: (name: string) => {
    return DESIGNER_ICONS_MAP[name]
  },

  setDesignerLanguage(lang: string) {
    DESIGNER_LOCALES.language = lang
  },

  getDesignerLanguage() {
    return DESIGNER_LOCALES.language
  },

  getDesignerMessage(token: string) {
    const lang = getISOCode(DESIGNER_LOCALES.language)
    const locale = DESIGNER_LOCALES.messages[lang]
    if (!locale) {
      for (let key in DESIGNER_LOCALES.messages) {
        const message = get(
          DESIGNER_LOCALES.messages[key],
          cleanSpace(token)
        )
        if (message) return message
      }
      return
    }
    return get(locale, cleanSpace(token))
  },

  registerDesignerLocales(...packages: IDesignerLocales['messages'][]) {
    packages.forEach((locales) => {
      mergeLocales(DESIGNER_LOCALES.messages, locales)
    })
  },
}

export type IDesignerRegistry = typeof DESIGNER_REGISTRY

export const GlobalRegistry: IDesignerRegistry = DESIGNER_REGISTRY

