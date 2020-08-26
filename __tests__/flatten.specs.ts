// this import is needed since visual studio code does not check sub folders properly for type so if 
// the parent folder is the root folder in vsc then all the jest functions are undefined as far as the typescript
// compiler vsc is running is concerned  
import 'jest';

import { flatten } from '../src/index';

describe('flatten', () => {

    const cases = [
        { input: 1, expected: [1] },
        { input: [1], expected: [1] },
        { input: [[1]], expected: [1] },
        { input: [1, 2], expected: [1, 2] },
        { input: [[1], [2]], expected: [1, 2] },

        { input: [[1], { k0: 2 }], expected: [1, 2] },
        { input: [[1], { k0: 2, k1: [3] }], expected: [1, 2, 3] },

        { input: [[1, {}], [], { k0: 2, k1: [3] }], expected: [1, 2, 3] },

        { input: { k0: 1, k1: 2, k2: 3 }, expected: [1, 2, 3] },
        { input: { k0: 1, k1: 2, k2: 3, k3: [4, 5] }, expected: [1, 2, 3, 4, 5] },

    ];

    cases.forEach(c => {
        it('case: ' + c.input + ' output: ' + c.expected, () => {
            expect(flatten(c.input as any)).toMatchObject(c.expected);
        });
    });

});