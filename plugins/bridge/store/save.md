#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)

## Bridge.Store.save(name, data)
Synchronously saves data inside the Store. Read more about the ```Bridge.Store``` [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/Store.md).

### Arguments
| Argument | Type | Description
| --- | --- | ---
| name | ```String``` | File name
| data | ```String``` | Data to store inside the file


### Example
```javascript
Bridge.Store.save("my-file", {
   my_attr: "Hello World!"
});
```
