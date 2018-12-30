#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.Footer.register(footer)
Bridge.Footer.register(footer) adds a new footer element to bridge.'s footer area. Footer elements are meant for timely user interaction like displaying errors after saving a file. 

### Footer Object
| Key | Type | Description
| --- | --- | ---
| id | ```String``` | An unique id for your footer
| display_name | ```String``` | Tooltip of the footer
| display_icon | ```String``` | Material design icon to show
| badge | ```Object<Badge>``` | (Optional) Badge to display next to the icon.

### Badge Object
| Key | Type | Description
| --- | --- | ---
| color | ```String``` | Color of the badge
| type | ```String``` | Either ```icon``` or ```text``` (Optional: defaults to ```text```)
| content | ```String``` | Depending on the badge type: Text to display inside the badge or material design icon


### Example
```javascript
Bridge.Footer.register({
  id: "solved-myFooterElements-footer1",
  display_name: "Example Footer",
  display_icon: "info",
  badge: {
    color: "blue",
    type: "text",
    content: "3"
  },

  action: () => {
    doSomething();
  }
});
```
