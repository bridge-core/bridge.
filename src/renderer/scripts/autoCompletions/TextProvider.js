import Provider from "./Provider";
import EventBus from "../EventBus";
const DEF_PROVIDER = new Provider();

export default class TextProvider {
    static compile(event, file_path, doc=event.doc) {
        DEF_PROVIDER.validator(file_path);

        let line_number = doc.getCursor().line;
        let char = doc.getCursor().ch;
        let path = doc.getLine(line_number).trim().substr(0, char).split(/\s+/).join("/");
        
        EventBus.trigger("bridge:textProviderUpdate", event, DEF_PROVIDER.get(path !== "" ? "global/" + path : "global"))
    }

    static get() {
        return this.current;
    }
}