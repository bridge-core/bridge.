<h1 align="center">Getting Started</h1>

## Creating a project

To get started making addons with bridge. you need to create a project.

With bridge. creating a new project is easy.
You need to click the create project button to open the project creation window

![No projects - Create project](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_1.png)

Here you can give your project a name, description and choose whether you want to register client data in the pack manifest - _this only needs to be toggled on if you're using Minecraft's scripting api in your addon_

![Create project window](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_2.png)

Once you've done that, you can click **Create!** and bridge. will set up the project files including the manifest.

You should also set the namespace for your project for better auto-completions and syntax highlighting. The option to change this is found by clicking the 'More' icon in the top left and clicking **Project Namespace**. A window will then appear allowing you to change the project namespace.

## Creating a resource pack

Creating a resource pack in bridge. is just as easy.
On the sidebar, you will see 6 buttons - the first one shows your behavior pack and the second shows your resource pack.

To add a resource pack to your project you need to select the resource pack on the sidebar and you will see two buttons, **Create** and **Link**

![Create resource pack](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_3.png)

**Link** will allow you to link an existing resource pack to your project. The resoruce pack will resource pack will then be made a dependency of your selected behavior pack

**Create** will open a resource pack creation window where you can input a name and description for your resource pack

![Create resource pack window](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_4.png)

Once you have done that click create and your resource pack will be created and linked to your behvaior pack.

## Creating files

bridge. supports creating **all** files that Minecraft supports.
You can create a file in you Behavior Pack and Resource pack by clicking the new file button, or double clicking the welcome screen.

![Create file button](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_5.png)

Doing this will open the new file window. Here you will see a sidebar in the window which lets you select from all of the possible files you can create.

_Remember you can scroll down the sidebar to see more file types you can create!_

![Create File Window](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_6.png)

Once you have selected a file, you will see that you need to input a file name.
**Make sure you keep all file names and identifiers in `snake_case`**

For most file types, you will also see a dropdown to select a template to work from. It is recommended that you select a template because it will make creating your file easier.
Once you have done that, click **Create!** and your file will be created, placed in the correct folder and opened.

## Editing files

### JSON

When you open a JSON file with bridge., you will see the file displayed as an expandable tree, where you can drag nodes to reorder them and left clicking a node will select it. While a node is selected, you can use the 3 input boxes at the bottom.

![JSON Editor](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_7.png)

The input on the left will let you add a JSON object to the selected node.
The input in the middle will let you add a value to the selected node.
The input on the right will let you edit the currently selected node.

When you right click on a node it will open the hover card, where you can cut, copy, paste, delete and open the documentaion for the curently selected node.

![Hover Card](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_8.png)

_There is currently a work in progress, updated JSON renderer which will feature a new, fresh way to edit JSON files_

### Other file types

bridge. also supports opening and editing other file types, including:

.mcfunction
![Mcfunction](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_9.png)
.js
![Javascript](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_10.png)

## Unique editing features

Using bridge. will let you use many built-in, powerful tools that will make your developing experience quicker and easier!

### Presets

Presets are a feature that lets you create a whole entity, block, item and much more, by entering an identifier and clicking **Create!** bridge. will then add all the files you need for whatever you select and it will use the identifier you entered inside the created files.

![Tools > Preset](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_11.png)
![Preset Window](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_12.png)

### Snippets

Snippets can be used by pressing `ctrl + q` while you have a JSON file open. Snippets allow you to quickly insert JSON into a file. bridge. has snippets for entity behavior files, but more can be added with plugin or you can create your own by going to the toolbar and clicking **File > Preferences > Settings** Then you can select the Snippets tab in the window's sidebar click the plus icon under Custom Snippets.

![Settings > Snippets](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_13.png)
![Snippet Window](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_14.png)

### Custom syntax

bridge. has custom syntax in JSON files that allow you to make complex features quickly.
An example of custom syntax is the `bridge:item_equipped_sensor` component which can be found in item behavior files. This component aloows you to easily execute commands when you hold the item, trigger events when you equip/unequip the item and have components active on the player while holding/ not holding the item.

![bridge:item_equipped_sensor](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_15.png)

## Customizing bridge.

bridge. features a plugin api which allows you to customize UI add new snippets, presets, themes and much more!

You can either <a href="https://github.com/bridge-core/bridge./blob/master/plugin_docs/main.md">create your own plugins</a> or download plugins made by others from the extension store.
This can be found by clicking the extensions tab on the sidebar and the pressing **View Extensions**. From here you can download from a collection of plugins to modify your experience with bridge.

![Open extension store](https://github.com/bridge-core/bridge./blob/dev/images/getting_started_16.png)

bridge. also has a powerful feature for experienced users that allows you to write Javascript to create your own <a href="https://github.com/bridge-core/bridge./blob/master/plugin_docs/custom_components.md">Custom Components</a>, which can be used in entity behavior files to quickly re-use behaviors and <a href="https://github.com/bridge-core/bridge./blob/master/plugin_docs/custom_commands.md">Custom Commands</a>, which can be used inside .mcfunction files to make writing long and complex functions easier

For further help, you can join the <a href="https://discord.gg/jj2PmqU">official bridge. Discord server</a>!
