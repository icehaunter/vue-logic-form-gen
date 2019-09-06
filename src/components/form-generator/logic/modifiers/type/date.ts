import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  parseISO,
  isBefore,
  isAfter
} from 'date-fns'

export type DateStep = 'day' | 'week' | 'month' | 'year'
export type DateLike = Date | 'now' | string

export type DateModifierTypes = {
  add: (source: Date, amount: number, step: DateStep) => Date
  subtract: (source: Date, amount: number, step: DateStep) => Date
  difference: (source: Date, target: DateLike, step: DateStep) => number
  isBefore: (source: Date, target: DateLike) => boolean
  isAfter: (source: Date, target: DateLike) => boolean
}

function getDate (datelike: DateLike): Date {
  if (datelike === 'now') {
    return new Date()
  } else if (typeof datelike !== 'string') {
    return datelike
  } else {
    return parseISO(datelike)
  }
}

export const modifiers: DateModifierTypes = {
  add: (source, amount, step): Date => {
    switch (step) {
      case 'day':
        return addDays(source, amount)
      case 'week':
        return addWeeks(source, amount)
      case 'month':
        return addMonths(source, amount)
      case 'year':
        return addYears(source, amount)
    }
  },
  subtract: (source, amount, step): Date => {
    switch (step) {
      case 'day':
        return subDays(source, amount)
      case 'week':
        return subWeeks(source, amount)
      case 'month':
        return subMonths(source, amount)
      case 'year':
        return subYears(source, amount)
    }
  },
  difference: (source, target, step): number => {
    switch (step) {
      case 'day':
        return differenceInDays(source, getDate(target))
      case 'week':
        return differenceInWeeks(source, getDate(target))
      case 'month':
        return differenceInMonths(source, getDate(target))
      case 'year':
        return differenceInYears(source, getDate(target))
    }
  },
  isBefore: (source, target) => isBefore(source, getDate(target)),
  isAfter: (source, target) => isAfter(source, getDate(target))
}
