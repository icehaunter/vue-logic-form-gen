export function getByPath<T> (obj: any, path: string | string[]): T {
  const splitPath = typeof path === 'string' ? path.split('.') : [...path]

  return splitPath.reduce((agg, pathPart) => agg && agg[pathPart], obj)
}
