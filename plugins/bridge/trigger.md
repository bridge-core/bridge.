#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.trigger(event, arguments)
Bridge.trigger(event, arguments) allows you to trigger events to which other plugins can listen to.

| Argument | Type | Description |
| --- | --- | --- |
| event | ```String``` | Event to trigger |
| arguments | ```Any``` | Data to send with the event |


### Example
```javascript
Bridge.trigger("my-event", { "my-object-to-send": {} });
```
