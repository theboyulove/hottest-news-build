import { useEffect, useState } from "react";

function Article() {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const id = new URLSearchParams(window.location.search).get("id");
        const response = await fetch(`/.netlify/functions/news2?id=${id}`);
        const html = await response.text();
        setArticle(html);
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
    <div dangerouslySetInnerHTML={{ __html: article }}></div>
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
  );
}

export default Article;
