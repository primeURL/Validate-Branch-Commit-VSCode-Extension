#!/bin/bash

# Demo script to show terminal validation in action
# This script demonstrates how the git hooks validate terminal commands

echo "🎯 VS Code Validate Branch Extension - Terminal Demo"
echo "=================================================="
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository. Please run this script in a git repository."
    exit 1
fi

# Check if hooks are installed
if [ ! -f ".git/hooks/pre-commit" ] || [ ! -f ".git/hooks/commit-msg" ]; then
    echo "⚠️  Git hooks not found. Please install them first:"
    echo "   1. Open VS Code in this repository"
    echo "   2. Press Ctrl+Shift+P"
    echo "   3. Run: 'Validate Branch: Install Git Hooks'"
    echo ""
    exit 1
fi

echo "✅ Git hooks are installed!"
echo ""

# Save current branch
current_branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
echo "📍 Current branch: $current_branch"
echo ""

echo "🧪 Testing Branch Name Validation"
echo "================================="
echo ""

echo "❌ Testing invalid branch name..."
echo "Command: git checkout -b my-invalid-branch"
echo ""
if git checkout -b my-invalid-branch 2>&1; then
    echo "⚠️  Branch was created despite being invalid (hooks might not be working)"
    git checkout "$current_branch" 2>/dev/null
    git branch -D my-invalid-branch 2>/dev/null
else
    echo "✅ Invalid branch creation was blocked!"
fi
echo ""

echo "✅ Testing valid branch name..."
echo "Command: git checkout -b feat/demo-feature"
echo ""
if git checkout -b feat/demo-feature 2>&1; then
    echo "✅ Valid branch created successfully!"
    
    # Create a test file for commit demo
    echo "Demo content" > demo-file.txt
    git add demo-file.txt
    
    echo ""
    echo "🧪 Testing Commit Message Validation"
    echo "===================================="
    echo ""
    
    echo "❌ Testing invalid commit message..."
    echo "Command: git commit -m 'invalid commit message'"
    echo ""
    if git commit -m "invalid commit message" 2>&1; then
        echo "⚠️  Commit was created despite invalid message (hooks might not be working)"
    else
        echo "✅ Invalid commit was blocked!"
    fi
    echo ""
    
    echo "✅ Testing valid commit message..."
    echo "Command: git commit -m 'feat: add demo functionality'"
    echo ""
    if git commit -m "feat: add demo functionality" 2>&1; then
        echo "✅ Valid commit created successfully!"
    else
        echo "❌ Valid commit was unexpectedly blocked"
    fi
    
    # Cleanup
    echo ""
    echo "🧹 Cleaning up demo..."
    git checkout "$current_branch" 2>/dev/null
    git branch -D feat/demo-feature 2>/dev/null
    echo "✅ Demo cleanup complete!"
    
else
    echo "❌ Valid branch creation failed"
fi

echo ""
echo "🎉 Demo completed!"
echo ""
echo "💡 Tips:"
echo "   • Use 'git commit --no-verify' to bypass validation temporarily"
echo "   • Configure patterns in VS Code settings (validateBranch.*)"
echo "   • Reinstall hooks after changing settings"
echo ""
echo "📚 For more examples, see TERMINAL_VALIDATION.md"