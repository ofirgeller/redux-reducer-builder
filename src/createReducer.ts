import { flatten } from './flatten';

export function createReducer<T>(initState: T, ...actions: any[])
    : (state: T, action: any) => T {

    const _actions = {};
    flatten(actions).forEach(a => _actions[a.type] = a);
    return (state: T, action): T => (
        _actions[action.type]
            ? _actions[action.type](state || initState, action)
            : state || initState
    );
};
