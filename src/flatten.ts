
//** Replace with Object.values when we do not need to support IE */
const objectToArray = (obj) => Object.keys(obj).map(k => obj[k]);

/**Where the input is T | T[] | {[key:string]: T} returns T[]
 * T must be a function or a primitive (not an array or a non-function object) or it too will
 * be flattened
*/
export function flatten<T>(arr: T | T[] | { [key: string]: T }, initial: T[] = []): T[] {

    if (Array.isArray(arr)) {
        return arr.reduce((init, item) => flatten(item, init), initial);
    }
    if (typeof arr === 'object') {
        return flatten(objectToArray(arr), initial);
    }
    initial.push(arr);
    return initial;
}