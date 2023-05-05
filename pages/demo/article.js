import { useEffect, useState } from "react";

function Article() {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch("/.netlify/functions/news2?id=100680");
        const data = await response.json();
        setArticle(data);
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
      <h1>{article.title}</h1>
      <img src={article.image} alt={article.title} />
      <p>{article.content}</p>
    </div>
  );
}

export default Article;