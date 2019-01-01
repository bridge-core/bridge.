#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
### General
A ```WindowOptions``` object specifies how a popup window looks and behaves. All attributes of this object are optional. You can create a window without specifying a ```WindowOptions``` object at all.

### ```WindowOptions``` Object
#### Size & Position
| Key | Type | Description
| --- | --- | ---
| width | ```Number``` | Width of the window
| height | ```Number``` | Height of the window
| maxHeight | ```Number``` | Maximum width of the window
| maxWidth | ```Number``` | Maximum height of the window
#### Window Color
| Key | Type | Description
| --- | --- | ---
| toolbar_color | ```Boolean``` | Color of the window toolbar; [Reference](https://vuetifyjs.com/en/style/colors#material-colors)
| main_color | ```Boolean``` | Color of the window; [Reference](https://vuetifyjs.com/en/style/colors#material-colors)
#### General Options
| Key | Type | Description
| --- | --- | ---
| is_draggable | ```Boolean``` | Whether the user can drag the window
| is_persistent | ```Boolean``` | Whether the user can close the window by clicking outside of it
| is_frameless | ```Boolean``` | Whether to show the toolbar
| is_closable | ```Boolean``` | Whether to show the "close" button inside the toolbar
| is_maximizable | ```Boolean``` | Whether to show the "maximize" button inside the toolbar
| blurs_background | ```Boolean``` | Whether to blur the editor behind the window

### Example
```javascript
{
    width: 500,
    height: 300,
    toolbar_color: "green",
    main_color: "green darken-1",
    blurs_background: false,
    is_persistent: false
}
```