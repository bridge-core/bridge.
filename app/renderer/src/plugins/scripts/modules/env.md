# @bridge/env

Utility module that provides access to environmental project data.

### `getCurrentBP(): string`

Returns the absolute path to the current behavior pack

### `getCurrentRP(): string`

Returns the absolute path to the current resource pack

### `getProjectPrefix(): string`

Returns the prefix/namespace of the current project

### `getProjectTargetVersion(): string`

Returns the target minecraft version of the current project

### `getContext(): Object`

Returns data that depends on the context you call the method in

| Context                     | Type                                             |
| --------------------------- | ------------------------------------------------ |
| `CustomComponent.onApply()` | `{ location: string, entityIdentifier: string }` |
