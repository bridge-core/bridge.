#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.loadFile(path, callback)
Bridge.loadFile(path, callback) reads a file inside the currently selected project asynchronously.

### Arguments
| Key | Type | Description
| --- | --- | ---
| path | ```String``` | Path of the file to read
| callback | ```Function``` | Callback function. Receives ```error``` and ```data``` as arguments


### Example
```javascript
Bridge.loadFile("entities/player.json", (err, data) => {
    if(err) console.log(err);
    console.log(data);
});
```
