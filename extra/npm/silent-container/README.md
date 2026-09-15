# Silent Container

A powerful **Discord Components V2 Alternative** for discord.js that makes building containers easier, cleaner, and more expressive.

## 📦 Installation

```bash
npm install silent-container
```
> Requires `discord.js` v14+


## 🚀 Quick Start
Some components to this package require `AttachmentBuilder` from `discord.js`, so make sure to include that if it does!

This is a simple/basic example of how you can use this package, it works the same as Discord's Components V2 with the added ability of not pinging members or roles when you mention them, witout having to disable `allowedMentions` in your bot's main file!

```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .setColor('yellow')
    .addHeading('Noah\'s Container')
    .addText('Hello <@372456601266683914>!')

await interaction.reply({ ...container.toMessagePayload() });
```


## ❓ What Do I Support?
| Command | Description |
| --- | --- |
| `.setColor()` | Set the container accent colour using a hex value, number, or colour name. |
| `.setStatus()` | Shortcut for `.setColor()` using predefined status colours (`success`, `error`, `warning`, or `info`). |
| `.addText()` | Add a text display component. |
| `.addLongText()` | Automatically split long text into multiple text components. |
| `.addHeading()` | Add a Markdown heading (levels 1–3). |
| `.addQuote()` | Add a quoted block of text. |
| `.addBulletList()` | Create a bulleted list. |
| `.addNumberedList()` | Create a numbered list. |
| `.addChecklist()` | Create a checklist with configurable checked and unchecked icons. |
| `.addTable()` | Display data as an inline or monospace table. |
| `.addFields([])` | Add multiple embed-style fields, with optional inline grouping. |
| `.addField()` | Add a single embed-style field. |
| `.addInfo()` | Add an informational message with an optional icon or quote style. |
| `.addWarning()` | Add a warning message with an optional icon or quote style. |
| `.addSuccess()` | Add a success message with an optional icon or quote style. |
| `.addError()` | Add an error message with an optional icon or quote style. |
| `.addDivider()` | Insert a divider between components. |
| `.addSpacer()` | Insert a spacer between components. |
| `.addMedia()` | Display one or more images in a media gallery. |
| `.addFile()` | Display an attached file in the container. |
| `.attachFile()` | Attach a file to the outgoing message. |
| `.addCodeFile()` | Display a code preview and optionally attach the source file. |
| `.addCodeBlock()` | Add a fenced Markdown code block with optional syntax highlighting. |
| `.addCode()` | Add inline code formatting. |
| `.addSection()` | Create a section with text and an optional thumbnail accessory. |
| `.addActionRow()` | Add an action row containing buttons. |


## 🎨 Colours
You can use colours to change the colour of the bar that sits along the side of the container. You can use numbers, hex codes or the name of the colour, you also don't need to include the # when using the hex code!
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .setColor('yellow')

await interaction.reply({ ...container.toMessagePayload() });
```
If you use the name of the colour, these are the colours currently supported and the corresponding codes. You can use custom hex codes/numbers if these do not suit your needs!
| Colour | Hex Code | Without # | Number |
| --- | --- | --- | --- |
| Red | #FF0000 | FF0000 | 0xFF0000 |
| Orange | #FFA500 | FFA500 | 0xFFA500 |
| Yellow | #FFFF00 | FFFF00 | 0xFFFF00 |
| Green | #00FF00 | 00FF00 | 0x00FF00 |
| Blue | #0000FF | 0000FF | 0x0000FF |
| Purple | #800080 | 800080 | 0x800080 |
| Pink | #FFC0CB | FFC0CB | 0xFFC0CB |
| White | #FFFFFF | FFFFFF | 0xFFFFFF |
| Gray | #808080 | 808080 | 0x808080 |
| Grey | #808080 | 808080 | 0x808080 |
| Black | #000000 | 000000 | 0x000000 |


## 📊 Status Colours
This is an alternative to `.setColor()`, so you should decide which one to use rather than using both. If you want more control over the colour then I recommend using `.setColor()` as this method only has 4 predefined colours.
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .setStatus('success')

await interaction.reply({ ...container.toMessagePayload() });
```
| Status | Colour | Hex Code |
| --- | --- | --- |
| Success | #57F287 | Green |
| Info | #5865F2 | Blurple |
| Warning | #FEE75C | Yellow |
| Error | #ED4245 | Red |


