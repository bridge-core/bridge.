import uuidv4 from "uuid/v4";

export default class Manifest {
    constructor(type, name, description, client_data, dependency) {
        this.format_version = 1;
        this.header = {
            description,
            name,
            uuid: uuidv4(),
            version: [ 1, 0, 0 ],
            min_engine_version: [ 1, 0, 0 ]
        };
        this.modules = [
            {
                type,
                uuid: uuidv4(),
                version: [ 1, 0, 0 ]
            }
        ];

        if(client_data) {
            this.modules.push({
                type: "client_data",
                uuid: uuidv4(),
                version: [ 1, 0, 0 ]
            });
        }
        if(dependency !== undefined) {
            this.dependencies = [ dependency ];
        }
    }

    get uuid() {
        return this.header.uuid;
    }

    get() {
        return JSON.stringify(this, null, "\t");
    }
}