# Terminal Git Command Validation

This extension now validates git commands executed directly in the terminal! After installing git hooks, all terminal git operations will be automatically validated.

## How It Works

The extension installs three git hooks that intercept terminal commands:

1. **pre-commit** - Validates branch name before allowing commits
2. **commit-msg** - Validates commit message format
3. **post-checkout** - Warns about invalid branch names after checkout/creation

## Installation

1. Open VS Code in your git repository
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Run: `Validate Branch: Install Git Hooks`
4. ✅ Hooks are now installed and active!

## Terminal Command Examples

### ❌ Invalid Branch Creation
```bash
$ git checkout -b my-feature
❌ Branch name 'my-feature' doesn't follow the conventional convention.

Examples:
  feat/user-login
  fix/button-styling
  docs/readme-update
  refactor/api-cleanup

Current pattern: ^(feat|fix|docs|style|refactor|test|chore)/[a-z0-9-]+$

⚠️  Warning: Current branch name doesn't follow naming conventions.
💡 Consider renaming this branch or use 'Validate Branch: Create New Branch' in VS Code.
```

### ✅ Valid Branch Creation
```bash
$ git checkout -b feat/user-authentication
✅ Branch name follows conventional convention
```

### ❌ Invalid Commit Message
```bash
$ git commit -m "added new feature"
❌ Commit message doesn't follow the conventional convention.

Examples:
  feat: add user authentication
  fix: resolve login button issue
  docs: update README with setup instructions
  refactor(auth): simplify login logic

Current pattern: ^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?: .{1,50}

💡 Tip: Use 'Validate Branch: Create Commit' command in VS Code for guided commit creation.
```

### ✅ Valid Commit Message
```bash
$ git commit -m "feat: add user authentication system"
✅ Branch name validation passed
✅ Commit message validation passed
[feat/user-authentication 1a2b3c4] feat: add user authentication system
 1 file changed, 10 insertions(+)
```

## Supported Workflows

### 1. Feature Development Workflow
```bash
# Create feature branch
$ git checkout -b feat/user-login
✅ Branch name follows conventional convention

# Make changes
$ echo "new feature" > feature.txt
$ git add feature.txt

# Commit with proper message
$ git commit -m "feat: implement user login functionality"
✅ Branch name validation passed
✅ Commit message validation passed
```

### 2. Bug Fix Workflow
```bash
# Create bugfix branch
$ git checkout -b fix/login-error
✅ Branch name follows conventional convention

# Fix the bug
$ echo "bug fixed" > bugfix.txt
$ git add bugfix.txt

# Commit the fix
$ git commit -m "fix: resolve login button alignment issue"
✅ Branch name validation passed
✅ Commit message validation passed
```

### 3. Documentation Workflow
```bash
# Create documentation branch
$ git checkout -b docs/api-documentation
✅ Branch name follows conventional convention

# Update documentation
$ echo "# API Docs" > README.md
$ git add README.md

# Commit documentation
$ git commit -m "docs: add comprehensive API documentation"
✅ Branch name validation passed
✅ Commit message validation passed
```

## Convention Types

### Branch Naming Conventions

#### Conventional (Default)
- Pattern: `(feat|fix|docs|style|refactor|test|chore)/[a-z0-9-]+`
- Examples: `feat/user-login`, `fix/button-bug`, `docs/readme-update`

#### GitFlow
- Pattern: `(feature|bugfix|hotfix|release)/[a-z0-9-]+`
- Examples: `feature/user-auth`, `bugfix/login-error`, `hotfix/security-fix`

#### JIRA Integration
- Pattern: `(feature|bugfix|hotfix)/[A-Z]+-[0-9]+-.+`
- Examples: `feature/PROJ-123-user-login`, `bugfix/PROJ-456-fix-crash`

#### Simple
- Pattern: `[a-z0-9-]+`
- Examples: `user-authentication`, `fix-login-bug`, `update-docs`

### Commit Message Conventions

#### Conventional Commits (Default)
- Pattern: `(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?: .{1,50}`
- Examples:
  - `feat: add user authentication`
  - `fix(ui): resolve button styling issue`
  - `docs: update README with setup instructions`

#### Angular
- Pattern: `(build|ci|docs|feat|fix|perf|refactor|style|test)(\(.+\))?: .{1,50}`
- Examples:
  - `feat(auth): add login functionality`
  - `fix(ui): resolve alignment issue`
  - `test(auth): add unit tests`

#### Simple
- Pattern: `.{10,72}`
- Examples:
  - `Add user authentication feature`
  - `Fix login button styling issue`
  - `Update documentation with new API endpoints`

## Configuration

The hooks automatically read your VS Code settings from `.vscode/settings.json`:

```json
{
  "validateBranch.branchPattern": "conventional",
  "validateBranch.commitPattern": "conventional",
  "validateBranch.enableBranchValidation": true,
  "validateBranch.enableCommitValidation": true,
  "validateBranch.customBranchPattern": "",
  "validateBranch.customCommitPattern": ""
}
```

## Testing the Installation

### Test Branch Validation
```bash
# This should fail
$ git checkout -b invalid-branch-name

# This should succeed
$ git checkout -b feat/valid-branch-name
```

### Test Commit Validation
```bash
# Stage some changes first
$ echo "test" > test.txt
$ git add test.txt

# This should fail
$ git commit -m "invalid message"

# This should succeed
$ git commit -m "feat: add test functionality"
```

## Troubleshooting

### Hooks Not Working?
1. Check if hooks exist: `ls -la .git/hooks/`
2. Verify hooks are executable: `chmod +x .git/hooks/*`
3. Ensure you're in a git repository: `git status`

### Want to Temporarily Disable?
```bash
# Skip hooks for one commit
$ git commit -m "message" --no-verify

# Or rename hooks temporarily
$ mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
```

### Update Hook Configuration
After changing VS Code settings, reinstall hooks:
1. `Ctrl+Shift+P` → `Validate Branch: Install Git Hooks`
2. Hooks will be updated with new configuration

## Advanced Usage

### Custom Patterns
Set custom regex patterns in VS Code settings:

```json
{
  "validateBranch.branchPattern": "custom",
  "validateBranch.customBranchPattern": "^(epic|story|task)/[A-Z]+-\\d+-.+$",
  "validateBranch.commitPattern": "custom", 
  "validateBranch.customCommitPattern": "^(FEAT|FIX|DOCS): .{1,50}$"
}
```

### Team Setup
1. Commit `.vscode/settings.json` to your repository
2. Each team member installs the extension
3. Run `Validate Branch: Install Git Hooks` in each local repository
4. All team members now have consistent validation

## Benefits

✅ **Consistent Naming**: Enforces team-wide naming conventions
✅ **Automatic Validation**: Works with any git client or terminal
✅ **Immediate Feedback**: Shows helpful examples when validation fails
✅ **Configurable**: Supports multiple conventions and custom patterns
✅ **Non-Intrusive**: Only validates, doesn't change your workflow
✅ **Team-Friendly**: Easy to set up across entire development teams