## ✏️ Text
This is the main text component, there are 2 types: `.addText()`, and `.addLongText()` which accepts the maximum characters Discord allows. `.addLongText()` also accepts a parameter with the text, which is used to allow the text to be split into separate text components every x characters.
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addText('Hi there, Noah! I only accept 500 characters...')
    .addLongText('I will automatically split into a new text component if I exceed 1900 characters.')
    .addLongText('I will split into new text components, every 250 characters!', 250)

await interaction.reply({ ...container.toMessagePayload() });
```


## 🧱 Headings
There are 3 supported sizes for headings, and this component accepts a parameter while also having a default size if you don't provide one. The parameter determines if the heading contains 1, 2 or 3 # symbols before the text
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addHeading('Noah\'s Container', 2)
    .addHeading('Noah\'s Container') // This will default to 3x # before `Noah's Container`

await interaction.reply({ ...container.toMessagePayload() });
```


## 💬 Quotes
This allows you to add quotes within the container, which can be useful for notices and more!
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addQuote('This will indent and appear as a quote!')

await interaction.reply({ ...container.toMessagePayload() });
```


## 💻 Code Blocks
There are two types of code blocks which Discord supports, and you can include them within this container. 

**INLINE**: 
> If you only want to highlight a specific line, this one is the more reasonable option.
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addCode('npm install')

await interaction.reply({ ...container.toMessagePayload() });
```

**BLOCK**: 
> If you want to highlight an entire block as a single section, this one allows for that. You can write the block in the line itself, or define it somewhere and call it instead. This option also supports syntax highlighting - you just need to include the language prefix at the end!
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addCodeBlock('This is the first line\nThis will be the second line', 'js')

await interaction.reply({ ...container.toMessagePayload() });
```

```js
const SilentContainer = require('silent-container');

const code = `
    test
    test2
`

const container = new SilentContainer()
    .addCodeBlock(code, js)

await interaction.reply({ ...container.toMessagePayload() });
```


## 📋 Lists
There are 3 types of lists that you can use with this container, `Bullet Lists`, `Numbered Lists` and `Checklists`.

**BULLET LIST**
> This provides a bullet point list using the options you provide.
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addBulletList(['Item 1', 'Item 2', 'Item 3'])

await interaction.reply({ ...container.toMessagePayload() });
```

**NUMBERED LIST**
> This provides a numbered point list using the options you provide, similar to the bullet list.
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addNumberedList(['Item 1', 'Item 2', 'Item 3'])

await interaction.reply({ ...container.toMessagePayload() });
```


**CHECKLISTS**
> This provides a customisable checklist, using preset icons to display whether something is complete/incomplete.
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addChecklist(
      [
        { text: 'Install Node.JS', checked: true },
        { text: 'Install silent-container', checked: true },
        { text: 'Install Discord.js', checked: false },
      ]
    )

await interaction.reply({ ...container.toMessagePayload() });
```

> If you don't want to use preset icons, you can include your own icons as long as you have defined them within the file first!
```js
const SilentContainer = require('silent-container');
const emojis = {
    approve: '<:enable:1456904915522814084>',
    deny: '<:disable:1456904913773924457>',
}

const container = new SilentContainer()
    .addChecklist(
      [
        { text: 'Install Node.JS', checked: true },
        { text: 'Install silent-container', checked: true },
        { text: 'Install Discord.js', checked: false },
      ],
      {
        checked: emojis.approve,
        unchecked: emojis.deny,
      }
    )

