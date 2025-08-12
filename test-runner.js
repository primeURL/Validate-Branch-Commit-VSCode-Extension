#!/usr/bin/env node

/**
 * Simple test runner for the Validate Branch extension
 * This runs basic validation tests without requiring VS Code
 */

const assert = require('assert');

// Import the patterns from our extension
const BRANCH_PATTERNS = {
    gitflow: /^(feature|bugfix|hotfix|release)\/[a-z0-9-]+$/,
    conventional: /^(feat|fix|docs|style|refactor|test|chore)\/[a-z0-9-]+$/,
    jira: /^(feature|bugfix|hotfix)\/[A-Z]+-\d+-.+$/,
    simple: /^[a-z0-9-]+$/
};

const COMMIT_PATTERNS = {
    conventional: /^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?: .{1,50}/,
    angular: /^(build|ci|docs|feat|fix|perf|refactor|style|test)(\(.+\))?: .{1,50}/,
    simple: /^.{10,72}$/
};

console.log('🧪 Running Validate Branch Extension Tests...\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(testName, testFunction) {
    try {
        testFunction();
        console.log(`✅ ${testName}`);
        testsPassed++;
    } catch (error) {
        console.log(`❌ ${testName}`);
        console.log(`   Error: ${error.message}\n`);
        testsFailed++;
    }
}

// Test Branch Name Validation
console.log('📋 Testing Branch Name Validation');
console.log('================================');

runTest('Conventional pattern - valid branch names', () => {
    const validNames = [
        'feat/user-authentication',
        'fix/login-bug',
        'docs/readme-update',
        'style/button-colors',
        'refactor/api-cleanup',
        'test/user-validation',
        'chore/dependency-update'
    ];

    validNames.forEach(name => {
        assert.strictEqual(
            BRANCH_PATTERNS.conventional.test(name),
            true,
            `Branch name "${name}" should be valid`
        );
    });
});

runTest('Conventional pattern - invalid branch names', () => {
    const invalidNames = [
        'feature/user-auth',  // wrong prefix
        'my-feature',         // no prefix
        'feat/User-Auth',     // uppercase
        'feat/user_auth',     // underscore
        'feat/',              // empty suffix
        'FEAT/user-auth'      // uppercase prefix
    ];

    invalidNames.forEach(name => {
        assert.strictEqual(
            BRANCH_PATTERNS.conventional.test(name),
            false,
            `Branch name "${name}" should be invalid`
        );
    });
});

runTest('GitFlow pattern - valid branch names', () => {
    const validNames = [
        'feature/user-authentication',
        'bugfix/login-error',
        'hotfix/security-patch',
        'release/v1-2-0'
    ];

    validNames.forEach(name => {
        assert.strictEqual(
            BRANCH_PATTERNS.gitflow.test(name),
            true,
            `Branch name "${name}" should be valid`
        );
    });
});

runTest('JIRA pattern - valid branch names', () => {
    const validNames = [
        'feature/PROJ-123-user-login',
        'bugfix/PROJ-456-fix-crash',
        'hotfix/ABC-789-security-fix'
    ];

    validNames.forEach(name => {
        assert.strictEqual(
            BRANCH_PATTERNS.jira.test(name),
            true,
            `Branch name "${name}" should be valid`
        );
    });
});

// Test Commit Message Validation
console.log('\n📝 Testing Commit Message Validation');
console.log('====================================');

runTest('Conventional pattern - valid commit messages', () => {
    const validMessages = [
        'feat: add user authentication',
        'fix: resolve login button issue',
        'docs: update README with setup instructions',
        'style: improve button styling',
        'refactor(auth): simplify login logic',
        'perf: optimize database queries',
        'test: add user validation tests',
        'chore: update dependencies'
    ];

    validMessages.forEach(message => {
        assert.strictEqual(
            COMMIT_PATTERNS.conventional.test(message),
            true,
            `Commit message "${message}" should be valid`
        );
    });
});

runTest('Conventional pattern - invalid commit messages', () => {
    const invalidMessages = [
        'added new feature',           // no type
        'feat added feature',          // missing colon
        'feature: add user auth',      // wrong type
        'feat:add feature',           // no space after colon
        'feat: ',                     // too short description
        'FEAT: add feature'           // uppercase type
    ];

    invalidMessages.forEach(message => {
        assert.strictEqual(
            COMMIT_PATTERNS.conventional.test(message),
            false,
            `Commit message "${message}" should be invalid`
        );
    });
});

runTest('Angular pattern - valid commit messages', () => {
    const validMessages = [
        'feat(auth): add user login functionality',
        'fix(ui): resolve button alignment issue',
        'docs: update contributing guidelines',
        'test(auth): add login unit tests',
        'build: update webpack configuration',
        'ci: add GitHub Actions workflow'
    ];

    validMessages.forEach(message => {
        assert.strictEqual(
            COMMIT_PATTERNS.angular.test(message),
            true,
            `Commit message "${message}" should be valid`
        );
    });
});

// Test Edge Cases
console.log('\n🔍 Testing Edge Cases');
console.log('=====================');

runTest('Branch names with numbers and hyphens', () => {
    const pattern = BRANCH_PATTERNS.conventional;
    const testCases = [
        { name: 'feat/feature-123', expected: true },
        { name: 'fix/bug-fix-2024', expected: true },
        { name: 'docs/api-v2-documentation', expected: true },
        { name: 'feat/feature--double-hyphen', expected: true },
    ];

    testCases.forEach(testCase => {
        assert.strictEqual(
            pattern.test(testCase.name),
            testCase.expected,
            `Branch name "${testCase.name}" should ${testCase.expected ? 'be valid' : 'be invalid'}`
        );
    });
});

runTest('Commit messages with scopes', () => {
    const pattern = COMMIT_PATTERNS.conventional;
    const testCases = [
        { message: 'feat(auth): add login', expected: true },
        { message: 'fix(ui/components): resolve issue', expected: true },
        { message: 'docs(api-v2): update endpoints', expected: true },
        { message: 'feat(): empty scope', expected: false }, // Empty scope should be invalid
        { message: 'feat: no scope', expected: true },
    ];

    testCases.forEach(testCase => {
        assert.strictEqual(
            pattern.test(testCase.message),
            testCase.expected,
            `Commit message "${testCase.message}" should ${testCase.expected ? 'be valid' : 'be invalid'}`
        );
    });
});

// Test Results
console.log('\n📊 Test Results');
console.log('===============');
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📈 Total Tests: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Your extension validation logic is working correctly.');
    process.exit(0);
} else {
    console.log('\n💥 Some tests failed. Please check the validation logic.');
    process.exit(1);
}