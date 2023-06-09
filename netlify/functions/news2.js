const cheerio = require('cheerio');
const prettier = require('prettier');

exports.handler = async (event, context) => {
  const articleId = event.queryStringParameters.id;
  const articleUrl = `https://pupperisland.com/${articleId}`;

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
              max-width: 60%;
              margin: 0 auto;
              background-color: #f1f1f1;
            }
            .navigation {
              background-color: blue;
              color: white;
              display: flex;
              justify-content: space-around;
              padding: 10px;
            }
.navigation a {
  color: white;
  font-weight: bold;
  text-transform: uppercase;
}
          </style>
</head>
        <body>
<div class="navigation">
            <a href="#home" style="font-weight: bold;">Home</a>
            <a href="#entertainment" style="font-weight: bold;">Entertainment</a>
<a href="#sports" style="font-weight: bold;">Sports</a>
<a href="#health" style="font-weight: bold;">Health</a>
            <a href="#contact" style="font-weight: bold;">Contact</a>
          </div>          
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
