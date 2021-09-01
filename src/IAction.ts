import { Action, ActionCreator as ReduxActionCreator } from 'redux';

/** recommended "flux-standard-action" */
export interface IActionNoPayload extends Action<string> {
    error?: any,
    meta?: any
}

export interface IAction<U> extends IActionNoPayload {
    payload: U
}

export interface ActionCreatorNoPayload {
    (): IActionNoPayload
}

export interface ActionCreator<TArg> {
    (args: TArg): IAction<TArg>
}
