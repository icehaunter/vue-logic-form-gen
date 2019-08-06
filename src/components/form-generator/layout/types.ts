export interface Level {
    type: 'level'
    level: string
    context: object
    children: Level[]
}

export interface Field {
    type: 'field'
    model: any
    widget?: any
    validation?: any
    transform?: any
    logic?: any
}
