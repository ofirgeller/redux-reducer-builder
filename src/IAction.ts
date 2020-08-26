
export interface IActionNoPayload {
    type: string,
    error?: any,
    meta?: any
}

export interface IAction<U> extends IActionNoPayload {
    payload: U
}

