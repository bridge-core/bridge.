//@ts-check
import { WEB_APP_DATA, DOC_LIST } from "../constants";

class DocumentationLoader {
    constructor() {
        this.html_data = {};
        this.loading_status = 0;
        this.loadData();
    }

    get progress() {
        return (this.loading_status / DOC_LIST.length) * 100;
    }
    get finished_loading() {
        return this.loading_status === DOC_LIST.length;
    }

    /**
     * @param {String} type 
     */
    get(type) {
        return this.html_data[type];
    }

    loadData() {
        this.loading_status = 0;
        DOC_LIST.forEach(doc => {
            fetch(`${WEB_APP_DATA}documentation/${doc}.html`)
                .then(data => data.text())
                .then(str => {
                    //this.html_data[doc] = document.implementation.createHTMLDocument(doc);
                    //this.html_data[doc].body.innerHTML = str;
                    this.html_data[doc] = str;
                    window.setTimeout(() => this.loading_status++, this.loading_status*100 + 1000);
                });
        });
    }
}

export const DOC_WINDOW = new (class {
    constructor() {
        this.type = "";
        this.loaded_type = "not_equal";
        this.is_open = false;
        this.loading = false;
    }

    /**
     * @param {String} type 
     */
    set(type) {
        this.type = type;
    }
    get() {
        return this.type;
    }
    equals() {
        return this.loaded_type === this.type;
    }
    update() {
        this.loaded_type = this.type;
    }

    /**
     * @param {String} type 
     */
    open(type) {
        this.loading = true;
        window.setTimeout(() => {
            if(type !== undefined) this.type = type;
            this.is_open = true;
            

            //@ts-ignore
            if(typeof this.onOpen === "function") this.onOpen(this.type);

            this.loading = false;
        }, 150);
    }
    close() {
        this.is_open = false;
    }
})();


export const DOC_LOADER = new DocumentationLoader();