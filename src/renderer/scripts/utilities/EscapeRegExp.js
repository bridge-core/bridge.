export default function escapeRegExp(str) {
    if(str === undefined) return [];

    if(typeof str === "string")
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    else
        return str.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}