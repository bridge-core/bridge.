#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.Window.update(sidebar)
Bridge.Window.update(sidebar) updates the ```content``` of a sidebar given its ```id```.

### Content Object
You can find the documentation on a ```content``` object [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/sidebar/register.md).

### Example
```javascript
Bridge.Window.update({
  id: "solved-mySidebars-sidebar1",
  content: {
    text: "My updated sidebar content"
  }
});
```
