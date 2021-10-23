import { IAction, IActionNoPayload } from 'IAction';
import { Reducer, AnyAction } from 'redux';
import { flatten } from './flatten';


export function createReducer<TState, TAction extends IActionNoPayload = IAction<any>>(initState: TState, ...actions: AnyAction[]): Reducer<TState, AnyAction> {
    const _actions = {};
    flatten(actions).forEach(a => _actions[a.type] = a);
    return (state: TState, action): TState => (
        _actions[action.type]
            ? _actions[action.type](state || initState, action)
            : state || initState
    );
};
