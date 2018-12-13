## Plugins

### Overview
#### General
- [```provide(data)```](https://github.com/solvedDev/bridge./blob/master/plugins/provide.md)
- [```use(path)```](https://github.com/solvedDev/bridge./blob/master/plugins/use.md)

#### ```Bridge```
- [```.on(event, callback)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/on.md)
- [```.registerMenu(menu)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/registerMenu.md)
- [```.registerSidebar(sidebar)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/registerSidebar.md)
- [```.registerPlugin(plugin_info)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/registerPlugin.md)
- [```.trigger(event, arguments)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/trigger.md)
- [```.updateSidebar(id, content)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/updateSidebar.md)

#### ```Bridge.FS```
- [```.readDirectory(path, callback)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/fs/readDirectory.md)
- [```.readFile(path, callback)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/fs/readFile.md)

#### [```Bridge.Store```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/Store.md)
- [```.load(name, callback)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/store/load.md)
- [```.save(name, data, callback)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/store/save.md)

### What are Plugins?
Plugins allow talented creators to lift their project onto the next level by extending bridge.'s functionality. 
Plugins are loaded from the "plugins" folder inside the "bridge" folder in the root of your directory. Changing the project inside the
built-in file explorer also loads and unloads plugins.

### The Beginning
Let's create a basic plugin which logs "Hello World!" upon saving a file. We start by registering our plugin.  
In order to hook into the save process, we simply call ```Bridge.on(event, callback)```.
Inside our callback function, we write the usual ```console.log()``` method.
```javascript
Bridge.registerPlugin({
    author: "solvedDev",
    version: "1.0.0",
    name: "My Plugin",
    description: "My first plugin."
});

Bridge.on("save", (err) => {
    console.log("Hello world!");
});
```
