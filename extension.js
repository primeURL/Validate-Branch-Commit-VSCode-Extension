// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Global reference to status bar item for cleanup
let globalStatusBarItem = null;

// Branch naming conventions - New JIRA style only
const BRANCH_PATTERNS = {
    jira: /^(feature|bugfix|hotfix|release|chore)\/[A-Z]+-[0-9]+-[a-z0-9-]+$/
};

// Commit message patterns - New JIRA style only
const COMMIT_PATTERNS = {
    jira: /^\[[A-Z]+-[0-9]+\] (feat|fix|docs|style|refactor|test|chore)\([a-z0-9-]+\): .{1,80}$/
};

/**
 * Get the current workspace folder path
 */
function getWorkspacePath() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return null;
    }
    return workspaceFolders[0].uri.fsPath;
}

/**
 * Execute git command
 */
function executeGitCommand(command, workspacePath) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: workspacePath }, (error, stdout) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

/**
 * Get extension configuration
 */
function getConfig() {
    const config = vscode.workspace.getConfiguration('validateBranch');
    return {
        branchPattern: config.get('branchPattern', 'jira'),
        commitPattern: config.get('commitPattern', 'jira'),
        enableBranchValidation: config.get('enableBranchValidation', true),
        enableCommitValidation: config.get('enableCommitValidation', true),
        customBranchPattern: config.get('customBranchPattern', ''),
        customCommitPattern: config.get('customCommitPattern', '')
    };
}

/**
 * Get current extension configuration for hooks
 */
function getHookConfig(workspacePath) {
    try {
        const configPath = path.join(workspacePath, '.vscode', 'settings.json');
        let config = {
            branchPattern: 'jira',
            commitPattern: 'jira',
            enableBranchValidation: true,
            enableCommitValidation: true,
            customBranchPattern: '',
            customCommitPattern: ''
        };
        
        if (fs.existsSync(configPath)) {
            const settings = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config.branchPattern = settings['validateBranch.branchPattern'] || config.branchPattern;
            config.commitPattern = settings['validateBranch.commitPattern'] || config.commitPattern;
            config.enableBranchValidation = settings['validateBranch.enableBranchValidation'] !== false;
            config.enableCommitValidation = settings['validateBranch.enableCommitValidation'] !== false;
            config.customBranchPattern = settings['validateBranch.customBranchPattern'] || '';
            config.customCommitPattern = settings['validateBranch.customCommitPattern'] || '';
        }
        
        return config;
    } catch {
        return {
            branchPattern: 'jira',
            commitPattern: 'jira',
            enableBranchValidation: true,
            enableCommitValidation: true,
            customBranchPattern: '',
            customCommitPattern: ''
        };
    }
}

/**
 * Generate branch validation script
 */
function generateBranchValidationScript(config) {
    const patterns = {
        jira: '^(feature|bugfix|hotfix|release|chore)/[A-Z]+-[0-9]+-[a-z0-9-]+$'
    };
    
    const pattern = config.branchPattern === 'custom' && config.customBranchPattern 
        ? config.customBranchPattern 
        : patterns[config.branchPattern] || patterns.jira;
    
    const examples = {
        jira: ['feature/APC-2876-user-auth', 'bugfix/APC-1234-login-fix', 'hotfix/APC-5678-security-patch', 'release/APC-9999-v2-release', 'chore/APC-1111-update-deps']
    };
    
    const exampleList = config.branchPattern === 'custom' 
        ? ['custom-pattern-example'] 
        : examples[config.branchPattern] || examples.jira;
    
    return `
validate_branch_name() {
    local branch_name="$1"
    local pattern="${pattern}"
    
    if ! echo "$branch_name" | grep -qE "$pattern"; then
        echo "❌ Branch name '$branch_name' doesn't follow the ${config.branchPattern} convention."
        echo ""
        echo "Examples:"
        ${exampleList.map(ex => `echo "  ${ex}"`).join('\n        ')}
        echo ""
        echo "Current pattern: $pattern"
        return 1
    fi
    return 0
}`;
}

/**
 * Generate commit validation script
 */