await interaction.reply({ ...container.toMessagePayload() });
```


## 📊 Tables
There are two options for tables, the first option is `inline` which is just a section per item you list. Inline is also the default option meaning if you don't provide a layout, it will automatically pick this one. The second option is `code` which displays the table in a code block which appears in a more 'table-like' manner.
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addTable(
      ['User', 'Level', 'XP'],
        ['Noah', '5', '100'],
        ['Null', '3', '50'],
        ['Lucas', '7', '200']
      ],
      { layout: 'code' }
    )

await interaction.reply({ ...container.toMessagePayload() });
```


## 📑 Fields
This approximates embed-style fields. Components V2 has no real column/grid layout, so `inline` fields aren't rendered side-by-side like they are in embeds — instead, up to 3 consecutive `inline: true` fields are grouped onto a single line (mirroring how embeds wrap inline fields into rows of 3). Any field without `inline: true` always starts on its own line and takes the full width.
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addFields([
      { name: 'User', value: 'Noah', inline: true },
      { name: 'Level', value: '5', inline: true },
      { name: 'XP', value: '100', inline: true },
      { name: 'Notes', value: 'This one takes the full width since it\'s not inline.' }
    ])

await interaction.reply({ ...container.toMessagePayload() });
```
> If you only need to add a single field, `.addField()` is a shortcut that skips the array.
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addField('User', 'Noah', true)

await interaction.reply({ ...container.toMessagePayload() });
```
| Option | Default | Explanation |
| --- | --- | --- |
| name | — | The bold label for the field |
| value | — | The content shown underneath/beside the name |
| inline | false | Groups up to 3 consecutive inline fields onto one line, instead of giving the field its own full-width line |


## ℹ️ Info Helpers
While these are the same labels that `.setStatus()` uses, they work by allowing you to provide informational text. You can have icons and display as a quote, these are options that you don't have to provide if you don't want either/or both.
```js
const SilentContainer = require('silent-container');
const emojis = {
    approve: '<:enable:1456904915522814084>',
    deny: '<:disable:1456904913773924457>',
    info: '<:info:1509371643917500546>',
    warning: '<:warning:1509371530302197992>',
}

const container = new SilentContainer()
    .addSuccess('Successfully deployed.', { icon: undefined })
    .addInfo('Remember to save your work.', { icon: emojis.info, quote: true })
    .addWarning('Remember to save your work.', { quote: true })
    .addError('Remember to save your work.')

await interaction.reply({ ...container.toMessagePayload() });
```
| Option | Explanation |
| --- | --- |
| `icon: null` | This removes the icon altogether |
| `icon: undefined` | This falls back to the default icon |
| `icon: emojis.info` | This uses my defined info emoji |
| `quote: true` | Uses the quote style formatting |


## ➖ Separators
If you want to split up the text in the container with more visibility, you have two options!

**DIVIDER**
> If you want a thin grey line between the sections, this option would be more suitable to use!
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addText('Hi Noah!')
    .addDivider()
    .addText('Now theres a visible separator line between us...')

await interaction.reply({ ...container.toMessagePayload() });
```

**SPACER**
> If you dont want the grey line between the sections, this option would be more suitable to use!
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addText('Hi Noah!')
    .addSpacer()
    .addText('Now theres space, but no line between us...')

await interaction.reply({ ...container.toMessagePayload() });
```


## 🖼️ Media
Want to add images to your container? Just use this component, you can even add more than 1 image!
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addMedia([
      'https://cdn.discordapp.com/attachments/112',
      'https://cdn.discordapp.com/attachments/113',
      'https://cdn.discordapp.com/attachments/114',
    ])

await interaction.reply({ ...container.toMessagePayload() });
```


## 🧩 Sections
This component allows you to add thumbnails or buttons alongside the text, allowing text to be on the left with the accessory on the right.

**NO ACCESSORY**
> Sections usually require an accessory, which can be either a thumbnail or button. However, without one the text will default to a text component instead.
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addSection({ text: [ 'this is a section with no accessory', 'This newlines each section here' ] })

await interaction.reply({ ...container.toMessagePayload() });
```

