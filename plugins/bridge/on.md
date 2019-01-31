#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.on(event, callback)
Bridge.on(event, callback) allows you to listen to events triggered by another plugin or the "bridge." editor itself. 
You may return a modified version of the object received inside the callback function.

### Built-in Events
| Events | Description | Callback arguments
| --- | --- | ---
| ```bridge:cacheFile``` | Triggers before "bridge." caches a file. Allows to store additional data inside the cache | 
| ```bridge:openedSidebar``` | Triggers after a user switched sidebars. Callback receives the sidebar id | ```id```
| ```bridge:saveFile``` | Triggers before "bridge." saves a file |
| ```bridge:startedSaving``` | Triggers before "bridge." initializes the file saving process |
| ```bridge:addedNode``` | Triggers after the user added a new node to a JSON file | ```{ node }```
| ```bridge:modifiedNode``` | Triggers after the user modified a new node to a JSON file | ```{ node }```
| ```bridge:changedTab``` | Triggers after the user switched to a different file | ```{ file_path, file_extension }```

### Example
```javascript
Bridge.on("bridge:saveFile", ({ file, path, content }) => {
    if(file.split(".").pop().toLowerCase() == "txt") {
        return { content: content + "\nby solvedDev" };
    }
});
```
