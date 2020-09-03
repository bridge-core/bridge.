# Plugin Modules

_This documentation is still a work in progress_

## [@bridge/env](https://github.com/solvedDev/bridge./blob/master/app/renderer/src/plugins/scripts/modules/env.md)

## [@bridge/fetch-definition](https://github.com/solvedDev/bridge./blob/master/app/renderer/src/plugins/scripts/modules/fetchDefinition.md)

## [@bridge/path](https://github.com/solvedDev/bridge./blob/master/app/renderer/src/plugins/scripts/modules/path.md)

## [@bridge/ui](https://github.com/solvedDev/bridge./blob/master/app/renderer/src/plugins/scripts/modules/ui.md)

## [@bridge/utils](https://github.com/solvedDev/bridge./blob/master/app/renderer/src/plugins/scripts/modules/utils.md)

## [@bridge/windows](https://github.com/solvedDev/bridge./blob/master/app/renderer/src/plugins/scripts/modules/windows.md)

## [@bridge/sidebar]()

## [@bridge/file-importer]()

## [@bridge/notification]()

## [@bridge/fs](https://github.com/solvedDev/bridge./blob/master/app/renderer/src/plugins/scripts/modules/fs.md)

## [@bridge/globals](https://github.com/solvedDev/bridge./blob/master/app/renderer/src/plugins/scripts/modules/globals.md)

Usage Examples:

```javascript
const Sidebar = await require('@bridge/sidebar')

Sidebar.create({
	id: 'example',
	displayName: 'Example',
	icon: 'mdi-console',
	component: UI.Example,
})
```

```javascript
const { createInformationWindow } = await require('@bridge/windows')

createInformationWindow('Window Title', 'This is the window content!')
```
