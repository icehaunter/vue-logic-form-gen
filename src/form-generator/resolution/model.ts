import { Context } from './types'
import { getByPath } from '../utils/objectTraversal'

/**
 * Get a path within the model with all the `$each` parts resolved based on the context
 *
 * This is not a very obvious piece of code.
 * It is here to achieve one thing: replace parts of the path based on the context
 * even if parts of the actual path contain indexes instead of `$each` blocks.
 *
 * This is achieved by taking each split point from the end, and converting it
 * to a regexp, where each `$each` part is replaced by a (\d+|\$each) regex block
 * to account for the possible index in place of the `$each`. Moreover, this split point
 * has to be followed by an `$each` block, which will be replaced by the index - so
 * this part is appended to the regex as well
 *
 * @param modelPath dot-separated path within the model with `$each` blocks
 * @param context context for `$each` block resolution
 */
export function resolveContextPath (
  modelPath: string | string[],
  context: Context
) {
  const unpreparedPath = Array.isArray(modelPath)
    ? modelPath.join('.')
    : modelPath

  return context
    .reduceRight((agg, { index, splitPoint }) => {
      const replaceable =
        '(' +
        splitPoint.replace(/(\$each)/g, '(\\d+|\\$each)').replace('.', '\\.') +
        '\\.)\\$each'
      const replacer = RegExp(replaceable)
      return agg.replace(replacer, '$1' + String(index))
    }, unpreparedPath)
    .split('.')
}

/**
 * Return a value from the model based on the given dot-separated path.
 *
 * `$each` parts are replaced with the appropriate index based on the context.
 *
 * @param modelPath Dot-separated path within the model.
 * Array indexing is also dot-based, so `array.3` means `array[3]`.
 * Also, if an `$each` part is encountered instead of the array index, it
 * is replaced (if possible) based on the context
 *
 * @param model Model, within which the path should be resolved
 *
 * @param context Context for `$each` parts resolution
 */
export function resolveModelPath<T = any> (
  modelPath: string | string[],
  model: any,
  context: Context
): T | undefined {
  return getByPath<T>(model, resolveContextPath(modelPath, context))
}
