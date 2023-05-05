import { useEffect } from "react";

function Article() {
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch("/.netlify/functions/news2?id=100680");
        const data = await response.text();
        document.getElementById("article-content").innerHTML = data;
      } catch (error) {
        console.error(error);
      }
    };

    fetchArticle();
  }, []);

  return (
    <div>
      <div id="article-content"></div>
    </div>
  );
}

export default Article;
