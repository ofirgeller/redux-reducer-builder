# Redux-Reducer-Builder 
Util class to make creating reducers less verbose and error prone, with typescript support. 

## Install
yarn add @ofirgller/redux-reducer-builder

## Usage

This library support typescript but can also be used by Javascript project, simply avoid adding the type annotations.

``` typescript
import { ReducerBuilder, opState, OpState } from '@ofirgeller/redux-reducer-builder';

type Todo = {
    id: number;
    descriptions: string;
    done: boolean;
}

type TodoReducerState = {
    items: Todo[];
    saveOp: OpState
}

const initState: TodoReducerState = {
    items: [],
    saveOp: opState
}

/**Create a reducer with the name "todo", the state it controls is of type TodoReducerState and the initial state is passed as the second parameter */
const builder = new ReducerBuilder<TodoReducerState>('todo', initState);

/** You can set the initial state separately or in addition, the state is shallow merged with later calls overriding previous ones  */
builder.withInitState({ items: [{ descriptions: 'initial todo', done: false, id: 0 }] });
/** Type checking will prevent you from passing in the wrong type*/
/// Will not compile: builder.withInitState({ name: 'hello' });

/**Add a simple action, the first parameter is the name, it will get prefixed with the name of the reducer, in this case becoming:
 * "TODO__MARK_ALL_DONE". */
export const markAllDone = builder.withAction('MARK_ALL_DONE', (state, action) => {
    return state;
});

/// Later you can import 'markAllDone' and dispatch the action like so: dispatch(markAllDone()); 
/// what we are doing is creating the action handler and the action creator at the same time.

/**If the action has a payload use this method */
export const removeTodo = builder.withActionOfT<Todo>('REMOVE', (state, action) => {
    return { ...state, items: state.items.filter(i => i.id !== action.payload.id) };
});

/// removeTodo will be dispatched like so: dispatch(removeTodo(todoThatShouldBeRemoved)); 

/**If the action name is used by another reducer or is dispatched by a library, you can control the action name by passing in the 3rd parameter.
 * so assuming you want to handle an action with the type "AFTER_NAVIGATION_ACTION" you can do this:
*/

/// In your code you will import the action name from a shared file, here we pretend it is available in the current scope.
declare const AFTER_NAVIGATION_ACTION = "@ROUTER_LIBRARY/AFTER_NAVIGATION";

/**This time we don't export the action creator, since we do not intend on dispatching ourselves */
builder.withAction(AFTER_NAVIGATION_ACTION, (state, _action) => {
    return state;
}, true);

/**op is short for operation, often we want to perform some async operation and keep the state of the operation in redux, for example so we can show
 * a progress indicator, disable the button until the operation is complete etc.  
   */
export const saveTodosOp = builder.withOp('saveOp')

/// saveTodosOp contains 4 action creators, so later we can call saveTodosOp.start, saveTodosOp.done and saveTodosOp.error from
/// our async operation, you can also call startWithParams and pass the params in which is useful in case you would like to retry the op later
/// or include the params when logging.


/**Fetch is an op that is also expected to set some resource into the state, in this case we will be fetching the todos from the server */
export const fetchTodos = builder.withFetch<Todo[]>('items');

/// instead of having a 'done' action we have a 'result' action which expects the payload to be of the type specified, in this case an 
/// array of todos. so after the request is done and we have the todos we will call dispatch(fetchTodos.result(data)) and the action handler will set the state

/**If we need special logic to run on done or result we can pass a handler as a parameter to the 'withOp'/'withFetch' methods */
export const altFetchTodos = builder.withFetch<Todo[]>('items', (state, action) => {
    const mappedTodos = action.payload.map(todo => ({ ...todo, done: false }));
    return { ...state, items: mappedTodos };
});

/// you can use lower level functions that the reducer builder uses like "createAction" and "createActionWithNoPayload" if you need to. 

```

## Contributing
PRs accepted, could probably improve type inference if anyone wants to have a go at it. 


### Publishing

1. Make sure that all the changes relevant to this release are committed.
2. Run `yarn test` to confirm that the code doesn't break any tests.
3. make sure you are logged in to npm by running 'npm login'
4. run 'yarn publish'. you will be asked to enter a version number (even if the current commit is a version bump).
5. If you want to publish a pre-release version pass '--canary' 
6. if you get an error about the package not being found and it looks like the publish command failed, check npm (the site or registry), it probably did publish.



License
MIT © Ofir Geller