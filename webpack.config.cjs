const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
            const allFiles = entry ? entry.getFiles().filter(f => !f.endsWith('.map')) : [];

            const cssFiles = allFiles.filter(f => f.endsWith('.css'));
            const jsFiles = allFiles.filter(f => f.endsWith('.js'));

            const links = cssFiles
              .map(f => `<link rel="stylesheet" href="${publicPath}${f}">`)
              .join('\n    ');

            const scripts = jsFiles
              .map(f => `<script src="${publicPath}${f}"></script>`)
              .join('\n    ');

            if (links) {
              html = html.replace('</head>', `    ${links}\n  </head>`);
            }

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
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
      ],
    },
    plugins: [
      new InjectBundlesPlugin('./index.html'),
      ...(isProduction ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' })] : []),
    ],
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
    performance: {
      maxAssetSize: 250 * 1024,
      maxEntrypointSize: 350 * 1024,
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
          },
        },
      },
    },
  };
};
