import { parseISO } from 'date-fns'

export type DateStep = 'day' | 'week' | 'month' | 'year'
export type DateLike = Date | 'now' | string

export function getDate (datelike: DateLike): Date {
  if (datelike === 'now') {
    return new Date()
  } else if (typeof datelike !== 'string') {
    return datelike
  } else {
    return parseISO(datelike)
  }
}
