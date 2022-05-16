module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [{ loader: '@svgr/webpack', options: { icon: true } }],
    })
    return config
  },
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'bumblebuzz.io', 'ipfs.bumblebuzz.io',
      'ipfs', 'ipfs.io', 'gateway.pinata.cloud',
      'dynamodb-local',
      'amazonaws.com',
      'aurorascan.dev', 'etherscan.io', 'coingecko.com',
      'mydomain', 'mydomain.com', 'service-name.mydomain.com',
      'amazonaws.com', ' https://bumblebuzz.s3.us-east-1.amazonaws.com', 'bumblebuzz.s3.us-east-1.amazonaws.com'
    ],
  },
}
