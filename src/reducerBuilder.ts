import { IAction, IActionNoPayload } from './IAction';
import { createAction, createActionWithNoPayload } from './createAction';
import { createReducer } from './createReducer';


export const splitOnWords = (text: string) => text.match(/([A-Za-z][a-z]*)|([0-9]+)/g) || [];

export const camelToUnderscore = (text: string) => {
    return splitOnWords(text).join('_').toUpperCase();
};

export interface OpState<TParams = undefined> {
    ongoing?: boolean;
    error?: string;
    params?: TParams;
}

export interface FetchState<TResult, TParams = undefined> extends OpState<TParams> {
    result?: TResult;
}

let _opState = { ongoing: false, error: undefined, params: undefined };
let _fetchState = { ..._opState, result: undefined, params: undefined };

export const opState = Object.freeze ? Object.freeze(_opState) : _opState;
export const fetchState = Object.freeze ? Object.freeze(_fetchState) : _fetchState;

export type OnResult<TReducerState, TResource> = (s: TReducerState, action: IAction<TResource>) => TReducerState;

export type OnDone<TReducerState> = (s: TReducerState, action: IActionNoPayload) => TReducerState;

type OpAndFetchActions<TParams, TError> = {
    /**Signal that an op has started, sets 'ongoing' to true */
    start: () => IActionNoPayload;
    /**Signal that an op with params has started, sets 'ongoing' to true and 'params' to the given params */
    startWithParams: (params: TParams) => IActionNoPayload;
    /**Signal that the op failed and produced an error, sets 'error' to the given error */
    error: (error: TError) => IAction<TError>;
}

export type OpActions<TParams, TError> = OpAndFetchActions<TParams, TError> & {
    /**Signal that the op has completed (formerly named 'success'), resets the op state to the init op state */
    done: () => IActionNoPayload;
}

export type FetchActions<TResource, TParams, TError> = OpAndFetchActions<TParams, TError> & {
    /**Signals that a fetch has completed, sets the result prop to the given result */
    result: (result: TResource) => IAction<TResource>;
}

/** Prevents boilerplate code and common bugs when defining a reducer.
 * Has methods that will with a single call: define an action in the reducer, init the resource state and return the action so it can be exported
 * to the callers. 
 * TODO: Improvements:
 * We need to type each property of the reducer state two times, ones when defining the ReducerState and then again when calling "withFetch" 
 * and these two decelerations can be different and no error will be rised. (high value but high cost to fix).
 * Wait and see: Some of the private methods might be useful when the caller needs to create an irregular action. but for now they are just noise.
 * Also we might add some extra public methods for other common action types. and the current methods might allow passing init state for the specific resource
 * that will be merged on top of the standard op/fetch state. 
  */
export class ReducerBuilder<TReducerState extends {} = never> {

    _initState: any;
    _reducerName: string;
    
    /** typing weak point, typed as any since the real type is: action creator, reducer, object with a type property or a collection of 
     * such objects which is very hard to type */
    _reducerActions: any = [];

    constructor(reducerName: string, initState: Partial<TReducerState> = {}) {
        this._reducerName = camelToUnderscore(reducerName);
        this._initState = initState;
    }

    private createStartAndErrorActionsFor = <TParam, TError>(actionType: string, resourceName: string) => {

        const start = createActionWithNoPayload(_fetchStart, actionType + '_START');
        function _fetchStart(state, action: IActionNoPayload) {
            return { ...state, [resourceName]: { ongoing: true, error: undefined, result: undefined, params: undefined } };
        }

        const startWithParams = createAction(_fetchStartWithParams, actionType + '_START');
        function _fetchStartWithParams(state, action: IAction<TParam>) {
            return { ...state, [resourceName]: { ongoing: true, error: undefined, result: undefined, params: action.payload } };
        }

        const error = createAction(_error, actionType + '_ERROR');
        function _error(state, action: IAction<TError>) {
            return { ...state, [resourceName]: { error: action.payload, ongoing: false, result: undefined } };
        }

        return {
            start,
            startWithParams,
            error
        };
    }

