#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
### General
A ```Content``` object is a UI element which can be found inside windows and sidebars.

### ```Content``` Object
| Key | Type | Description
| --- | --- | ---
| type | ```String``` | Hover text of the button
| text | ```String``` | Material design icon to show
| color | ```String``` | Color of the UI element; [Reference](https://vuetifyjs.com/en/style/colors#material-colors)
| action | ```Function``` | Action to perform on user interaction (e.g. input, selecting, toggling switch, clicking button, etc.)

### Available UI types
#### Text
-  ```text```
-  ```header```
#### Layout
-  ```horizontal```
-  ```space```
-  ```divider```
#### User Interaction
-  ```button```
-  ```icon```
-  ```input```
-  ```select```
-  ```combobox```
-  ```slider```
-  ```switch```
#### Other
-  ```loader```

### Example
```javascript
{
    type: "input",
    text: "My input",
    color: "red",
    action(new_user_input) {
        inputChanged(new_user_input);
    }
}
```