const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/main.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Split React and ReactDOM into a vendor bundle
          vendor: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: 'vendor',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Split other node_modules into a separate bundle
          nodeModules: {
            test: /[\\/]node_modules[\\/]/,
            name: 'node-modules',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: 'single', // Extract webpack runtime into separate chunk
    },
    performance: {
      // Adjust performance budgets for a React application with code splitting
      maxEntrypointSize: 350000, // 350 KiB - allows for React vendor bundle
      maxAssetSize: 250000, // 250 KiB - individual asset limit
      hints: isProduction ? 'warning' : false, // Only show warnings in production
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 8080,
      open: true,
      hot: true,
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};