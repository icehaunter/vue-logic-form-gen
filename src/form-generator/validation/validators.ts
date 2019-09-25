import { BuildValidators, BuildValidatorSchema } from './types'
import { req, regex, len } from './helpers'
import { isAfter, isValid, isBefore } from 'date-fns'
import { DateLike, getDate } from '../utils/date'
import { getByPath } from '../utils/objectTraversal'

export type ValidatorParamTypes = {
  always: undefined
  required: undefined
  isTrue: undefined
  isTruthy: undefined
  isFalse: undefined
  isFalsy: undefined
  maxLength: { max: number }
  minLength: { min: number }
  lengthBetween: { min: number; max: number }
  minValue: { min: number }
  maxValue: { max: number }
  between: { min: number; max: number }
  alpha: undefined
  alphaNum: undefined
  numeric: undefined
  integer: undefined
  decimal: undefined
  email: undefined
  regex: { pattern: RegExp | string }
  minDate: { min: DateLike }
  maxDate: { max: DateLike },
  pathIsNotNull: { path: string },
  predicate: { test: boolean }
}

export type ValidatorsSchema = BuildValidatorSchema<ValidatorParamTypes>

export type Validators = BuildValidators<ValidatorParamTypes>

const emailRegex = /(^$|^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/

export const validators: Validators = {
  always: () => () => false,
  required: () => req,
  isTrue: () => val => val === true,
  isTruthy: () => val => Boolean(val),
  isFalse: () => val => val === false,
  isFalsy: () => val => !val,
  minLength: ({ min }) => value => !req(value) || len(value) >= min,
  maxLength: ({ max }) => value => !req(value) || len(value) <= max,
  lengthBetween: ({ min, max }) => value => !req(value) || (len(value) >= min && len(value) <= max),
  minValue: ({ min }) => value => !req(value) || value >= min,
  maxValue: ({ max }) => value => !req(value) || value <= max,
  between: ({ min, max }) => value => !req(value) || (value >= min && value <= max),
  alpha: () => regex(/^[a-zA-Z]*$/),
  alphaNum: () => regex(/^[a-zA-Z0-9]*$/),
  numeric: () => regex(/^[0-9]*$/),
  integer: () => regex(/(^[0-9]*$)|(^-[0-9]+$)/),
  decimal: () => regex(/^[-]?\d*(\.\d+)?$/),
  email: () => regex(emailRegex),
  regex: ({ pattern }) => regex(new RegExp(pattern)),
  minDate: ({ min }) => (value) => {
    if (!req(value)) {
      return true
    } else {
      const result = getDate(min)
      return isValid(result) && isValid(value) && isAfter(value, result)
    }
  },
  maxDate: ({ max }) => (value) => {
    if (!req(value)) {
      return true
    } else {
      const result = getDate(max)
      return isValid(result) && isValid(value) && isBefore(value, result)
    }
  },
  pathIsNotNull: ({ path }) => value => {
    if (!req(value)) {
      return true
    } else if (typeof value !== 'object') {
      return false
    } else {
      const resolved = getByPath(value, path)
      return resolved !== null && resolved !== undefined
    }
  },
  predicate: ({ test }) => () => Boolean(test)
}
