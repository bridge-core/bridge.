/**
 * Create manifest objects used for BPs & RPs
 */
import uuidv4 from "uuid/v4";

interface Module {
    type: string;
    uuid: string;
    version: [number, number, number];
}
interface Header {
    name: string;
    description: string;
    uuid: string;
    version: [number, number, number];
    min_engine_version: [number, number, number];
}
interface Dependency {
    version: [number, number, number];
    uuid: string;
}

export default class Manifest {
    format_version = 1;
    header: Header;
    modules: Module[];
    dependencies: Dependency[];
    
    constructor(type: "resources" | "data", client_data?: boolean, dependency?: Dependency) {
        this.header = {
            name: "pack.name",
            description: "pack.description",
            uuid: uuidv4(),
            version: [ 1, 0, 0 ],
            min_engine_version: [ 1, 13, 0 ]
        };
        this.modules = [
            {
                type,
                uuid: uuidv4(),
                version: [ 1, 0, 0 ]
            }
        ];

        if(client_data)
            this.addClientData();

        if(dependency !== undefined) {
            this.dependencies = [ dependency ];
        }
    }

    addClientData() {
        Manifest.addClientData(this);
    }
    removeClientData() {
        Manifest.removeClientData(this);
    }
    static removeClientData(manifest: Manifest) {
        manifest.modules = manifest.modules.filter(({ type }) => type !== "client_data");
    }
    static addClientData(manifest: Manifest) {
        manifest.modules.push({
            type: "client_data",
            uuid: uuidv4(),
            version: [ 1, 0, 0 ]
        });
    }
    static hasClientData(manifest: Manifest) {
        for(let { type } of manifest.modules) {
            if(type === "client_data") return true;
        }
        return false;
    }


    get uuid() {
        return this.header.uuid;
    }

    get() {
        return JSON.stringify(this, null, "\t");
    }
}