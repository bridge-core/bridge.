#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.Sidebar.register(sidebar)
Bridge.Sidebar.register(sidebar) adds a new sidebar to bridge.'s menu. 

### Sidebar Object
| Key | Type | Description
| --- | --- | ---
| id | ```String``` | An unique id for your sidebar
| title | ```String``` | Title of the sidebar
| icon | ```String``` | Material design icon to show
| content | ```Object<Content>``` | Content to show inside the sidebar
| toolbar | ```Array<ToolbarElement>``` | Array of elements of the toolbar

### ToolbarElement Object
Information about the ```ToolbarElement``` object can be found [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/general/toolbar_element.md).

### Content Object
Information about the ```Content``` object can be found [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/general/content.md).

### Example
```javascript
Bridge.Sidebar.register({
    id: "solved-mySidebars-sidebar1",
    title: "My Sidebar",
    icon: "my-material-design-icon",
    toolbar: [
        {
          display_name: "My action button",
          display_icon: "home",
          action() {
            doSomething();
          }
        }
    ],
    content: {
      text: "My sidebar content is cool.\nVery cool!"
    }
});
```
