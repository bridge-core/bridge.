#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.trigger(event, arguments)
```Bridge.trigger(event, arguments)``` allows you to trigger events to which other plugins can listen.

### Arguments
| Argument | Type | Description |
| --- | --- | --- |
| event | ```String``` | Event to trigger |
| arguments | ```Object``` | Data to send with the event |
| basic | ```Boolean``` | (Optional) Only sends the event to the last subscriber |

### Return value
```Bridge.trigger(event, arguments)``` returns the modified ```arguments``` object.

### Example
```javascript
Bridge.trigger("my-event", { "my-object-to-send": {} });
```
