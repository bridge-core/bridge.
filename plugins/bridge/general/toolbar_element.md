#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
### General
A ```ToolbarElement``` is a button-like UI element dedicated to toolbars inside windows or a sidebar. 

### ```ToolbarElement``` Object
| Key | Type | Description
| --- | --- | ---
| display_name | ```String``` | Hover text of the button
| display_icon | ```String``` | Material design icon to show
| color | ```String``` | Color of the icon; [Reference](https://vuetifyjs.com/en/style/colors#material-colors)
| action | ```Function``` | Action to perform on click

### Example
```javascript
{
    display_name: "My hover text",
    display_icon: "home",
    action() {
        doSomething();
    }
}
```