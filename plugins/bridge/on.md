#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.on(event, callback)
Bridge.on(event, callback) allows you to listen to events triggered by another plugin or the "bridge." editor itself.

### Built-in Events
| Events | Description |
| --- | --- |
| save | Triggers before "bridge." saves a file. |


### Example
```javascript
Bridge.on("save", (err, { file, path, content }) => {
    if(file.split(".").pop().toLowerCase() == "txt") {
        return { content: content + "\nby solvedDev" };
    }
});
```