    private createActionsWithNoPayloadFor = <TParam, TError>(actionType: string, resourceName: string) => {

        const done = createActionWithNoPayload(_done, actionType + '_DONE');
        function _done(state, _action: IActionNoPayload) {
            return { ...state, [resourceName]: opState };
        }

        const startAndErrorActions = this.createStartAndErrorActionsFor<TParam, TError>(actionType, resourceName);

        return { ...startAndErrorActions, done };
    }

    private createActionsWithPayloadFor = <TResource, TParam, TError>(actionType: string, resourceName: string) => {

        const result = createAction(_fetchResult, actionType + '_RESULT');
        function _fetchResult(state, action: IAction<TResource>) {
            return { ...state, [resourceName]: { result: action.payload, ongoing: false, error: false } };
        }

        const startAndErrorActions = this.createStartAndErrorActionsFor<TParam, TError>(actionType, resourceName);

        return { ...startAndErrorActions, result };
    }

    private createFetchActionsFor = <TResource, TParam, TError>(resourceName: string) => {
        const fetchActions = this.createActionsWithPayloadFor<TResource, TParam, TError>(this._reducerName + '__' + camelToUnderscore(resourceName) + '_FETCH', resourceName);

        return fetchActions;
    }

    private createOpStateActionsFor = <TParam, TError>(resourceName: string) => {
        return this.createActionsWithNoPayloadFor<TParam, TError>(this._reducerName + '__' + camelToUnderscore(resourceName) + '_OP_STATE', resourceName);
    }

    /**Creates a set of actions for updating the fetch state for the resource: start,result,error 
     * @param onResult: optional, replaces the default handler for the result action, takes the state and the action
     * and must return the new state
    */
    withFetch<TResource, TParam = never, TError = string>(resourceName: keyof TReducerState & string, onResult?: OnResult<TReducerState, TResource>) {
        const fetchActions = this.createFetchActionsFor<TResource, TParam, TError>(resourceName);

        if (typeof onResult === 'function') {
            const { result, ...fetchActionsMinusOnResult } = fetchActions;
            onResult['type'] = result['type'];
            this._reducerActions.push(fetchActionsMinusOnResult);
            this._reducerActions.push(onResult);
        } else {
            this._reducerActions.push(fetchActions);
        }

        this._initState[resourceName] = fetchState;
        return fetchActions as FetchActions<TResource, TParam, TError>;
    }

    /**Creates a set of actions for updating the op state for the resource: start,success,error */
    withOp<TParam = never, TError = string>(resourceName: keyof TReducerState & string, onDone?: OnDone<TReducerState>) {
        const opAction = this.createOpStateActionsFor<TParam, TError>(resourceName);
        if (onDone) {
            const { done, ...actionsMinusOnDone } = opAction;
            onDone['type'] = done['type'];
            this._reducerActions.push(actionsMinusOnDone);
            this._reducerActions.push(onDone);
        } else {
            this._reducerActions.push(opAction);
        }

        this._initState[resourceName] = opState;
        return opAction as OpActions<TParam, TError>;
    }

    withActionOfT<T>(actionName: string, action: (s: TReducerState, a: IAction<T>) => TReducerState, sharedActionType = false) {
        if (!actionName.startsWith(this._reducerName) && !sharedActionType) {
            actionName = this._reducerName + '__' + actionName;
        }

        const actionHandlerAndCreator = createAction(action, actionName);
        this._reducerActions.push(actionHandlerAndCreator);
        return actionHandlerAndCreator;
    }

    withAction(actionName: string, action: (s: TReducerState, a: IActionNoPayload) => TReducerState, sharedActionType = false) {
        if (!actionName.startsWith(this._reducerName) && !sharedActionType) {
            actionName = this._reducerName + '__' + actionName;
        }

        const actionHandlerAndCreator = createActionWithNoPayload(action, actionName);
        this._reducerActions.push(actionHandlerAndCreator);
        return actionHandlerAndCreator;
    }


    /**Marges the passed object into the current init state, last value wins */
    withInitState(initState: Partial<TReducerState>) {
        Object.keys(initState).forEach(k => { this._initState[k] = initState[k]; });
        return this._initState as TReducerState;
    }

    build() {
        return createReducer<TReducerState>(this._initState, this._reducerActions)
    }

}
