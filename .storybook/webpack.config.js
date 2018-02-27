/** 
 * Get default storybook webpack configuration
 */
const storybookConfig = require(
  '@storybook/react/dist/server/config/defaults/webpack.config.js'
);

// const reactDevConfig = require('../config/webpack.config.dev.js')

module.exports = (baseConfig, env) => {
  const config = storybookConfig(baseConfig, env);

  // add the same typescript loader as the one used in webpack dev config.
  // maybe simply replacing the entire ruleset would work? 
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve('ts-loader'),
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true,
        },
      },
    ],
  });

  // add tsx and ts as sources
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};