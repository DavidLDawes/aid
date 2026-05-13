const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  presets: [
    ['@babel/preset-env', isTest
      ? { targets: { node: 'current' } }
      : { targets: '> 0.5%, last 2 versions, not dead', modules: false }
    ],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
};