# How to Use the Validate Branch Extension

## Quick Start Guide

### 1. Install and Activate
- The extension activates automatically when VS Code starts
- You'll see a welcome message with options to configure settings or install git hooks

### 2. Basic Commands

#### Validate Current Branch
```
Ctrl+Shift+P → "Validate Branch: Validate Current Branch"
```
- Checks if your current branch name follows the configured convention
- Shows ✅ if valid or ❌ with examples if invalid

#### Create New Branch (with validation)
```
Ctrl+Shift+P → "Validate Branch: Create New Branch (with validation)"
```
- Prompts for branch name
- Validates against configured convention
- Creates and switches to branch if valid
- Shows error with examples if invalid

#### Create Commit (with validation)
```
Ctrl+Shift+P → "Validate Branch: Create Commit (with validation)"
```
- Prompts for commit message
- Validates against configured convention
- Creates commit if valid
- Shows error with examples if invalid

#### Install Git Hooks
```
Ctrl+Shift+P → "Validate Branch: Install Git Hooks"
```
- Installs pre-commit and commit-msg hooks
- Enforces validation even when using git directly from terminal

#### Open Settings
```
Ctrl+Shift+P → "Validate Branch: Open Settings"
```
- Opens VS Code settings filtered to extension options

### 3. Configuration

Go to VS Code Settings (`Ctrl+,`) and search for "validateBranch":

- **Branch Pattern**: Choose from gitflow, conventional, jira, simple, or custom
- **Commit Pattern**: Choose from conventional, angular, simple, or custom
- **Enable Branch Validation**: Toggle branch validation on/off
- **Enable Commit Validation**: Toggle commit validation on/off
- **Custom Patterns**: Define your own regex patterns

### 4. Example Workflows

#### Conventional Commits Workflow
1. Set `validateBranch.branchPattern` to "conventional"
2. Set `validateBranch.commitPattern` to "conventional"
3. Create branch: `feat/user-authentication`
4. Make changes and commit: `feat: add user login functionality`

#### GitFlow Workflow
1. Set `validateBranch.branchPattern` to "gitflow"
2. Create branches like: `feature/user-auth`, `bugfix/login-error`, `hotfix/security-fix`

#### JIRA Integration
1. Set `validateBranch.branchPattern` to "jira"
2. Create branches like: `feature/PROJ-123-user-login`

### 5. Error Examples

**Invalid Branch Name:**
```
❌ Branch name "my-feature" doesn't follow the conventional convention.

Examples:
feat/user-login
fix/button-styling
docs/readme-update
refactor/api-cleanup
```

**Invalid Commit Message:**
```
❌ Commit message doesn't follow the conventional convention.

Examples:
feat: add user authentication
fix: resolve login button issue
docs: update README with setup instructions
refactor(auth): simplify login logic
```

### 6. Git Hooks Integration

After installing git hooks, validation will work automatically:

```bash
# This will be validated automatically
git commit -m "invalid message"
# ❌ Invalid commit message format!

# This will work
git commit -m "feat: add new feature"
# ✅ Commit successful
```

### 7. Custom Patterns

You can define custom regex patterns for advanced use cases:

**Custom Branch Pattern Example:**
```regex
^(feature|bugfix|hotfix)\/[A-Z]+-\d+-.+$
```
Matches: `feature/PROJ-123-description`

**Custom Commit Pattern Example:**
```regex
^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}$
```
Matches: `feat(auth): add login` or `fix: resolve bug`

### 8. Troubleshooting

**Extension not working?**
- Make sure you're in a Git repository
- Check that workspace folder is properly opened
- Verify settings are configured correctly

**Git hooks not working?**
- Ensure `.git/hooks` directory has write permissions
- Check that hooks are executable
- Verify your shell supports the hook scripts

**Custom patterns not working?**
- Test your regex pattern online first
- Escape special characters properly
- Check VS Code developer console for errors