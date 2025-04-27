import yahooFinance from 'yahoo-finance2';
import process from 'process';

const [,, ticker = 'AAPL'] = process.argv;

async function getPrices(symbol) {
  // compute timestamps
  console.log("hi")
  const now = Date.now();
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  try {
    // fetch 1-minute bars for the last day
    const opts = { period1: threeDaysAgo, period2: now, interval: '30m',  return: "object", includePrePost: false };
    const resp = await yahooFinance.chart(symbol, opts);
    const result = resp
    if (!result) {
      console.log(`No data for ${symbol}.`);
      return;
    }

    const timestamps = result.timestamp
    const opens = result.indicators.quote[0].open

    const timeOpenList = timestamps.map((t, i) => ({
        date: new Date(t * 1000).toISOString(),
        price: opens[i]
      }));
  
    return timeOpenList

  } catch (err) {
    console.error(`Error fetching data for ${symbol}:`, err.message);
  }
}

export default getPrices;
