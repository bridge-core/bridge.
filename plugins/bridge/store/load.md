#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.Store.load(```name```, ```callback```)
Asynchronously loads data of a file.

| Argument | Type | Description
| --- | --- | ---
| name | ```String``` | File name
| callback | ```Function``` | Function to call on completion. The function receives an ```error``` string and the file ```data``` as its arguments

Read more about the Bridge.Store [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/Store.md).

## Example

```javascript
Bridge.Store.load("my-file", (err, data) => console.log(data.toString()))
```