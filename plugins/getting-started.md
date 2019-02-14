## Plugins

### Overview
#### General
- [```provide(data)```](https://github.com/solvedDev/bridge./blob/master/plugins/provide.md)
- [```use(path)```](https://github.com/solvedDev/bridge./blob/master/plugins/use.md)

#### ```Bridge```
- [```.on(event, callback)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/on.md)
- ```.off(event, callback)```
- [```.open(file)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/open.md)
- [```.openExternal(path)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/openExternal.md)
- [```.registerPlugin(plugin_info)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/registerPlugin.md)
- [```.trigger(event, arguments)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/trigger.md)

#### ```Bridge.BuildableFile```
- [```.register(file_def)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/buildableFile/register.md)

#### ```Bridge.Footer```
- [```.register(footer)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/footer/register.md)
- [```.remove(id)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/footer/remove.md)
- [```.update(footer)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/footer/update.md)

#### ```Bridge.FS```
- [```.exists(path)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/fs/exists.md)
- [```.readDirectory(path, callback)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/fs/readDirectory.md)
- [```.readFile(path, callback)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/fs/readFile.md)
- ```.readFileSync(path)```
- ```.writeFile(path, data, callback)```

#### ```Bridge.Language```
 - [```.register(name, language_definition)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/highlighter/registerLanguage.md)
 - ```.remove(name)```

#### ```Bridge.JSON```
Documentation not available yet.
WIP Draft:
- ```.registerFile(file_details)```

#### ```Bridge.JSON.<FILE>```
Documentation not available yet.
WIP Draft:
- ```.registerSyntax(syntax_details)```
- ```.defineComponentSegment(segment_details)```
- ```.registerComponent(component_details)```

#### ```Bridge.JSON.<FILE>.Highlighter```
Documentation not available yet.
WIP Draft:
- ```.addKeywords(keyword_arr)```
- ```.addTitles(title_arr)```
- ```.addSymbols(symbol_arr)```

#### ```Bridge.Menu```
- [```.register(menu)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/menu/register.md)

#### ```Bridge.Sidebar```
- [```.close()```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/sidebar/close.md)
- [```.open(id)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/sidebar/open.md)
- [```.openDefault()```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/sidebar/open_default.md)
- [```.register(sidebar)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/sidebar/register.md)
- [```.remove(id)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/sidebar/remove.md)
- [```.update(sidebar)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/sidebar/update.md)

#### [```Bridge.Store```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/Store.md)
- [```.exists(name)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/store/exists.md)
- [```.load(name, callback)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/store/load.md)
- [```.save(name, data, callback)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/store/save.md)
- ```.setup(namespace)```

#### ```Bridge.Window```
- [```.close(id)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/window/close.md)
- [```.open(id)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/window/open.md)
- [```.register(window)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/window/register.md)
- [```.remove(id)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/window/remove.md)
- [```.update(window)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/window/update.md)

#### ```Bridge.Utils```
Upcoming!

### What are Plugins?
Plugins allow talented creators to lift their project onto the next level by extending bridge.'s functionality. 
Plugins are loaded from the "plugins" folder inside the "bridge" folder in the root of your directory. Changing the project inside the
built-in file explorer also loads and unloads plugins.

### The Beginning
Let's create a basic plugin which logs "Hello World!" upon saving a file. We start by registering our plugin.  

#### Step 0:
Create a new JavaScript file for your plugin inside the "plugins" folder.

#### Step 1: Registering your plugin
Inside this file, register your plugin.
```javascript
Bridge.registerPlugin({
    author: "solvedDev",
    version: "1.0.0",
    name: "My Plugin",
    description: "My first plugin."
});
```

#### Step 2: Console
Even though there is a native console module available to your plugin, let's write our own one! Create a new folder inside your "plugins" folder called "modules". Add another .js file inside it (*console.js*). One can use the ```provide(data)``` method to determine which data shall be exposed to the plugins using the module. Please note that modules are only evaluated once! In this example, all plugins using the console module will use the same console!

Generally, you do not need to register this file as a separate plugin (unless you want to create new bridge. app menus).
```javascript
class Console {
    constructor() {

    }

    log(text) {

    }
}

provide(new Console());
```

#### Step 3: Sidebar
In order to show our console, we need a new sidebar. Let's register it inside the constructor.

[More information on custom sidebars...](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/sidebar/register.md)
```javascript
class Console {
    constructor() {
        Bridge.Sidebar.register({
            id: "utility-console-sidebar",
            title: "Console",
            icon: "sms_failed",
            content: {
                text: ""
            }
        });
    }

    log(text) {

    }
}

provide(new Console());
```

#### Step 4: Console logic
Let's finalize our logic. Save the current console text inside a separate variable. Upon logging something to the console, we now need to update the variable and the sidebar content.

```javascript
class Console {
    constructor(text="") {
        this.console_text = text;
        Bridge.Sidebar.register({
            id: "utility-console-sidebar",
            title: "Console",
            icon: "sms_failed",
            content: {
                text: this.console_text
            }
        });
    }

    log(text) {
        this.console_text += text + "\n";
        Bridge.Sidebar.update("utility-console-sidebar", {
            text: this.console_text
        });
    }
}

provide(new Console());
```

#### Step 5: Using the console
Now jump back to the first .js file you created. Import the console module into it. Then listen for the "save" event and log "Hello World!" upon receiving it.

```javascript
const my_console = use("modules/console.js");

Bridge.registerPlugin({
    author: "solvedDev",
    version: "1.0.0",
    name: "My Plugin",
    description: "My first plugin."
});

Bridge.on("save", () => {
    my_console.log("Hello World!");
});
```

#### Step 6: Testing
Reload the directory with your plugins by pressing reload inside the built-in explorer. Now try to save a file and if you've done everything correct, you can see "Hello World!" inside a new console tab.
