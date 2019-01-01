#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.Sidebar.update(sidebar)
Bridge.Sidebar.update(sidebar) updates a sidebar. One only needs to specify the attributes one wants to change and the sidebar ```id```.

### Sidebar Object
You can find the documentation on a ```sidebar``` object [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/sidebar/register.md).

### Example
```javascript
Bridge.Sidebar.update({
  id: "solved-mySidebars-sidebar1",
  content: {
    text: "My updated sidebar content"
  }
});
```
