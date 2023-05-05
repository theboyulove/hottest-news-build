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

  // Replace the src attributes of all images with their corresponding data-src attributes and add lazy-loading attribute
  $('img[data-src]').each((index, element) => {
    const dataSrc = $(element).attr('data-src');
    if (dataSrc) {
      $(element).attr('src', dataSrc).removeAttr('data-src').attr('loading', 'lazy');
    }
  });

  // Add header menu
  const headerMenu = `
    <header>
      <nav>
        <ul>
          <li><a href="#home"><strong>Home</strong></a></li>
          <li><a href="#news"><strong>News</strong></a></li>
          <li><a href="#contact"><strong>Contact</strong></a></li>
        </ul>
      </nav>
    </header>
  `;

  // Format the HTML output using Prettier
  const formattedHtml = prettier.format(
    `
      <html>
        <head>
          <title>${title}</title>
        </head>
        <body>
          ${headerMenu}
          <h1>${title}</h1>
          <img src="${featuredImageUrl}" loading="lazy">
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
