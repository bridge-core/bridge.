#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.on(event, callback)
Bridge.on(event, callback) allows you to listen to events triggered by another plugin or the "bridge." editor itself. 
You may return a modified version of the object received inside the callback function.

### Built-in Events
| Events | Description |
| --- | --- |
| ```bridge:cacheFile``` | Triggers before "bridge." caches a file. Allows to store additional data inside the cache |
| ```bridge:openedSidebar``` | Triggers after a user switched sidebars. Callback receives the sidebar id |
| ```bridge:saveFile``` | Triggers before "bridge." saves a file |
| ```bridge:startedSaving``` | Triggers before "bridge." initializes the file saving process |


### Example
```javascript
Bridge.on("bridge:saveFile", ({ file, path, content }) => {
    if(file.split(".").pop().toLowerCase() == "txt") {
        return { content: content + "\nby solvedDev" };
    }
});
```
