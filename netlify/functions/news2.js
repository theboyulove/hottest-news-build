const cheerio = require('cheerio');
const prettier = require('prettier');

exports.handler = async (event, context) => {
  const articleId = event.queryStringParameters.id;
  const articleUrl = `https://aubtu.biz/${articleId}`;

  const { default: fetch } = await import('node-fetch');

  const response = await fetch(articleUrl);
  const html = await response.text();

  const $ = cheerio.load(html);

  // Get the title of the article
  const title = $('h1.entry-title').text();

  // Get the main content of the article
  const articleContent = $('div.entry-content').html();

  // Get the featured image of the article
  let featuredImageUrl = $('div.entry-content img').first().attr('src');
  if (featuredImageUrl.startsWith('data:')) {
    const response = await fetch(featuredImageUrl);
    const buffer = await response.buffer();
    featuredImageUrl = `data:${response.headers.get(
      'content-type'
    )};base64,${buffer.toString('base64')}`;
  }

  // Replace data URLs in all images in the article content
  $('div.entry-content img').each(async (i, img) => {
    const imageUrl = $(img).attr('src');
    if (imageUrl.startsWith('data:')) {
      const response = await fetch(imageUrl);
      const buffer = await response.buffer();
      const originalUrl = response.url;
      $(img).attr('src', originalUrl);
      $(img).attr(
        'data-src',
        `data:${response.headers.get('content-type')};base64,${buffer.toString(
          'base64'
        )}`
      );
    }
  });

  // Format the HTML output using Prettier
  const formattedHtml = prettier.format(
    `
      <html>
        <head>
          <title>${title}</title>
        </head>
        <body>
          <h1>${title}</h1>
          <img src="${featuredImageUrl}">
          <div>${articleContent}</div>
        </body>
      </html>
    `,
    { parser: 'html' }
  );

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: formattedHtml,
  };
};

