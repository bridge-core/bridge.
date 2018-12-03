## Plugins

### Overview
#### Bridge
- [```registerMenu(menu)```](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/registerMenu.md)

### What are Plugins?
Plugins allow talented creators to lift their project onto the next level by extending bridge.'s functionality. 
Plugins are loaded from the "plugins" folder inside the "bridge" folder in the root of your directory. Changing the project inside the
built-in file explorer also loads and unloads plugins.

### The Beginning
Let's create a basic plugin which logs "Hello World!" upon saving a file. We start by writing the self-invoking function. 
Its return value is the information about your plugin. 
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
