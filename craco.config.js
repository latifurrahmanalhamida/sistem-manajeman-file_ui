module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Menambahkan aturan untuk mengabaikan peringatan source map dari pustaka tertentu
      webpackConfig.module.rules.push({
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          // Abaikan peringatan dari docx-preview
          /node_modules\/docx-preview/
        ],
      });
      return webpackConfig;
    },
  },
};