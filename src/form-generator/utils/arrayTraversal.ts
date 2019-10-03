export function groupByKey<K> (array: Array<[string, K]>) {
  return array.reduce((agg, [k, v]) => {
    if (!(k in agg)) {
      agg[k] = [v]
    } else {
      agg[k].push(v)
    }

    return agg
  }, {} as {[k: string]: K[]})
}
