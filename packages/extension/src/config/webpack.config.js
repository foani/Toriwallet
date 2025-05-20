const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// 경로 정의
const paths = require('./paths');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      background: path.join(paths.src, 'background', 'index.ts'),
      contentScript: path.join(paths.src, 'contentScript', 'index.ts'),
      inpage: path.join(paths.src, 'inpage', 'index.ts'),
      popup: path.join(paths.src, 'popup', 'index.tsx'),
      onboarding: path.join(paths.src, 'popup', 'index.tsx')
    },
    output: {
      path: paths.build,
      filename: '[name].js',
      clean: true
    },
    module: {
      rules: [
        // TypeScript/JavaScript
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript'
              ],
              plugins: [
                '@babel/plugin-transform-runtime'
              ]
            }
          }
        },
        // CSS
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },
        // 이미지
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name][ext]'
          }
        },
        // 폰트
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name][ext]'
          }
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      alias: {
        '@': paths.src
      }
    },
    plugins: [
      new CleanWebpackPlugin(),
      
      // 정적 파일 복사
      new CopyWebpackPlugin({
        patterns: [
          {
            from: paths.public,
            to: paths.build,
            globOptions: {
              ignore: ['**/index.html']
            }
          }
        ]
      }),
      
      // HTML 템플릿
      new HtmlWebpackPlugin({
        template: path.join(paths.public, 'popup.html'),
        filename: 'popup.html',
        chunks: ['popup'],
        cache: false
      }),
      
      new HtmlWebpackPlugin({
        template: path.join(paths.public, 'onboarding.html'),
        filename: 'onboarding.html',
        chunks: ['onboarding'],
        cache: false
      })
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
            },
          },
        }),
      ],
    },
    devtool: isProduction ? false : 'inline-source-map',
    cache: true,
    performance: {
      hints: false
    }
  };
};
