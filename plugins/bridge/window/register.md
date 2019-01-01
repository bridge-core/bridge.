#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.Window.register(window)
Bridge.Footer.register(window) registers a new popup window.

### ```Window``` Object
| Key | Type | Description
| --- | --- | ---
| id | ```String``` | An unique id for your window
| display_name | ```String``` | Title of the window
| is_visible | ```Boolean``` | Whether the window is visible
| options | ```String``` | Content to show inside the sidebar
| toolbar | ```Array<ToolbarElement>``` | Array of elements of the window toolbar
| content | ```Array<Content>``` | Main content of the window
| actions | ```Array<Content>``` | Content to show below the main content (e.g. "cancel"/"confirm" buttons)
| onClose | ```Function``` | Function to call when the window closes

### ```WindowOptions``` Object
Information about the ```WindowOptions``` object can be found [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/general/window_options.md).

### ```ToolbarElement``` Object
Information about the ```ToolbarElement``` object can be found [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/general/toolbar_element.md).

### ```Content``` Object
Information about the ```Content``` object can be found [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/general/content.md).

### Example
```javascript
Bridge.Window.register({
  id: "solved-myWindows-window1",
  display_name: "New name",
  is_visible: true,
  options: {
      "..."
  },
  toolbar: [
      "..."
  ],
  content: [
      "..."
  ],
  actions: [
      "..."
  ],
  onClose() {
      closedWindow();
  }
});
```
