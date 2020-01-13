# Plugin API
This is the documentation for bridge.'s new Plugin API. We are still working on bringing more and more capabilities to the new API.

### General
bridge. loads plugins per project. This means that every workspace can have an unique set of plugins. Plugins are a composition of JSON and JavaScript files.

### Getting Started
Navigate to the directory where bridge. stores your behavior packs. There is a button inside the explorer toolbar to open the folder. Choose the project to which you want to add a plugin and navigate to the ```bridge/plugins``` folder. If this folder does not exist yet, create a new one.

Inside this directory, you can create a new folder per plugin you want to add. Create a new JSON file in the root of your plugin called *manifest.json* (```bridge/plugins/<PLUGIN NAME>/manifest.json```).

### Plugin Manifest
The plugin manifest stores important data on your add-on like its version number, the Script API version to use etc.

#### Example Manifest
```javascript
{
    "author": "solvedDev",
    "id": "aad1d7ec-a32e-4732-ad2b-abb770e38202",
    "version": "1.0.0",
    "name": "My Plugin",
    "link": "www.my_homepage.com/me",
    "description": "My first bridge. plugin",
    "api_version": 1
}
```
- Make sure to always **generate a new id** for all of your plugins. You can grab one from [here](https://www.uuidgenerator.net/).
- You can omit the ```api_version``` attribute to always use the latest API version (*currently:* ```2```). We recommend to always specifically set it though.
- The ```link``` attribute is optional and allows you to provide a link to an external webpage which appears in bridge.'s UI.

### Scripts
Scripts are loaded from the ```<PLUGIN NAME>/scripts``` folder. Scripts are written in JavaScript and allow plugins to deeply hook into bridge.'s functionality. You can add new dynamic auto-completions, create new windows, add support for new file types and do many more things.

**Script API 1:** [Documentation](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)

**Script API 2:** In development

### JavaScript APIs
- [```Custom Components```](https://github.com/solvedDev/bridge./blob/master/plugin_docs/custom_components.md)

### JSON Formats
- [```Auto-Completions```](https://github.com/solvedDev/bridge./blob/master/plugin_docs/auto_completions/main.md)
  - [```Dynamic References```](https://github.com/solvedDev/bridge./blob/master/plugin_docs/auto_completions/dynamic_references.md)
- [```Lightning Cache```](https://github.com/solvedDev/bridge./blob/master/plugin_docs/lightning_cache.md)
- [```Presets```](https://github.com/solvedDev/bridge./blob/master/plugin_docs/json/presets.md)
- [```Snippets```](https://github.com/solvedDev/bridge./blob/master/plugin_docs/json/snippets.md)
- [```Themes```](https://github.com/solvedDev/bridge./blob/master/plugin_docs/json/themes.md)

### Other
- [```Default File Types```](https://github.com/solvedDev/bridge./blob/master/plugin_docs/other/default_file_types.md)
