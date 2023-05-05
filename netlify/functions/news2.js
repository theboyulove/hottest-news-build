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
  const featuredImageUrl = $('div.entry-content img').first().attr('data-src');

  // Replace the src attributes of all images with their corresponding data-src attributes
  $('img[data-src]').each((index, element) => {
    const dataSrc = $(element).attr('data-src');
    if (dataSrc) {
      $(element).attr('src', dataSrc).removeAttr('data-src').attr('loading', 'lazy');
    }
  });

  // Format the HTML output using Prettier
  const formattedHtml = prettier.format(
    `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body {
              background-color: #f2f2f2;
              margin: 0;
              padding: 0;
            }
            .header {
              background-color: #0072c6;
              color: #fff;
              padding: 10px;
              display: flex;
              justify-content: space-between;
            }
            .header a {
              color: #fff;
              font-weight: bold;
              text-decoration: none;
              margin-right: 20px;
            }
            .article {
              width: 80%;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
            }
            .article img {
              max-width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <a href="#home">Home</a>
              <a href="#news">News</a>
              <a href="#contact">Contact</a>
            </div>
            
          </div>
          <div class="article">
            <h1>${title}</h1>
            <img src="${featuredImageUrl}">
            <div>${articleContent}</div>
          </div>
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
