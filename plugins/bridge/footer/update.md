#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.Footer.update(footer)
Bridge.Footer.update(footer) updates a footer element. One only needs to specify the attributes one wants to change and the footer ```id```.

### Footer Object
You can find the documentation on a ```footer``` object [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/footer/register.md).

### Example
```javascript
Bridge.Footer.update({
  id: "solved-myFooterElements-footer1",
  display_name: "New name",

  action: () => {
    newDoSomething();
  }
});
```