**THUMBNAIL**
> This accessory requires the `AttachmentBuilder` import from discord, you also need to define the file so that it can utilise this for displaying the thumbnail.
```js
const SilentContainer = require('silent-container');
const { AttachmentBuilder } = require('discord.js');

const file = new AttachmentBuilder('./src/images/shark.png', { name: 'shark.png' });

const container = new SilentContainer()
    .addSection({ text: 'this is a section with a thumbnail', thumbnail: 'attachment://shark.png' })

await interaction.reply({ ...container.toMessagePayload(), files: [file] });
```

**REGULAR BUTTONS**
> Regular buttons have 4 styles, which can be set alongside the `customId` and the style determines the colour.
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addSection({ text: 'this is a section with a button', button: { label: 'Button', customId: 'noah_button', style: 3 } })

await interaction.reply({ ...container.toMessagePayload() });
```
| Option | Style | Colour |
| --- | --- | --- |
| 1 | Primary | Blurple |
| 2 | Secondary | Gray |
| 3 | Success | Green |
| 4 | Danger | Red |

**LINK BUTTONS**
> Link buttons only have 1 style, which is gray. Instead of `customId`, we use `url` so that the button can redirect us when we interact with it!
```js
const SilentContainer = require('silent-container');

const container = new SilentContainer()
    .addSection({ text: 'this is a section with a link button', button: { label: 'Link Button', url: 'https://gonoahwhere.com' } })

await interaction.reply({ ...container.toMessagePayload() });
```


## 📎 Files
This requires the `AttachmentBuilder` import from discord, you also need to define the file so that it can utilise this for displaying the file. You need `.addFile()` to add a file component to the container, and `.attachFile()` to attach the file defined to the container so that it can be sent inside the container.

**NO SPOILER**
> This will send the file as a visible downloadable (when clicked) file.
```js
const SilentContainer = require('silent-container');
const { AttachmentBuilder } = require('discord.js');

const buffer = fs.readFileSync('./src/commands/utility/test.js');

const container = new SilentContainer()
    .addFile('test.js')
    .attachFile(new AttachmentBuilder(buffer, { name: 'test2.js' }))

await interaction.reply({ ...container.toMessagePayload() });
```

**SPOILER**
> This will send the file the same way, except it will mark the file as a spoiler element which hides the content until uncovered.
```js
const SilentContainer = require('silent-container');
const { AttachmentBuilder } = require('discord.js');

const buffer = fs.readFileSync('./src/commands/utility/test.js');

const container = new SilentContainer()
    .addFile('test.js', true)
    .attachFile(new AttachmentBuilder(buffer, { name: 'test2.js' }))

await interaction.reply({ ...container.toMessagePayload() });
```


## 💻 Code Files
This component allows you to attach the file while also allowing for a preview of the file to be sent. The preview also accepts a language if you want to manually provide one - if you don't provide a language, it will automatically detect it from the file.

> This requires the `AttachmentBuilder` import from discord, you also need to define the file so that it can utilise this for displaying the file.
```js
const SilentContainer = require('silent-container');
const { AttachmentBuilder } = require('discord.js');

const buffer = fs.readFileSync('./src/commands/utility/test.js');

const container = new SilentContainer()
    .addFile('test.js', true)
    .addCodeFile(buffer, { name: 'index.js', attach: false, icon: '✏️' })

await interaction.reply({ ...container.toMessagePayload() });
```
| Option | Default Value | Explanation |
| --- | --- | --- |
| name | file.txt | The name of the file being shown |
| language | txt | The language to use in the preview, for syntax highlighting |
| showPreview | true | Shows a preview of the file chosen |
| icon | 📄 | Displays an icon of your choice, or the default icon |
| attach | true | Attaches the file which is downloadable |