function generateCommitValidationScript(config) {
    const patterns = {
        jira: '^\\[[A-Z]+-[0-9]+\\] (feat|fix|docs|style|refactor|test|chore)\\([a-z0-9-]+\\): .{1,80}$'
    };
    
    const pattern = config.commitPattern === 'custom' && config.customCommitPattern 
        ? config.customCommitPattern 
        : patterns[config.commitPattern] || patterns.jira;
    
    const examples = {
        jira: ['[APC-2356] feat(auth): Add Login Functionality', '[APC-1234] fix(ui): Resolve button alignment issue', '[APC-5678] docs(readme): Update installation guide', '[APC-9999] refactor(api): Simplify user service']
    };
    
    const exampleList = config.commitPattern === 'custom' 
        ? ['custom-pattern-example'] 
        : examples[config.commitPattern] || examples.jira;
    
    return `
validate_commit_message() {
    local commit_message="$1"
    local pattern="${pattern}"
    
    if ! echo "$commit_message" | grep -qE "$pattern"; then
        echo "❌ Commit message doesn't follow the ${config.commitPattern} convention."
        echo ""
        echo "Examples:"
        ${exampleList.map(ex => `echo "  ${ex}"`).join('\n        ')}
        echo ""
        echo "Current pattern: $pattern"
        return 1
    fi
    return 0
}`;
}

/**
 * Validate branch name
 */
function validateBranchName(branchName, pattern) {
    const config = getConfig();
    let regex;
    
    if (pattern === 'custom' && config.customBranchPattern) {
        try {
            regex = new RegExp(config.customBranchPattern);
        } catch {
            vscode.window.showErrorMessage('Invalid custom branch pattern in settings');
            return false;
        }
    } else {
        regex = BRANCH_PATTERNS[pattern];
    }
    
    if (!regex) {
        return false;
    }
    
    return regex.test(branchName);
}

/**
 * Validate commit message
 */
function validateCommitMessage(message, pattern) {
    const config = getConfig();
    let regex;
    
    if (pattern === 'custom' && config.customCommitPattern) {
        try {
            regex = new RegExp(config.customCommitPattern);
        } catch {
            vscode.window.showErrorMessage('Invalid custom commit pattern in settings');
            return false;
        }
    } else {
        regex = COMMIT_PATTERNS[pattern];
    }
    
    if (!regex) {
        return false;
    }
    
    return regex.test(message);
}

/**
 * Get branch naming convention examples
 */
function getBranchExamples(pattern) {
    const examples = {
        jira: [
            'feature/APC-2876-user-auth',
            'bugfix/APC-1234-login-fix',
            'hotfix/APC-5678-security-patch',
            'release/APC-9999-v2-release',
            'chore/APC-1111-update-deps'
        ]
    };
    return examples[pattern] || examples.jira;
}

/**
 * Get commit message examples
 */
function getCommitExamples(pattern) {
    const examples = {
        jira: [
            '[APC-2356] feat(auth): Add Login Functionality',
            '[APC-1234] fix(ui): Resolve button alignment issue',
            '[APC-5678] docs(readme): Update installation guide',
            '[APC-9999] refactor(api): Simplify user service'
        ]
    };
    return examples[pattern] || examples.jira;
}

/**
 * Show validation error with examples
 */
function showBranchValidationError(branchName, pattern) {
    const examples = getBranchExamples(pattern);
    const exampleText = examples.length > 0 ? `\n\nExamples:\n${examples.join('\n')}` : '';
    
    vscode.window.showErrorMessage(
        `❌ Branch name "${branchName}" doesn't follow the ${pattern} convention.${exampleText}`,
        'Open Settings'
    ).then(selection => {
        if (selection === 'Open Settings') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'validateBranch');
        }
    });
}

/**
 * Show commit validation error with examples
 */
function showCommitValidationError(message, pattern) {
    const examples = getCommitExamples(pattern);
    const exampleText = examples.length > 0 ? `\n\nExamples:\n${examples.join('\n')}` : '';
    
    vscode.window.showErrorMessage(
        `❌ Commit message doesn't follow the ${pattern} convention.${exampleText}`,
        'Open Settings'
    ).then(selection => {
        if (selection === 'Open Settings') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'validateBranch');
        }
    });
}

/**
 * Remove git hooks installed by this extension
 */
