#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.readDirectory(path, callback)
Bridge.readDirectory(path, callback) reads a Directory inside the currently selected project asynchronously.

### Arguments
| Key | Type | Description
| --- | --- | ---
| path | ```String``` | Path of the Directory to read
| callback | ```Function``` | Callback function. Receives ```error``` and ```files``` as arguments


### Example
```javascript
Bridge.readDirectory("entities", (err, files) => {
    if(err) console.log(err);
    console.log(files);
});
```
