import { AnyAction, Action } from 'redux';
import {createAction} from './createAction'
import { IAction } from './IAction';

/** This is how the collection of actions in the reducer builder can look like */
type ActionCollection = (Record<string, Action> | Action)[];

const anAction:Action = null!
const anActionMap:Record<string, Action> = null!

const actionCollection : ActionCollection = []

const createdAction = createAction((s,a:IAction<string>)=> s,'dasd');

const action = createdAction('');

actionCollection.push(createdAction);

actionCollection.push(anAction);
actionCollection.push(anActionMap);