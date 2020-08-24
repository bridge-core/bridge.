# Themes

### General

Themes change how bridge. looks. You are able to change all user interface elements and the syntax highlighter.

### Plugin Integration

Plugins can also add new themes by providing them inside a `<PLUGIN NAME>/themes` folder. Create a JSON file per theme you want to add. The individual file names don't matter.

### Loading Behavior

bridge. applies the default color theme first and then overwrites it with the theme you provided. This means you only need to define the colors which should change in your custom theme. An exception to this behavior is the file highlighter definition. You have to specifically set all colors or bridge. will use the default text color (white/black).

### Format

#### Main

| Name         | Type                      | Description             |
| ------------ | ------------------------- | ----------------------- |
| `name`       | `String`                  | Name of your theme      |
| `id`         | `String`                  | UUID for your theme     |
| `options`    | `Object<OptionObject>`    | Theme option definition |
| `definition` | `Object<ThemeDefinition>` | Theme definition object |

#### OptionObject

| Name                  | Type      | Default | Description                                                                          |
| --------------------- | --------- | ------- | ------------------------------------------------------------------------------------ |
| `no_logo_display`     | `Boolean` | `false` | Whether to display the blue bridge. logo or simply "bridge."                         |
| `inherit_highlighter` | `Boolean` | `false` | Whether your theme highlighter should use the default bridge. highlighter as a basis |
| `styles`              | `String`  | `---`   | A CSS file to use (CSS files are loaded from the `<PLUGIN NAME>/styles` folder)      |

#### ThemeDefinition

| Name    | Type                   | Description         |
| ------- | ---------------------- | ------------------- |
| `dark`  | `Object<ThemeVariant>` | Dark theme variant  |
| `light` | `Object<ThemeVariant>` | Light theme variant |

#### ThemeVariant

| Name                 | Type                            | Description                                                                          |
| -------------------- | ------------------------------- | ------------------------------------------------------------------------------------ |
| `highlighter`        | `Object<HighlighterDefinition>` | Syntax highlighter colors of your bridge. theme                                      |
| `primary`            | `String`                        | Color; affects menu icons, active tabs, MoLang edit icons, and more                  |
| `secondary`          | `String`                        | Color                                                                                |
| `accent`             | `String`                        | Color; affects toolbar icons                                                         |
| `error`              | `String`                        | Color; affects hovered errors, ! error marks, close button on close prompt, and more |
| `info`               | `String`                        | Color                                                                                |
| `success`            | `String`                        | Color; affects save button on close prompt                                           |
| `warning`            | `String`                        | Color                                                                                |
| `background`         | `String`                        | Color; affects background of editor                                                  |
| `sidebar_navigation` | `String`                        | Color; affects navigation sidebar                                                    |
| `expanded_sidebar`   | `String`                        | Color; affects sidebar containing folders and files                                  |
| `menu`               | `String`                        | Color; affects menus                                                                 |
| `toolbar`            | `String`                        | Color; affects top bar with drop-down menus                                          |
| `footer`             | `String`                        | Color; affects bottom bar containing notifications                                   |
| `tooltip`            | `String`                        | Color; affects the tooltip that show when you hover over buttons                     |
| `default_button`     | `String`                        | Color; affects the + buttons in the JSON editor                                      |

#### HighlighterDefinition

| Name              | Type                  | Description                                                   |
| ----------------- | --------------------- | ------------------------------------------------------------- |
| `property`        | `Object<StyleObject>` | Custom style for syntax highlighter; affects `format_version` |
| `keyword`         | `Object<StyleObject>` | Custom style for syntax highlighter; affects namespaces       |
| `definition`      | `Object<StyleObject>` | Custom style for syntax highlighter; affects special objects  |
| `atom`            | `Object<StyleObject>` | Custom style for syntax highlighter; affects booleans         |
| `number`          | `Object<StyleObject>` | Custom style for syntax highlighter; affects numbers          |
| `string`          | `Object<StyleObject>` | Custom style for syntax highlighter; affects all other values |
| `variable`        | `Object<StyleObject>` | Custom style for syntax highlighter                           |
| `variable_strong` | `Object<StyleObject>` | Custom style for syntax highlighter                           |
| `meta`            | `Object<StyleObject>` | Custom style for syntax highlighter                           |
| `comment`         | `Object<StyleObject>` | Custom style for syntax highlighter                           |

#### StyleObject

| Name              | Type                                               | Description     |
| ----------------- | -------------------------------------------------- | --------------- |
| `color`           | `String`                                           | Color           |
| `text_decoration` | `String<underline\|overline\|line-through\|blink>` | Text decoration |
| `is_italic`       | `Boolean`                                          | Set italic text |

### Example

```javascript
{
    "name": "Default",
    "id": "bridge.default.theme",
    "definition": {
        "dark": {
            "highlighter": {
                "property": { "color": "#a6e22e" },
                "keyword": { "color": "#f92672" },
                "definition": { "color": "#fd971f" },
                "atom": { "color": "#ae81ff" },
                "number": { "color": "#ae81ff" },
                "string": { "color": "#e6db74" },
                "variable": { "color": "#9effff" },
                "variable_strong": { "color": "#66d9ef" },
                "meta": { "color": "white" },
                "comment": { "color": "#75715e" }
            },
            "primary": "#1778D2",
            "secondary": "#1778D2",
            "accent": "#82B1FF",
            "error": "#FF5252",
            "info": "#2196F3",
            "success": "#4CAF50",
            "warning": "#FB8C00",
            "background": "#303030",
            "sidebar_navigation": "#424242",
            "expanded_sidebar": "#424242",
            "menu": "#424242",
            "toolbar": "#000000",
            "footer": "#212121",
            "tooltip": "#303030",
            "default_button": "#212121"
        },
        "light": {
            "highlighter": {
                "property": { "color": "black" },
                "keyword": { "color": "#5A5CAD" },
                "definition": { "text_decoration": "underline" },
                "atom": { "color": "#6C8CD5" },
                "number": { "color": "#164" },
                "string": { "color": "red" },
                "variable": { "color": "black" },
                "variable_strong": { "color": "black" },
                "meta": { "color": "yellow" },
                "comment": { "color": "#0080FF" }
            },
            "primary": "#1778D2",
            "secondary": "#1778D2",
            "accent": "#82B1FF",
            "error": "#FF5252",
            "info": "#2196F3",
            "success": "#4CAF50",
            "warning": "#FB8C00",
            "background": "#fafafa",
            "sidebar_navigation": "#FFFFFF",
            "expanded_sidebar": "#FFFFFF",
            "menu": "#FFFFFF",
            "toolbar": "#e0e0e0",
            "footer": "#f5f5f5",
            "tooltip": "#424242",
            "default_button": "#f5f5f5"
        }
    }
}
```

#### More Examples: [`static/themes`](https://github.com/solvedDev/bridge./tree/master/static/themes)
