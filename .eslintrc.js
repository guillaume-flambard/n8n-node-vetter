module.exports = {
	root: true,
	env: { node: true, es2020: true },
	parser: '@typescript-eslint/parser',
	parserOptions: { sourceType: 'module', ecmaVersion: 2020 },
	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	ignorePatterns: ['.eslintrc.js', 'dist/**', 'node_modules/**', 'tests/**', 'jest.config.js'],
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
	},
};
