const { MessageFlags, AttachmentBuilder } = require('discord.js');

class SilentContainer {
    constructor() {
        this.type = 17;
        this.accent_color = null;
        this.spoiler = false;
        this.components = [];
        this._files = [];
        this._allowedMentions = { parse: [] };
    }

    // Text Component
    addText(content) {
        if (content.length > 4000) {
            throw new Error(`Text exceeds the maximum length of 4000 characters.`)
        }

        this.components.push({
            type: 10,
            content,
        });
        return this;
    }

    // Colour bar along the side
    setColor(color) {
        if (typeof color === 'number') {
            this.accent_color = color;
            return this;
        }

        if (typeof color === 'string') {
            const colors = {
                red: 0xff0000,
                green: 0x00ff00,
                blue: 0x0000ff,
                yellow: 0xffff00,
                orange: 0xffa500,
                purple: 0x800080,
                pink: 0xffc0cb,
                white: 0xffffff,
                black: 0x000000,
                gray: 0x808080,
                grey: 0x808080,
            };

            const lower = color.toLowerCase();

            if (lower in colors) {
                this.accent_color = colors[lower];
                return this;
            }

            if (/^#[0-9a-f]{6}$/i.test(color)) {
                this.accent_color = parseInt(color.slice(1), 16);
                return this;
            }

            if (/^[0-9a-f]{6}$/i.test(color)) {
                this.accent_color = parseInt(color, 16);
                return this;
            }

            throw new Error(`Invalid colour format: ${color}. Expected a number, hex string or colour name.`);
        }
    }

    // Divider Components
    addSeparator(divider = true, spacing = 1) {
        this.components.push({
            type: 14,
            divider,
            spacing,
        });
        return this;
    }

    addDivider() {
        return this.addSeparator(true);
    }

    addSpacer() {
        return this.addSeparator(false);
    }

    // Media Component
    addMedia(urls) {
        const items = urls.map(item =>
            typeof item === 'string'
                ? { media: { url: item } }
                : { media: { url: item.url }, description: item.description, spoiler: item.spoiler }
        );
        this.components.push({ type: 12, items });
        return this;
    }

    // File Components
    addFile(filename, spoiler = false) {
        this.components.push({
            type: 13,
            file: {
                url: `attachment://${filename}`,
            },
            spoiler,
        });

        return this;
    }

    attachFile(attachmentBuilder) {
        this._files.push(attachmentBuilder);
        return this;
    }

    // Code File Components
    addCodeFile(buffer, options = {}) {
        const {
            name = 'file.txt',
            language,
            showPreview = true,
            icon = '📄',
            attach = true,
        } = options;

        const ext = name.split('.').pop()?.toLowerCase();
        const languageMap = {
            js: 'js',
            jsx: 'jsx',
            ts: 'ts',
            tsx: 'tsx',

            py: 'python',
            rb: 'ruby',
            php: 'php',
            java: 'java',
            cs: 'csharp',
            go: 'go',
            rs: 'rust',
            kt: 'kotlin',
            swift: 'swift',

            html: 'html',
            css: 'css',
            scss: 'scss',
            sass: 'sass',
            less: 'less',

            json: 'json',
            xml: 'xml',
            csv: 'csv',
            sql: 'sql',

            md: 'md',
            txt: '',

            yml: 'yaml',
            yaml: 'yaml',
            toml: 'toml',
            ini: 'ini',
            env: '',

            sh: 'bash',
            bash: 'bash',
            zsh: 'bash',

            dockerfile: 'dockerfile',
            makefile: 'makefile',

            graphql: 'graphql',
            gql: 'graphql',
            prisma: 'prisma',
        };

        const nameOverrides = {
            Dockerfile: 'dockerfile',
            Makefile: 'makefile',
            '.env': '',
        };
        
        const finalLanguage = language || nameOverrides[name] || languageMap[ext] || '';
        
        // Header
        this.addText(`${icon} **${name}**`);

        // Preview (optional)
        if (showPreview) {
            const content = buffer?.toString?.() ?? String(buffer)
            this.addLongCodeBlock(content, finalLanguage);
        }

        // Attach file (real download)
        if (attach) {
            this.addFile(name);

            this.attachFile(
                new AttachmentBuilder(buffer, { name })
            );
        }

        return this
    }

