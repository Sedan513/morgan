import yahooFinance from 'yahoo-finance2';

async function getNews(ticker) {
    // Perform a search on the yahooFinance client for the given ticker,
    // requesting up to 5 recent news items.
    const newsResponse = await yahooFinance.search(ticker, {
        newsCount: 5
    });

    // If the response is nullish (e.g., network error or no data),
    // return a fallback value indicating "Not Available".
    if (!newsResponse) {
        return "";
    }

    // Otherwise, extract and return the `news` json object from the response.
    return JSON.stringify(newsResponse.news);
}

export { getNews };