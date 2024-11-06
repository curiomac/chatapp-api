module.exports = ({ env }) => ({
  upload: {
    provider: "local",
    providerOptions: {
      sizeLimit: 10000000,
    },
  },
});