    // Section Components
    addSection(textContents, accessory) {
        // Support object syntax
        if (
            typeof textContents === 'object' &&
            textContents !== null &&
            !Array.isArray(textContents)
        ) {
            if (textContents.thumbnail) {
                accessory = SilentContainer.thumbnail(
                    textContents.thumbnail,
                    textContents.description
                );
            } else if (textContents.button) {
                const { label, customId, url, style = 1 } = textContents.button;
                accessory = url
                    ? SilentContainer.linkButton(label, url)
                    : SilentContainer.button(label, customId, style);
            }

            textContents = textContents.text;
        }

        const texts = Array.isArray(textContents)
            ? textContents
            : [textContents];

        if (!accessory) {
            texts.forEach(content => this.addText(content));
            return this;
        }

        this.components.push({
            type: 9,
            components: texts.map(content => ({
                type: 10,
                content,
            })),
            accessory,
        });

        return this;
    }

    // Thumbnail Component
    static thumbnail(url, description) {
        return { type: 11, media: { url, }, description, };
    }

    // Button Components
    addActionRow(buttons) {
        this.components.push({
            type: 1,
            components: buttons,
        });
        return this;
    }

    static linkButton(label, url) {
        return { type: 2, style: 5, label, url };
    }

    static button(label, customId, style = 1, options = {}) {
        return {
            type: 2,
            style,
            label,
            custom_id: customId,
            emoji: options.emoji,
            disabled: options.disabled,
        };
    }
    
    // Split long text into multiple text components, each under the maxChunk limit
    addLongText(content, maxChunk = 1900) {
        while (content.length > maxChunk) {
            let split = content.lastIndexOf(' ', maxChunk);
            if (split === -1) split = maxChunk;

            this.addText(content.slice(0, split));
            content = content.slice(split).trimStart();
        }

        if (content.length) {
            this.addText(content);
        }

        return this;
    }

    // Status Components
    static Colours = {
        SUCCESS: 0x57F287,
        ERROR: 0xED4245,
        WARNING: 0xFEE75C,
        INFO: 0x5865F2,
    }

    setStatus(status) {
        this.accent_color = SilentContainer.Colours[status.toUpperCase()];
        return this;
    }

    // Heading Components
    addHeading(content, level = 3) {
        level = Math.max(1, Math.min(3, level));
        return this.addText(`${'#'.repeat(level)} ${content}`);
    }

    // Quote Components
    addQuote(content) {
        return this.addText(`> ${content}`);
    }
    
    // Code Block Components
    addCode(content) {
        return this.addText(`\`${content}\``)
    }

    addCodeBlock(content, language = '') {
        return this.addText(`\`\`\`${language}\n${content}\n\`\`\``);
    }

    addLongCodeBlock(content, language = '', maxChunk = 1900) {
        const fenceOverhead = language.length + 8;
        const chunkSize = maxChunk - fenceOverhead;

        while (content.length > chunkSize) {
            let split = content.lastIndexOf('\n', chunkSize);
            if (split === -1) split = chunkSize;

            this.addCodeBlock(content.slice(0, split), language);
            content = content.slice(split).replace(/^\n/, '');
        }

        if (content.length) {
            this.addCodeBlock(content, language);
        }

        return this;
    }

    // List Components
    addBulletList(items) {
        return this.addText(items.map(item => `- ${item}`).join('\n'));
    }

    addNumberedList(items) {
        return this.addText(items.map((item, index) => `${index + 1}. ${item}`).join('\n'));
    }

    addChecklist(items, {
        checked = '✅',
        unchecked = '⬜',
    } = {}) {
        return this.addText(
            items
                .map(item => `${item.checked ? checked : unchecked} ${item.text}`)
                .join('\n')
        );
    }

