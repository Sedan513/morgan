import yahooFinance from 'yahoo-finance2';

async function getNews(ticker) {
    const newsResponse = await yahooFinance._module('news', {
        symbols: ticker,
        count: 5
    });

    if (!newsResponse.ok) {
        return "N/A";
    }

    return newsResponse.Content;
}