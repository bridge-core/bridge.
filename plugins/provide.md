#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## provide(data)
provide(data) exports the provided data and makes it accessible to ```use(path)``` statements.
You may chain an ```as(id)``` method to provide the data as specific string id. This is especially useful if you want to make a module accessible based on a name instead of the file path.
Read more about modules [here](https://github.com/solvedDev/bridge./blob/master/plugins/use.md).

### Example
```javascript
function doSomething() {
    console.log("I am doing something");
}
function log(text) {
    console.log(text);
}
class Speaker {
    sayHey() {
        log("Hey");
    }
}

provide({
    log,
    doSomething,
    text: "Hello World",
    welcome_text: "Welcome!",
    Speaker
})
.as("my-module");
```