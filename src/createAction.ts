
import { IAction, IActionNoPayload } from './IAction';

export const isAReduxAction = (action) => (typeof action === 'object' && typeof action.type === 'string');

export function createActionWithNoPayload<TState>(work: (state: TState, action: IActionNoPayload) => TState, type: string) {
    return createAction(work, type) as any as () => IActionNoPayload;
}

export function createAction<TState, TPayload>(work: (state: TState, action: IAction<TPayload>) => TState, type: string)
    : ((payload: TPayload) => IAction<TPayload>) & { type: string } {

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
