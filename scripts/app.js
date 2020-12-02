const NEWS_API_KEY = "2df15d244c085e9a8dbf2dc4518c5963"; // Generate your own API Key on GNews.io 🙂
const SUBJECT = "Microsoft"; // To query a topic
const LANG = "en";
const NEWS_API_URL = `https://gnews.io/api/v4/search?q=${SUBJECT}&token=${NEWS_API_KEY}&lang=${LANG}`;

// Load news from News API
const loadNews = async () => {
    const response = await fetch(NEWS_API_URL);

    if (!response.ok) {
        const message = `💥 ${response.status}`;
        throw new Error(message);
    }

    const jsonResponse = await response.json();
    return jsonResponse.articles;
};

// Render news
const renderNews = async () => {
    let htmlContent = '';
    let news = null;

    try {
        news = await loadNews();
    } catch (ex) {
        htmlContent = `<p>${ex.stack}</p>`;
    }

    if (!news || Array.isArray(news) && !news.length) {
        htmlContent += "<p>No news found.</p>";
    } else {
        // NOTE: Because we use a free GNews.io API Key, you can duplicate {{CONTENT}} to simulate a news content
        let htmlTemplate = `<article>
        <img src='{{URL_TO_IMAGE}}' alt='{{TITLE}}' class="news-image">
        <div class="news-info">
        <a href="#news-modal-{{ID}}">{{TITLE}}</a>
            <h4>{{PUBLISHING_DATE}} - {{SOURCE}}</h4>
            <p>{{DESCRIPTION}}</p>
        </div>
        <div id="news-modal-{{ID}}" class="news-modal-dialog">
        <div class="news-modal-content">
            <a href="#close" title="Close" class="close">x</a>
            <h2>{{TITLE}}</h2>
            <img src='{{URL_TO_IMAGE}}' alt='{{TITLE}}' class="news-modal-image">
            <p>{{CONTENT}}</p>
            <a href="{{URL}}" target="_blank">Read more...</a>
        </div>
    </div>
    </article>`;

        const newsLength = news.length;

        for (var i = 0; i < newsLength; i++) {
            const currentNews = news[i];
            let newsContent = htmlTemplate.replace(/{{ID}}/g, i)
                .replace(/{{URL_TO_IMAGE}}/g, currentNews.image)
                .replace(/{{URL}}/g, currentNews.url)
                .replace(/{{SOURCE}}/g, currentNews.source.name)
                .replace(/{{TITLE}}/g, currentNews.title)
                .replace(/{{PUBLISHING_DATE}}/g, new Date(currentNews.publishedAt).toLocaleString())
                .replace(/{{CONTENT}}/g, currentNews.content)
                .replace(/{{DESCRIPTION}}/g, currentNews.description);
            htmlContent += newsContent;
        };
    }

    document.getElementsByClassName('news-grid')[0].innerHTML = htmlContent;
};

// Register our service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js') // register your service worker file
        .then((reg) => {
            console.debug('Service worker registered! Scope : ' + reg.scope);
        })
        .catch((err) => {
            console.debug('Registration failed! ' + err);
        });
} else {
    console.debug('The browser does not support Service Worker');
}

renderNews();
