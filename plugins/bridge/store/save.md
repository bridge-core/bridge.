#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)

## Bridge.Store.save(```name```, ```data```, ```callback```)
Asynchronously saves data inside a file.

### Arguments
| Argument | Type | Description
| --- | --- | ---
| name | ```String``` | File name
| data | ```String``` | Data to store inside the file
| callback | ```Function``` | Function to call on completion. The function receives an ```error``` string as its argument

Read more about the Bridge.Store [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/Store.md).

### Example
```javascript
Bridge.Store.save("my-file", "Hello World!", (err) => {
   if(err) console.log(err);
});
```
