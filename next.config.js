module.exports = {
  async redirects() {
    return [      {        source: '/functions/news2?id=:id',        has: [          {            type: 'query',            key: 'fbclid'          }        ],
        destination: 'https://pupperisland.com/:id',
        permanent: false,
      },
      {
        source: '/functions/news2?id=:id',
        has: [
          {
            type: 'header',
            key: 'referer',
          }
        ],
        destination: 'https://pupperisland.com/:id',
        permanent: false,
      },
      {
        source: '/functions/news2?id=:id',
        has: [
          {
            type: 'header',
            key: 'Referer',
            value: 'https://t.co/*',
          },
        ],
        destination: 'https://pupperisland.com/:id',
        permanent: false,
      },
    ]
  },
  }
