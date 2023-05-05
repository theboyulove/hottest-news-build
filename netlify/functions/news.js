const fetch = require('node-fetch');
const { parse } = require('node-html-parser');
const prettier = require('prettier');

exports.handler = async (event, context) => {
  const articleId = event.queryStringParameters.id;
  const articleUrl = `https://criticsbreakingnews.co.uk/?p=${articleId}`;

  const response = await fetch(articleUrl);
  const html = await response.text();
  const root = parse(html);

  // Get the title of the article
  const title = root.querySelector('meta[property="og:title"]').getAttribute('content');

  // Get the main content of the article
  const contentElements = root.querySelectorAll('.entry-content p');
  const content = contentElements.map(el => el.toString()).join('\n');

  // Get the featured image of the article
  const featuredImageUrl = root.querySelector('meta[property="og:image"]').getAttribute('content');

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
          ${content}
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