    // Table Components
    addTable(headers, rows, options = {}) {
        const layout = options.layout || 'inline';

        // INLINE LAYOUT (Discord-native look)
        if (layout === 'inline') {
            const formatted = rows.map(row =>
                headers.map((h, i) =>
                    `**${h}:** ${row[i]}`
                ).join('\n')
            ).join('\n\n');

            return this.addText(formatted);
        }

        // CODE LAYOUT (monospace table)
        const widths = headers.map((h, i) =>
            Math.max(h.length, ...rows.map(r => String(r[i]).length))
        );

        const pad = (str, width) => String(str).padEnd(width);

        const lines = [
            headers.map((h, i) => pad(h, widths[i])).join(' | '),
            widths.map(w => '-'.repeat(w)).join('-|-'),
            ...rows.map(r =>
                r.map((c, i) => pad(c, widths[i])).join(' | ')
            ),
        ];

        return this.addCodeBlock(lines.join('\n'));
    }

    // Field Components (approximates embed addFields — no real column layout in Components V2)
    addFields(fields) {
        if (!Array.isArray(fields)) fields = [fields];

        let i = 0;
        while (i < fields.length) {
            const field = fields[i];

            if (field.inline) {
                const group = [];
                while (i < fields.length && fields[i].inline && group.length < 3) {
                    group.push(fields[i]);
                    i++;
                }

                const line = group
                    .map(f => `**${f.name}:** ${f.value}`)
                    .join('\u2003\u2003\u2003');
                this.addText(line);
            } else {
                this.addText(`**${field.name}**\n${field.value}`);
                i++;
            }
        }

        return this;
    }

    addField(name, value, inline = false) {
        return this.addFields([{ name, value, inline }]);
    }

    // Info Helpers
    addInfo(content, options = {}) {
        return this._formatMessage(content, 'ℹ️', options);
    }

    addSuccess(content, options = {}) {
        return this._formatMessage(content, '✅', options);
    }

    addWarning(content, options = {}) {
        return this._formatMessage(content, '⚠️', options);
    }

    addError(content, options = {}) {
        return this._formatMessage(content, '❌', options);
    }

    // Formats the Info Helpers
    _formatMessage(content, defaultIcon, options = {}) {
        const isQuote = options.quote === true;

        let finalIcon;
        if (!('icon' in options) || options.icon === undefined) {
            finalIcon = defaultIcon;
        } else if (options.icon === null) {
            finalIcon = '';
        } else {
            finalIcon = options.icon;
        }

        const prefix = finalIcon ? `${finalIcon} ` : '';
        let text;

        if (isQuote) {
            text = `> *${prefix}${content}*`;
        } else {
            text = `${prefix}${content}`;
        }

        return this.addText(text);
    }

    // Client size validation, before sending
    validate() {
        const errors = [];
        const countComponents = (components) => components.reduce((sum, c) => sum + 1 + (c.components ? countComponents(c.components) : 0), 0);

        const totalComponents = countComponents(this.components);
        if (totalComponents > 40) {
            errors.push(`Too many components: ${totalComponents}. Maximum allowed is 40.`);
        }

        const totalTextLength = JSON.stringify(this.components)
            .match(/"content":"(.*?)"/g)
            ?.reduce((sum, m) => sum + m.length - 11, 0) || 0;
        
        if (totalTextLength > 4000) {
            errors.push(`Total text length exceeds 4000 characters: ${totalTextLength}.`);
        }

        if (errors.length > 0) throw new Error(`SilentContainer validation failed:\n${errors.join('\n')}`);
        return true;
    }

    // Returns payload
    toMessagePayload() {
        this.validate();
        return {
            flags: MessageFlags.IsComponentsV2,
            components: [
                {
                    type: this.type,
                    accent_color: this.accent_color,
                    spoiler: this.spoiler,
                    components: this.components,
                },
            ],
            files: this._files,
            allowedMentions: this._allowedMentions,
        };
    }
}

module.exports = SilentContainer;
