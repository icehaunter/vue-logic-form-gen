export type BasicType = 'boolean' | 'number' | 'string' | 'array' | 'date' | 'object'

export type ConvertAnyToBasic<T> =
  T extends boolean ? 'boolean' :
  T extends number ? 'number' :
  T extends string ? 'string' :
  T extends Array<any> ? 'array' :
  T extends Date ? 'date' :
  T extends object ? 'object' :
  BasicType

export type ConvertBasicToAny<T extends BasicType> =
  T extends 'boolean' ? boolean :
  T extends 'number' ? number :
  T extends 'string' ? string :
  T extends 'array' ? Array<any> :
  T extends 'date' ? Date :
  T extends 'object' ? object :
  never
