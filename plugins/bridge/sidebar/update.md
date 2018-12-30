#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.Sidebar.update(sidebar)
Bridge.Sidebar.update(sidebar) updates the ```content``` of a sidebar given its ```id```.

### Content Object
You can find the documentation on a ```content``` object [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/Sidebar/register.md).

### Example
```javascript
Bridge.Sidebar.update({
  id: "solved-mySidebars-sidebar1",
  content: {
    text: "My updated sidebar content"
  }
});
```
