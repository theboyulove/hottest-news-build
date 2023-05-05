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
  const $content = $('div.entry-content');
  const articleContent = $content.html();

  // Get the featured image of the article
  const $featuredImage = $content.find('img[data-src]:first-child');
  const featuredImageUrl = $featuredImage.attr('data-src');

  // Replace the src attributes of all images with their corresponding data-src attributes
  $content.find('img[data-src]').each((index, element) => {
    const $img = $(element);
    const dataSrc = $img.attr('data-src');
    console.log(`Replacing src with data-src: ${dataSrc}`);
    $img.attr('src', dataSrc).removeAttr('data-src');
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
