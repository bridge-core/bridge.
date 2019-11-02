/**
 * Utilities for comparing versions
 * e.g. v0.1.0 <-> v2.1.20
 */

interface compareResult {
    result: boolean;
    break: boolean;
}

function asArr(version: string) {
    if(version[0] !== "v") version = "v" + version;
    return version.substr(1, version.length).split(".").map(e => Number(e));
}

function longerArr(a1: any[], a2: any[]) {
    if(a1.length > a2.length) return a1.length;
    return a2.length;
}

function compare(v1: string, v2: string, cb: (a: number, b: number) => compareResult) {
    let a1 = asArr(v1);
    let a2 = asArr(v2);
    let rep = longerArr(a1, a2);
    let status = { result: false, break: false };

    for(let i = 0; i < rep && !status.break; i++) {
        status = Object.assign(status, cb(a1[i], a2[i]));
    }
    return status.result;
}

export function greaterThan(v1: string, v2: string) {
    return compare(v1, v2, (a, b) => {
        if(a > b) return {
            result: true,
            break: true
        };
        if(a === b) return {
            result: false,
            break: false
        };
        return {
            result: false,
            break: true
        };
    });
}
export function lessThan(v1: string, v2: string) {
    return compare(v1, v2, (a, b) => {
        if(a > b) return {
            result: false,
            break: true
        };
        if(a === b) return {
            result: false,
            break: false
        };
        return {
            result: true,
            break: true
        };
    });
}