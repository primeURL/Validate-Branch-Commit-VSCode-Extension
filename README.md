# Validate Branch - VS Code Extension

A powerful VS Code extension that enforces branch naming and commit message conventions to maintain consistent Git workflow standards across your projects.

## Features

- ✅ **Branch Name Validation**: Enforce consistent branch naming conventions
- ✅ **Commit Message Validation**: Ensure commit messages follow established patterns
- ✅ **Multiple Convention Support**: GitFlow, Conventional Commits, JIRA, Angular, and custom patterns
- ✅ **Git Hooks Integration**: Automatically install git hooks for repository-level enforcement
- ✅ **Real-time Feedback**: Get immediate feedback with helpful examples when validation fails
- ✅ **Configurable Settings**: Customize patterns and enable/disable features as needed

## Supported Conventions

### Branch Naming Conventions

1. **GitFlow** (feature/*, bugfix/*, hotfix/*, release/*)
   - `feature/user-authentication`
   - `bugfix/login-error`
   - `hotfix/security-patch`
   - `release/v1.2.0`

2. **Conventional** (feat/*, fix/*, docs/*, style/*, refactor/*, test/*, chore/*)
   - `feat/user-login`
   - `fix/button-styling`
   - `docs/readme-update`
   - `refactor/api-cleanup`

3. **JIRA** (feature/PROJ-123-*, bugfix/PROJ-456-*, hotfix/PROJ-789-*)
   - `feature/PROJ-123-user-login`
   - `bugfix/PROJ-456-fix-crash`
   - `hotfix/PROJ-789-security-fix`

4. **Simple** (lowercase with hyphens)
   - `user-authentication`
   - `fix-login-bug`
   - `update-documentation`

5. **Custom** (define your own regex pattern)

### Commit Message Conventions

1. **Conventional Commits**
   - `feat: add user authentication`
   - `fix: resolve login button issue`
   - `docs: update README with setup instructions`
   - `refactor(auth): simplify login logic`

2. **Angular**
   - `feat(auth): add user login functionality`
   - `fix(ui): resolve button alignment issue`
   - `docs: update contributing guidelines`
   - `test(auth): add login unit tests`

3. **Simple** (10-72 characters)
   - `Add user authentication feature`
   - `Fix login button styling issue`
   - `Update documentation with new API`

4. **Custom** (define your own regex pattern)

## Commands

Access these commands via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- **Validate Branch: Validate Current Branch** - Check if the current branch follows naming conventions
- **Validate Branch: Create New Branch (with validation)** - Create a new branch with validation
- **Validate Branch: Create Commit (with validation)** - Create a commit with message validation
- **Validate Branch: Install Git Hooks** - Install git hooks for automatic validation
- **Validate Branch: Open Settings** - Open extension settings

## Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Validate Branch"
4. Click Install

## Configuration

Configure the extension through VS Code settings (`File > Preferences > Settings` or `Ctrl+,`):

### Settings

- **validateBranch.branchPattern**: Choose branch naming convention
  - Options: `gitflow`, `conventional`, `jira`, `simple`, `custom`
  - Default: `conventional`

- **validateBranch.commitPattern**: Choose commit message convention
  - Options: `conventional`, `angular`, `simple`, `custom`
  - Default: `conventional`

- **validateBranch.enableBranchValidation**: Enable/disable branch validation
  - Default: `true`

- **validateBranch.enableCommitValidation**: Enable/disable commit validation
  - Default: `true`

- **validateBranch.customBranchPattern**: Custom regex for branch names
  - Used when `branchPattern` is set to `custom`

- **validateBranch.customCommitPattern**: Custom regex for commit messages
  - Used when `commitPattern` is set to `custom`

### Example Settings Configuration

```json
{
  "validateBranch.branchPattern": "conventional",
  "validateBranch.commitPattern": "conventional",
  "validateBranch.enableBranchValidation": true,
  "validateBranch.enableCommitValidation": true,
  "validateBranch.customBranchPattern": "^(feature|bugfix|hotfix)\\/[a-z0-9-]+$",
  "validateBranch.customCommitPattern": "^(feat|fix|docs|style|refactor|test|chore): .{1,50}$"
}
```

## Git Hooks Integration

The extension can install git hooks to enforce validation at the repository level:

1. Run the command **Validate Branch: Install Git Hooks**
2. The extension will create `pre-commit` and `commit-msg` hooks in your `.git/hooks` directory
3. These hooks will automatically validate commits even when using git directly from the command line

## Usage Examples

### Creating a New Branch

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Validate Branch: Create New Branch"
3. Enter branch name (e.g., `feat/user-authentication`)
4. If valid, the branch will be created and checked out
5. If invalid, you'll see an error with examples of valid names

### Validating Current Branch

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Validate Branch: Validate Current Branch"
3. See if your current branch follows the configured convention

### Creating a Commit

1. Stage your changes (`git add .`)
2. Open Command Palette (`Ctrl+Shift+P`)
3. Type "Validate Branch: Create Commit"
4. Enter commit message (e.g., `feat: add user login functionality`)
5. If valid, the commit will be created
6. If invalid, you'll see an error with examples of valid messages

## Error Messages

When validation fails, you'll see helpful error messages with examples:

```
❌ Branch name "my-feature" doesn't follow the conventional convention.

Examples:
feat/user-login
fix/button-styling
docs/readme-update
refactor/api-cleanup
```

```
❌ Commit message doesn't follow the conventional convention.

Examples:
feat: add user authentication
fix: resolve login button issue
docs: update README with setup instructions
refactor(auth): simplify login logic
```

## Custom Patterns

You can define custom regex patterns for both branch names and commit messages:

### Custom Branch Pattern Example
```regex
^(feature|bugfix|hotfix)\/[A-Z]+-\d+-.+$
```
This pattern enforces: `feature/PROJ-123-description`

### Custom Commit Pattern Example
```regex
^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}$
```
This pattern enforces conventional commits with optional scope.

## Troubleshooting

### Extension Not Working
- Ensure you're in a Git repository
- Check that the workspace folder is properly opened
- Verify extension settings are configured correctly

### Git Hooks Not Working
- Make sure you have write permissions to the `.git/hooks` directory
- Verify that the hooks are executable (`chmod +x .git/hooks/pre-commit`)
- Check that your shell supports the hook scripts

### Custom Patterns Not Working
- Validate your regex pattern using an online regex tester
- Ensure special characters are properly escaped
- Check the VS Code developer console for error messages

## Contributing

1. Fork the repository
2. Create a feature branch (`feat/new-feature`)
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### 0.0.1
- Initial release
- Branch name validation
- Commit message validation
- Multiple convention support
- Git hooks integration
- Configurable settings