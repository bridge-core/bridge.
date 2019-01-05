#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
### General
A ```SidebarElement``` is a button-like UI element dedicated to windows. If at least one is defined, a sidebar will show up on the left side of the window.

### ```SidebarElement``` Object
| Key | Type | Description
| --- | --- | ---
| title | ```String``` | Hover text of the sidebar element
| icon | ```String``` | Material design icon to show
| opacity | ```Number``` | Opacity of the icon
| color | ```String``` | Color of the icon; [Reference](https://vuetifyjs.com/en/style/colors#material-colors)
| action | ```Function``` | Action to perform on click

### Example
```javascript
{
    icon: "home",
    title: "Home",
    opacity: 0.5,
    action: () => {
        doSomething();
    }
}
```