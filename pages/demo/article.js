import { useEffect, useState } from "react";

function Article() {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get("id");
        const response = await fetch(`/.netlify/functions/news2?id=${articleId}`);
        const data = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
        setArticle(doc);
      } catch (error) {
        console.error(error);
      }
    };

    fetchArticle();
  }, []);

  if (!article) {
    return <div>Loading article...</div>;
  }

  return (
    <div>
      <h1>{article.querySelector("h1").textContent}</h1>
      {article.querySelectorAll("img").length > 0 &&
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
      }
      <div dangerouslySetInnerHTML={{ __html: article.body.innerHTML }}></div>
    </div>
  );
}

export default Article;
