export default function escapeRegExp(str) {
    if(typeof str === "string")
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    else
        return str.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}