import { ReducerBuilder, OpState, opState, FetchState, fetchState } from '../src/index';

type ReducerState = { name?: string, age?: number, sendGreatingOp: OpState, fetchAge: FetchState<number, string> };
const initState: ReducerState = { name: undefined, age: undefined, sendGreatingOp: opState, fetchAge: fetchState };
let currState: ReducerState = null as any;
let builder: ReducerBuilder<ReducerState> = null as any;


describe('ReducerBuilder', () => {

    beforeEach(() => {
        currState = initState;
        builder = new ReducerBuilder<ReducerState>('helloSayer', initState);
        builder.withInitState({ name: 'hello' });
    });

    it('withInitState marges the given state into the current init state', () => {

        const newInitState = builder.withInitState({ age: 10 });

        expect(newInitState.age).toBe(10);
        expect(newInitState.name).toBe('hello');

    });

    it('withAction adds the given action to the reducer and returns the action creator', () => {

        const scream = builder.withAction((s, a) => { return { ...s, name: s.name + '!' }; }, 'scream');
        const reducer = builder.build();

        currState = reducer(currState, scream());

        expect(currState.name).toBe('hello!');

    });


    it('withActionOfT adds the given action to the reducer and returns the action creator', () => {

        const changeGreating = builder.withActionOfT<string>((s, a) => { return { ...s, name: a.payload }; }, 'changeGreating');
        const reducer = builder.build();

        currState = reducer(currState, changeGreating('howdy'));

        expect(currState.name).toBe('howdy');

    });

    it('withOp adds 3 op actions to the reducer and returns an object with these action creators', () => {

        const sendGreating = builder.withOp<string>('sendGreatingOp');

        const reducer = builder.build();

        currState = reducer(currState, sendGreating.start());

        expect(currState.sendGreatingOp.ongoing).toBe(true);

        currState = reducer(currState, sendGreating.error('something bad happened'));

        expect(currState.sendGreatingOp.error).toBeDefined();

        currState = reducer(currState, sendGreating.start());
        currState = reducer(currState, sendGreating.done());

        expect(currState.sendGreatingOp.ongoing).toBe(false);

    });

    it('withOp takes an optional override for the done action handler', () => {

        let sideEffect = false;

        const sendGreating = builder.withOp<string>('sendGreatingOp', (s) => {
            sideEffect = true;
            return s;
        });

        const reducer = builder.build();

        currState = reducer(currState, sendGreating.done());
        expect(sideEffect).toBe(true);
    });

    it('withFetch adds 3 fetch actions to the reducer and returns an object with these action creators', () => {

        const fetchAge = builder.withFetch<number, string>('fetchAge');

        const reducer = builder.build();

        currState = reducer(currState, fetchAge.start());

        expect(currState.fetchAge.ongoing).toBe(true);

        currState = reducer(currState, fetchAge.error('something bad happened'));

        expect(currState.fetchAge.error).toBeDefined();

        currState = reducer(currState, fetchAge.start());
        currState = reducer(currState, fetchAge.result(20));

        expect(currState.fetchAge.ongoing).toBe(false);
        expect(currState.fetchAge.result).toBe(20);

    });

    it('withFetch takes an optional override for the result action handler', () => {

        const fetchAge = builder.withFetch<any, number>('fetchAge', (s, a) => {
            /// !not setting the result property, instead setting a property on the root object state!
            return { ...s, age: a.payload + 1 };
        });

        const reducer = builder.build();

        currState = reducer(currState, fetchAge.result(10));
        expect(currState.fetchAge.result).toBeUndefined();
        expect(currState.age).toBe(11);
    });

    it('withFetch takes an optional params type that can be added to the startWithParams action', () => {

        const fetchAge = builder.withFetch<any, string>('fetchAge', (s, a) => {
            return { ...s, age: a.payload + 1 };
        });

        const reducer = builder.build();

        currState = reducer(currState, fetchAge.startWithParams('sad'));
        expect(currState.fetchAge.params).toBe('sad');
    });

});



