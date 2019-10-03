import { isValid } from 'date-fns'

export const req = (value: unknown) => {
  if (Array.isArray(value)) return !!value.length
  if (value === undefined || value === null) {
    return false
  }

  if (value === false) {
    return true
  }

  if (value instanceof Date) {
    return isValid(value)
  }

  if (typeof value === 'object') {
    for (const _ in value) return true
    return false
  }

  return !!String(value).length
}

export const len = (value: unknown) => {
  if (Array.isArray(value)) return value.length
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length
  }

  return String(value).length
}

export const regex = (expr: RegExp) => (value: unknown) => !req(value) || expr.test(String(value))
