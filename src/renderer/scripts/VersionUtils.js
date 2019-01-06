function toNumber(version) {
    return Number(version.substr(1, version.length).split(".").join(""));
}

export function greaterThan(v1, v2) {
    return toNumber(v1) > toNumber(v2);
}
export function lessThan(v1, v2) {
    return toNumber(v1) < toNumber(v2);
}