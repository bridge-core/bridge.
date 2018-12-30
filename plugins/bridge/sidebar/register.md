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

### Content Object
| Key | Type | Description
| --- | --- | ---
| text | ```String``` | Text to show within the sidebar menu



### Example
```javascript
Bridge.Sidebar.register({
    id: "solved-mySidebars-sidebar1",
    title: "My Sidebar",
    icon: "my-material-design-icon",
    content: {
      text: "My sidebar content is cool.\nVery cool!"
    }
});
```