function removeGitHooks(workspacePath) {
    const hooksDir = path.join(workspacePath, '.git', 'hooks');
    const preCommitHook = path.join(hooksDir, 'pre-commit');
    const commitMsgHook = path.join(hooksDir, 'commit-msg');
    const postCheckoutHook = path.join(hooksDir, 'post-checkout');
    const prePushHook = path.join(hooksDir, 'pre-push');
    
    try {
        // Check if hooks exist and contain our extension signature before removing
        const extensionSignature = '# VS Code Validate Branch Extension';
        
        [preCommitHook, commitMsgHook, postCheckoutHook, prePushHook].forEach(hookPath => {
            if (fs.existsSync(hookPath)) {
                try {
                    const content = fs.readFileSync(hookPath, 'utf8');
                    if (content.includes(extensionSignature)) {
                        fs.unlinkSync(hookPath);
                        console.log(`Removed git hook: ${path.basename(hookPath)}`);
                    }
                } catch (error) {
                    console.error(`Failed to remove hook ${hookPath}:`, error.message);
                }
            }
        });
        
        console.log('Git hooks cleanup completed');
    } catch (error) {
        console.error('Failed to remove git hooks:', error.message);
    }
}

/**
 * Install git hooks that validate terminal commands
 */
function installGitHooks(workspacePath) {
    const hooksDir = path.join(workspacePath, '.git', 'hooks');
    const preCommitHook = path.join(hooksDir, 'pre-commit');
    const commitMsgHook = path.join(hooksDir, 'commit-msg');
    const postCheckoutHook = path.join(hooksDir, 'post-checkout');
    const prePushHook = path.join(hooksDir, 'pre-push');
    
    const config = getHookConfig(workspacePath);
    
    // Pre-commit hook - validates branch name before commit
    const preCommitContent = `#!/bin/sh
# VS Code Validate Branch Extension - Pre-commit hook
# This hook validates the current branch name before allowing commits

${config.enableBranchValidation ? generateBranchValidationScript(config) : ''}

if [ "${config.enableBranchValidation}" = "true" ]; then
    current_branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
    
    if [ -n "$current_branch" ] && [ "$current_branch" != "HEAD" ]; then
        if ! validate_branch_name "$current_branch"; then
            echo ""
            echo "💡 Tip: Use 'Validate Branch: Create New Branch' command in VS Code for guided branch creation."
            echo "💡 Or rename this branch: git branch -m <new-valid-name>"
            exit 1
        fi
    fi
fi

echo "✅ Branch name validation passed"
`;

    // Commit message hook - validates commit message format
    const commitMsgContent = `#!/bin/sh
# VS Code Validate Branch Extension - Commit message hook
# This hook validates commit messages

${config.enableCommitValidation ? generateCommitValidationScript(config) : ''}

if [ "${config.enableCommitValidation}" = "true" ]; then
    commit_message=$(cat "$1")
    
    if ! validate_commit_message "$commit_message"; then
        echo ""
        echo "💡 Tip: Use 'Validate Branch: Create Commit' command in VS Code for guided commit creation."
        exit 1
    fi
fi

echo "✅ Commit message validation passed"
`;

    // Pre-push hook - validates branch name before pushing
    const prePushContent = `#!/bin/sh
# VS Code Validate Branch Extension - Pre-push hook
# This hook validates branch names before they are pushed to remote

${config.enableBranchValidation ? generateBranchValidationScript(config) : ''}

if [ "${config.enableBranchValidation}" = "true" ]; then
    # Read from stdin: local_ref local_sha remote_ref remote_sha
    while read local_ref local_sha remote_ref remote_sha; do
        # Extract branch name from ref
        if [ "$local_ref" != "(delete)" ]; then
            branch_name=$(echo "$local_ref" | sed 's/refs\/heads\///')
            
            if [ -n "$branch_name" ]; then
                if ! validate_branch_name "$branch_name"; then
                    echo ""
                    echo "💡 Tip: Rename your branch before pushing: git branch -m <new-valid-name>"
                    echo "💡 Or use 'Validate Branch: Create New Branch' command in VS Code for guided branch creation."
                    exit 1
                fi
            fi
        fi
    done
fi

echo "✅ Branch name validation passed for push"
`;

    // Post-checkout hook - warns about invalid branch names after checkout/creation
    const postCheckoutContent = `#!/bin/sh
# VS Code Validate Branch Extension - Post-checkout hook
# This hook warns about invalid branch names after checkout or branch creation

${config.enableBranchValidation ? generateBranchValidationScript(config) : ''}

# Arguments: previous_head new_head branch_flag
previous_head=$1
new_head=$2
branch_flag=$3

# Only validate if this is a branch checkout (branch_flag = 1)
if [ "$branch_flag" = "1" ] && [ "${config.enableBranchValidation}" = "true" ]; then
    current_branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
    
    if [ -n "$current_branch" ] && [ "$current_branch" != "HEAD" ]; then
        if ! validate_branch_name "$current_branch"; then
            echo ""
            echo "⚠️  WARNING: Branch name '$current_branch' doesn't follow naming conventions!"
            echo "💡 This branch will be blocked from commits and pushes until renamed."
            echo "💡 To rename: git branch -m <new-valid-name>"
            echo "💡 Or use 'Validate Branch: Create New Branch' command in VS Code for guided branch creation."
            echo ""
        else
            echo "✅ Branch name follows ${config.branchPattern} convention"
        fi
    fi
fi
`;
    
    try {
        if (!fs.existsSync(hooksDir)) {
            fs.mkdirSync(hooksDir, { recursive: true });
        }
        
        // Write hooks with executable permissions
        fs.writeFileSync(preCommitHook, preCommitContent, { mode: 0o755 });
        fs.writeFileSync(commitMsgHook, commitMsgContent, { mode: 0o755 });
        fs.writeFileSync(postCheckoutHook, postCheckoutContent, { mode: 0o755 });
        fs.writeFileSync(prePushHook, prePushContent, { mode: 0o755 });
        
        vscode.window.showInformationMessage(
            '✅ Git hooks installed successfully! Terminal git commands will now be validated.',
            'Test Branch Creation',
            'Test Commit'
        ).then(selection => {
            if (selection === 'Test Branch Creation') {
                vscode.window.showInformationMessage(
                    'Try: git checkout -b Hello\nYou\'ll see a warning, and commits/pushes will be blocked until renamed.'
                );
            } else if (selection === 'Test Commit') {
                vscode.window.showInformationMessage(
                    'Try: git commit -m "invalid message"\nThen: git commit -m "[APC-2356] feat(auth): Add Login Functionality"'
                );
            }
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to install git hooks: ${error.message}`);
    }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Validate Branch extension is now active!');
    
    // Create status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'validate-branch.openSettings';
    
    // Store global reference for cleanup
    globalStatusBarItem = statusBarItem;
    
    // Function to update status bar
    function updateStatusBar() {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) {
            statusBarItem.text = "$(warning) VB: No Workspace";
            statusBarItem.tooltip = "No workspace folder found";
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        } else {
            // Check if git hooks are installed
            const hooksDir = path.join(workspacePath, '.git', 'hooks');
            const preCommitHook = path.join(hooksDir, 'pre-commit');
            const extensionSignature = '# VS Code Validate Branch Extension';
            
            let hooksInstalled = false;
            if (fs.existsSync(preCommitHook)) {
                try {
                    const content = fs.readFileSync(preCommitHook, 'utf8');
                    hooksInstalled = content.includes(extensionSignature);
                } catch (error) {
                    // Ignore error, hooks not installed
                }
            }
            
            if (hooksInstalled) {
                statusBarItem.text = "$(check-all) VB: Active";
                statusBarItem.tooltip = "Git hooks installed - Branch and commit validation active\nClick to open settings";
                statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
            } else {
                statusBarItem.text = "$(circle-outline) VB: Ready";
                statusBarItem.tooltip = "Extension loaded - Click to install git hooks or open settings";
                statusBarItem.backgroundColor = undefined;
            }
        }
        statusBarItem.show();
    }
    
    // Initial status bar update
    updateStatusBar();
    
    // Update status bar when workspace folders change
    const workspaceWatcher = vscode.workspace.onDidChangeWorkspaceFolders(() => {
        updateStatusBar();
    });
    
    context.subscriptions.push(statusBarItem, workspaceWatcher);
    
    // Register command to validate current branch
    const validateCurrentBranch = vscode.commands.registerCommand('validate-branch.validateCurrentBranch', async function () {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }
        
        try {
            const currentBranch = await executeGitCommand('git branch --show-current', workspacePath);
            const config = getConfig();
            
            if (validateBranchName(currentBranch, config.branchPattern)) {
                vscode.window.showInformationMessage(`✅ Branch "${currentBranch}" follows the ${config.branchPattern} convention`);
            } else {
                showBranchValidationError(currentBranch, config.branchPattern);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
    });
    
    // Register command to create new branch with validation
    const createBranch = vscode.commands.registerCommand('validate-branch.createBranch', async function () {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }
        
        const config = getConfig();
        if (!config.enableBranchValidation) {
            vscode.window.showInformationMessage('Branch validation is disabled');
            return;
        }
        
        const branchName = await vscode.window.showInputBox({
            prompt: `Enter branch name (${config.branchPattern} convention)`,
            placeHolder: getBranchExamples(config.branchPattern)[0] || 'feature/APC-2876-user-auth'
        });
        
        if (!branchName) {
            return;
        }
        
        if (!validateBranchName(branchName, config.branchPattern)) {
            showBranchValidationError(branchName, config.branchPattern);
            return;
        }
        
        try {
            await executeGitCommand(`git checkout -b ${branchName}`, workspacePath);
            vscode.window.showInformationMessage(`✅ Branch "${branchName}" created successfully!`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create branch: ${error.message}`);
        }
    });
    
    // Register command to validate commit message
    const validateCommit = vscode.commands.registerCommand('validate-branch.validateCommit', async function () {
        const config = getConfig();
        if (!config.enableCommitValidation) {
            vscode.window.showInformationMessage('Commit validation is disabled');
            return;
        }
        
        const commitMessage = await vscode.window.showInputBox({
            prompt: `Enter commit message (${config.commitPattern} convention)`,
            placeHolder: getCommitExamples(config.commitPattern)[0] || '[APC-2356] feat(auth): Add Login Functionality'
        });
        
        if (!commitMessage) {
            return;
        }
        
        if (!validateCommitMessage(commitMessage, config.commitPattern)) {
            showCommitValidationError(commitMessage, config.commitPattern);
            return;
        }
        
        const workspacePath = getWorkspacePath();
        if (!workspacePath) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }
        
        try {
            await executeGitCommand(`git commit -m "${commitMessage}"`, workspacePath);
            vscode.window.showInformationMessage(`✅ Commit created successfully!`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to commit: ${error.message}`);
        }
    });
    
    // Register command to install git hooks
    const installHooks = vscode.commands.registerCommand('validate-branch.installGitHooks', function () {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }
        
        installGitHooks(workspacePath);
        // Update status bar after installing hooks
        setTimeout(updateStatusBar, 100);
    });
    
    // Register command to remove git hooks
    const removeHooks = vscode.commands.registerCommand('validate-branch.removeGitHooks', function () {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }
        
        removeGitHooks(workspacePath);
        vscode.window.showInformationMessage('✅ Git hooks removed successfully! Terminal git commands will no longer be validated.');
        // Update status bar after removing hooks
        setTimeout(updateStatusBar, 100);
    });
    
    // Register command to show settings
    const openSettings = vscode.commands.registerCommand('validate-branch.openSettings', function () {
        vscode.commands.executeCommand('workbench.action.openSettings', 'validateBranch');
    });
    
    // Add all commands to subscriptions
    context.subscriptions.push(
        validateCurrentBranch,
        createBranch,
        validateCommit,
        installHooks,
        removeHooks,
        openSettings
    );
    
    // Show welcome message
    vscode.window.showInformationMessage(
        '🎉 Validate Branch extension activated! Use Ctrl+Shift+P and search for "Validate Branch : Install Git Hooks" commands.',
        'Open Settings',
        'Install Git Hooks'
    ).then(selection => {
        if (selection === 'Open Settings') {
            vscode.commands.executeCommand('validate-branch.openSettings');
        } else if (selection === 'Install Git Hooks') {
            vscode.commands.executeCommand('validate-branch.installGitHooks');
        }
    });
}

// This method is called when your extension is deactivated
function deactivate() {
    console.log('Validate Branch extension is being deactivated...');
    
    // Hide and dispose of the status bar item
    if (globalStatusBarItem) {
        globalStatusBarItem.hide();
        globalStatusBarItem.dispose();
        globalStatusBarItem = null;
        console.log('Status bar item removed and disposed');
    }
    
    // Clean up git hooks from all workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        workspaceFolders.forEach(folder => {
            const workspacePath = folder.uri.fsPath;
            console.log(`Cleaning up git hooks for workspace: ${workspacePath}`);
            removeGitHooks(workspacePath);
        });
    }
    
    console.log('Validate Branch extension deactivated and cleaned up successfully');
}

module.exports = {
    activate,
    deactivate
}