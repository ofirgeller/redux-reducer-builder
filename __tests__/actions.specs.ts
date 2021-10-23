// this import is needed since visual studio code does not check sub folders properly for type so if 
// the parent folder is the root folder in vsc then all the jest functions are undefined as far as the typescript
// compiler vsc is running is concerned  
import 'jest';
import { Store } from 'redux';
import {
    IAction, IActionNoPayload, createAction, createActionWithNoPayload, createReducer
} from '../src/index';


type Person = {
    name: string;
    age: number;
}

type ClubState = {
    people: Person[]
}

const initState: ClubState = { people: [] };

const payload = { name: 'bill', age: 20 };

/** @CompilerTest: IAction and IActionNoPayload are staticly typed redux actions */
let action: IAction<Person> = {
    error: 'This would be a real error if the action has one',
    type: 'CLUB_VISITED',
    payload: {
        name: 'nameson',
        age: 22
    }
};

let noPayloadAction: IActionNoPayload = {
    error: 'This would be a real error if the action has one',
    type: 'CLUB_CLOSING',
};

const _clubVisitHandler = (state: ClubState, action: IAction<Person>) => {

    if (action.payload.age < 18) {
        throw new Error('a person must be over 18 years old to visit the club');
    }

    return {
        ...state, people: [...state.people, action.payload]
    }

}

const _emptyClubActionHandler = (state: ClubState, action: IActionNoPayload) => {
    return { ...state, people: [] };
}

enum ActionType {
    ClubOpened = 'CLUB_OPENED',
    ClubClosed = 'CLUB_CLOSED',
    OpenClubOp = 'OP_CLUB_OPEN',
    CloseClubOp = 'OP_CLUB_CLOSE'
}

/** This function creates the action or handles the action */
const clubVisitHandlerAndActionCreator = createAction(_clubVisitHandler, ActionType.ClubOpened);
const emptyClubActionHandler = createActionWithNoPayload(_emptyClubActionHandler, ActionType.ClubClosed);

describe('createAction', () => {

    it('createAction returns a function that creates the action if it is called with the payload', () => {
        const action = clubVisitHandlerAndActionCreator(payload);
        expect(action.payload).toEqual(payload);
    });

    it('createAction returns a function that calls the handler if it is called with a redux action', () => {

        const action = clubVisitHandlerAndActionCreator(payload);

        /** We type the handler/actionCreator as an action creator so that it can be called from components
         * when it is used as a handler we have to forgo static typing */
        const actionHandler = clubVisitHandlerAndActionCreator as any;

        const nState = actionHandler(initState, action);
        expect(nState.people[0]).toEqual(payload);

    });

})

describe('createReducer', () => {

    it('createReducer takes action handlers and returns a reducer routing actions based on the action name', () => {

        let reducer = createReducer(
            initState,
            clubVisitHandlerAndActionCreator,
            emptyClubActionHandler);

        //** specifying the state type is not required but does produce a matching type to the one TS infers */
        reducer = createReducer<ClubState>(
            initState,
            clubVisitHandlerAndActionCreator,
            emptyClubActionHandler);


        const action = clubVisitHandlerAndActionCreator(payload);

        const state1 = reducer(initState, action);

        expect(state1.people.length).toBe(1);
        expect(state1.people[0]).toEqual(payload);

        const emptyClub = emptyClubActionHandler();
        const state2 = reducer(initState, emptyClub);
        expect(state2.people.length).toBe(0);

    });

});

const _openClubOp = async (a: IAction<Person>, store: Store) => {
    return { allGood: 'asd' };
    /**Call the club async ask if the person is there */
}

/** Used to verify that different Op handlers with the same name causes an error  */
const _callClubOp2 = () => {
}

const _closeClubOp = async (a: IActionNoPayload, store: Store) => {
    /**Call the club async tell them to close the club, after that dispath an update */
    const emptyClub = emptyClubActionHandler();
    store.dispatch(emptyClub);
    return true;
}
