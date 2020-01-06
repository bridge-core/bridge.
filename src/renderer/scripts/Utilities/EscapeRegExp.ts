export default function escapeRegExp(str: string[]) {
    if(str === undefined) return [];
    return str.map(s => escapeRegExpStr(s));
}

export function escapeRegExpStr(str: string) {
    if(str === undefined) return "";
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}