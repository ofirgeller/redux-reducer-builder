import { AnyAction, Reducer } from 'redux';
import { IActionNoPayload, IAction, ActionCreator, ActionCreatorNoPayload } from './IAction';

export const isAReduxAction = (action): action is IAction<any> => (typeof action === 'object' && typeof action.type === 'string');

export function createActionWithNoPayload<TState>(work: (state: TState, action: IActionNoPayload) => TState, type: string) 
: ActionCreatorNoPayload
& Reducer<TState,IActionNoPayload>
& { type: string } {
    return createAction(work, type) as any;
}

/** returns a function that is both an action creator and an action handler */
export function createAction<TState, TPayload>(work: (state: TState, action: IAction<TPayload>) => TState, type: string)
    : ActionCreator<TPayload>
    & Reducer<TState,AnyAction>
    & { type: string } {

    const action = (stateOrPayload, action?) => {

        /// If the arg has no type it's not an action. it's the payload coming from a caller that is triggering the op
        /// so we return an action that includes the payload
        if (!isAReduxAction(action)) {
            return { type: type, payload: stateOrPayload };
        }

        return work(stateOrPayload, action);
    };

    action['type'] = type;

    return action as any;
}
