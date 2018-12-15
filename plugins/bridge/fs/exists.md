#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.FS.exists(path)
Bridge.FS.exists(path) checks whether a path inside the currently selected project exists. This test happens synchronously.

### Arguments
| Argument | Type | Description
| --- | --- | ---
| path | ```String``` | Path of the file/directory to check


### Return value
Returns ```true``` if the given path exists and ```false``` otherwise.

### Example
```javascript
if(Bridge.FS.exists("entities/player.json")) {
    //Do something...
}
```
