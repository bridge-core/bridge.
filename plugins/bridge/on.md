#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.on(event, callback)
Bridge.on(event, callback) allows you to listen to events triggered by another plugin or the "bridge." editor itself. 
You may return a modified version of the object received inside the callback function.

### Built-in Events
| Events | Description | Callback arguments
| --- | --- | ---
| ```bridge:addedNode``` | Triggers after the user added a new node to a JSON file | ```{ node }```
| ```bridge:beforePropose``` | Triggers before bridge. shows auto-completions to the user | ```{ propose, node }```
| ```bridge:cacheFile``` | Triggers before "bridge." caches a file. Allows to store additional data inside the cache 
| ```bridge:changedTab``` | Triggers after the user switched to a different file | ```{ file_path, file_extension }```
| ```bridge:modifiedNode``` | Triggers after the user modified a JSON node | ```{ node }```
| ```bridge:openedSidebar``` | Triggers after a user switched sidebars. Callback receives the sidebar id | ```id```
| ```bridge:saveFile``` | Triggers before "bridge." saves a file |
| ```bridge:selectedNode``` | Triggers after the user selected a new node | ```{ node }```
| ```bridge:startedSaving``` | Triggers before "bridge." initializes the file saving process

### Example
```javascript
Bridge.on("bridge:saveFile", ({ file, path, content }) => {
    if(file.split(".").pop().toLowerCase() == "txt") {
        return { content: content + "\nby solvedDev" };
    }
});
```
