module.exports = {
    env: {
        node: true,
        es2020: true,
    },
    extends: [
        'airbnb',
    ],
    overrides: [
        {
            files: ['test/*.ts'],
            env: {
                mocha: true,
            },
        },
    ],
    // settings: {
    //   'import/resolver': {
    //     node: {
    //       extensions: ['.js', '.jsx', '.ts', '.tsx'],
    //     },
    //     typescript: {},
    //   },
    // },
    // ignorePatterns: ['.eslintrc.js'],
    parser: '@typescript-eslint/parser',
    // parserOptions: {
    //   ecmaVersion: 12,
    //   sourceType: 'module',
    // },
    plugins: [
        '@typescript-eslint',
    ],
    rules: {
        indent: ['error', 4],
        'import/no-extraneous-dependencies': 'off',
        'max-len': 'off',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],
        'import/prefer-default-export': 'off',
        'import/extensions': 'off',
        'no-shadow': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
    },
};
