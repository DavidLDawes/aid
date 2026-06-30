const path = require('path');
const fs = require('fs');

class InjectBundlesPlugin {
  constructor(template) {
    this.templatePath = path.resolve(__dirname, template);
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap('InjectBundlesPlugin', (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: 'InjectBundlesPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
        },
        (_, callback) => {
          try {
            let html = fs.readFileSync(this.templatePath, 'utf-8');

            const rawPublicPath = compilation.outputOptions.publicPath;
            const publicPath = !rawPublicPath || rawPublicPath === 'auto' ? '' : String(rawPublicPath);

            const entry = compilation.entrypoints.get('main');
            const jsFiles = entry
              ? entry.getFiles().filter(f => f.endsWith('.js') && !f.endsWith('.map'))
              : [];

            const scripts = jsFiles
              .map(f => `<script src="${publicPath}${f}"></script>`)
              .join('\n    ');

            html = html.replace(
              /<script\b[^>]*\bsrc="[^"]*main\.tsx"[^>]*><\/script>/,
              scripts
            );

            const { RawSource } = compiler.webpack.sources;
            compilation.emitAsset('index.html', new RawSource(html));
            callback();
          } catch (err) {
            callback(err);
          }
        }
      );
    });
  }
}

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
      new InjectBundlesPlugin('./index.html'),
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
