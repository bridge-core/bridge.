#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## use(path)
use(path) imports the provided information of another plugin.
It is recommended to save JavaScript files you want to import inside a dedicated folder inside your plugins directory. This significantly improves performance and avoids loading issues.

Creating modules can significantly increase the readability of your plugin and helps avoiding name conflicts within bigger projects.
Using a single module multiple times has no impact on how often a module gets evaluated. It only happens the first time another file makes use of it.

### Example
```javascript
const { data, text, information_text } = use("modules/my_first_module.js");
const { welcome_text } = use("modules/my_second_module.js");
const data3 = use("modules/my_third_module.js");
...
```
