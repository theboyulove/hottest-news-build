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
  $('div.entry-content img').each((index, element) => {
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
          <title>${title}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body {
      background-color: #f1f1f1;
    }
    .container {
      width: 60%;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      box-shadow: 0px 0px 10px rgba(0,0,0,0.2);
    }
    .container h1 {
      font-size: 36px;
      line-height: 1.3;
      margin: 0 0 20px;
    }
    .container img {
      max-width: 100%;
      height: auto;
      margin: 20px 0;
    }
    .container p {
      font-size: 18px;
      line-height: 1.5;
      margin: 0 0 20px;
    }
  </style>
</head>
        <body>
          <h1>${title}</h1>
          <img src="${featuredImageUrl}">
          <div>${articleContent}</div>
        </body>
        <script>
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const lazyImage = entry.target;
                const dataSrc = lazyImage.getAttribute('data-src');
                if (dataSrc) {
                  lazyImage.setAttribute('src', dataSrc);
                  lazyImage.removeAttribute('data-src');
                  lazyImage.setAttribute('loading', 'lazy');
                }
                observer.unobserve(lazyImage);
              }
            });
          });
          document.querySelectorAll('img[data-src]').forEach((img) => {
            observer.observe(img);
          });
        </script>
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
