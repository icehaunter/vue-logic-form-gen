interface ValueFromModel {
  modelPath: string
}

export type Value<T> = T | ValueFromModel
