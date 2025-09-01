# Prettier Configuration

This project uses Prettier for consistent code formatting across the entire codebase.

## Configuration Files

- **`.prettierrc`** - Main Prettier configuration file
- **`.prettierignore`** - Files and directories to exclude from formatting
- **`.vscode/settings.json`** - VSCode settings for automatic formatting
- **`.vscode/extensions.json`** - Recommended VSCode extensions

## Configuration Details

Our Prettier setup includes:

- **Semi-colons**: Enabled (`;`)
- **Quotes**: Single quotes for strings, JSX attributes
- **Indentation**: 2 spaces (no tabs)
- **Trailing Commas**: ES5 compatible (objects, arrays)
- **Bracket Spacing**: Enabled (`{ foo }` not `{foo}`)
- **Arrow Parens**: Avoid when possible (`x => x` not `(x) => x`)
- **Print Width**: 80 characters
- **End of Line**: LF (Unix style)

## Scripts

```bash
# Format all files
npm run format

# Check formatting without changing files
npm run format:check

# Format and list changed files
npm run format:fix
```

## Editor Integration

### VSCode

The configuration automatically sets up:
- Format on save
- Format on paste
- ESLint integration
- Automatic import organization
- Consistent quote preferences

### Other Editors

Install the Prettier extension for your editor and it will automatically use the `.prettierrc` configuration.

## Initial Setup

To format the entire codebase for the first time:

```bash
npm run format
```

This will apply consistent formatting to all TypeScript, JavaScript, JSON, CSS, and other supported files.

## Benefits

- **Consistency**: All team members use the same formatting rules
- **Automation**: No need to manually format code
- **Integration**: Works seamlessly with ESLint
- **Productivity**: Eliminates formatting discussions in code reviews
- **Quality**: Reduces cognitive load when reading code

## File Types Supported

- TypeScript/JavaScript (`.ts`, `.tsx`, `.js`, `.jsx`)
- JSON files (`.json`)
- CSS/SCSS (`.css`, `.scss`)
- HTML (`.html`)
- Markdown (`.md`)

## Ignored Files

The following are automatically excluded from formatting:
- `node_modules/`
- `.next/`, `build/`, `dist/`
- Lock files (`package-lock.json`, `pnpm-lock.yaml`)
- Config files (when formatting would break functionality)
- Generated files and assets
