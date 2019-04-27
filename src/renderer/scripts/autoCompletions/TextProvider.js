import Provider from "./Provider";
import EventBus from "../EventBus";
const DEF_PROVIDER = new Provider();

export default class TextProvider {
    static compile(doc, file_path) {
        DEF_PROVIDER.validator(file_path);

        let line_number = doc.getCursor().line;
        let char = doc.getCursor().ch;

        let path = doc.getLine(line_number).split(/\s+/);
        let current = path.pop();
        path = path.join("/");

        let { object, value } = DEF_PROVIDER.get(path !== "" ? "global/" + path : "global");
        let propose = object.concat(value).filter(e => e !== current && e.includes(current));
        EventBus.trigger("bridge:textProviderUpdate", propose, [{ line: line_number, ch: char }, { line: line_number, ch: char - current.length }])
    }

    static get() {
        return this.current;
    }
}