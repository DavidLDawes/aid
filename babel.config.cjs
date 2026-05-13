module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' },
      modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false,
    }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
};