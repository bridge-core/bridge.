import Provider from "./Provider";
import EventBus from "../EventBus";
import FileType from "../editor/FileType";
const DEF_PROVIDER = new Provider();

export default class TextProvider {
    static compile(doc, file_path, cursor_coords) {
        DEF_PROVIDER.validator(file_path);

        let line_number = doc.getCursor().line;
        let char = doc.getCursor().ch;
        let text = doc.getLine(line_number);
        
        if(char === text.length) {
            let path = FileType.transformTextSeparators(file_path, text).split(/\s+/);
            let current = path.pop();
            path = path.join("/");
            // console.log(DEF_PROVIDER.start_state, path);
            let { object, value } = DEF_PROVIDER.get(path !== "" ? "global/" + path : "global");
            let propose = object.concat(value).filter(e => e !== current && e.includes(current));
            
            EventBus.trigger("bridge:textProviderUpdate", propose, [
                { 
                    line: line_number,
                    ch: char
                },
                { 
                    line: line_number, 
                    ch: char - current.length 
                }
            ], cursor_coords);
        } else {
            EventBus.trigger("bridge:textProviderUpdate", []);
        }
    }
}