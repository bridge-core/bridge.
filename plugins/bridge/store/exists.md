#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.Store.exists(name)
Bridge.Store.exists(name) checks whether a store item with this name already exists. This test happens synchronously.

### Arguments
| Argument | Type | Description
| --- | --- | ---
| name | ```String``` | Name of the store item to check

### Return value
Returns ```true``` if the given store item exists and ```false``` otherwise.

### Example
```javascript
if(Bridge.Store.exists("entities/player.json")) {
    //Do something...
}
```
