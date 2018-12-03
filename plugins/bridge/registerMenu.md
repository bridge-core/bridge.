## Bridge.registerMenu(menu)
Bridge.registerMenu(menu) allows you to create a new app toolbar element with custom functionality.
The function requires a valid menu object as a parameter which should look like this:

### Menu Object
| Key | Type | Description
| --- | --- | ---
| id | ```String``` | An unique id for your menu
| display_name | ```String``` | Which name to show inside the app toolbar
| elements | ```Array``` | Elements inside your menu

### Menu Elements
| Key | Type | Description
| --- | --- | ---
| type | ```String``` | (Optional) Type of the element. Can be "divider" or "submenu"
| title | ```String``` | Title of your menu element
| subheader | ```String``` | (optional) Subheader to show below the title
| shortcut | ```Array``` | (optional) Shortcut to register for the action bound to this item
| action | ```String``` | Action to perform upon activating this menu item
| elements | ```Array``` | Elements to append as a submenu. Requires the element type to be set as "submenu"


### Example
```javascript
Bridge.registerMenu({
  id: "my-unique-menu-id",
  display_name: "Name to show inside the app toolbar",
  elements: [
    {
      title: "Do something",
      shortcut: "Control + W"
    },
    {
      type: "divider"
    },
    {
      type: "submenu",
      title: "My submenu",
      elements: [
        {
          title: "Do something 2",
          shortcut: "Control + Shift + W"
        }
      ]
    }
  ]
})
```

#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
