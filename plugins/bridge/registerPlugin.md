## Bridge.registerPlugin(plugin_info)
Bridge.registerPlugin(plugin_info) allows you to register your plugin. Registered plugins show up in the "extensions" tab.

### Plugin Object
| Key | Type | Description
| --- | --- | ---
| author | ```String``` | Author of the plugin
| version | ```String``` | Version of your plugin
| name | ```String``` | Name of your plugin
| description | ```String``` | Description of your plugin
| link | ```String``` | Will show up in the "extensions" tab as an information button


### Example
```javascript
Bridge.registerPlugin({
    author: "solvedDev",
    version: "1.0.0",
    name: "My Plugin",
    description: "My first plugin!",
    link: "https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md"
});
```

#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
