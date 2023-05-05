import { useEffect, useState } from "react";

function Article() {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const id = params.get("id");
        const response = await fetch(`/.netlify/functions/news2?id=${id}`);
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchArticle();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          const dataSrc = lazyImage.getAttribute("data-src");
          if (dataSrc) {
            lazyImage.setAttribute("src", dataSrc);
            lazyImage.removeAttribute("data-src");
            lazyImage.setAttribute("loading", "lazy");
          }
          observer.unobserve(lazyImage);
        }
      });
    });
    document.querySelectorAll('img[data-src]').forEach((img) => {
      observer.observe(img);
    });
  }, [article]);

  if (!article) {
    return <div>Loading article...</div>;
  }

  return (
    <div>
      <h1>{article.title}</h1>
      <img data-src={article.image} alt={article.title} />
      <p>{article.content}</p>
    </div>
  );
}

export default Article;
