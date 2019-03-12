//@ts-check
import EventBus from "../EventBus";
import TabSystem from "../TabSystem";

class ScopeGuard {
    constructor() {
        EventBus.on("updateSelectedTab", () => this.installListener());
        this.scope_units = [];
        this.installListener();
    }

    onScopeChange(f) {
        let scope = new ScopeUnit(TabSystem.getCurrentNavObj());
        scope.onChange = f;
        this.scope_units.push(scope);
    }

    installListener() {
        EventBus.on("updateFileNavigation", () => this.updateScope());
    }

    updateScope() {
        let scope_node = TabSystem.getCurrentNavObj();
        this.scope_units.forEach(s => s.update(scope_node));
    }
}

class ScopeUnit {
    constructor(scope_init) {
        this.last_scope = scope_init;
    }

    in(scope) {
        while(scope !== undefined && this.last_scope !== scope) {
            scope = scope.parent;
        }

        return scope !== undefined;
    }
    update(scope) {
        if(!this.in(scope)) {
            console.log("[SCOPE] Changed!");
            if(typeof this.onChange === "function") this.onChange();
            this.last_scope = scope;
        }
    }
    onChange() {}
}

export default new ScopeGuard();