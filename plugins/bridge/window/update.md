#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.Window.update(window)
Bridge.Window.update(window) updates a window. One only needs to specify the attributes one wants to change and the window ```id```.

### Content Object
You can find the documentation on a ```window``` object [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/sidebar/register.md).

### Example
```javascript
Bridge.Window.update({
  id: "solved-myWindows-window1",
  content: [
    {
      text: "My updated window content"
    }
  ]
});
```
