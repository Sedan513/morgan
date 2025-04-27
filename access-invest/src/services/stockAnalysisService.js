import { fetch8KHtmlFromTicker } from '../../../backend/sec-functions/fetch8K';
import { fetch10KHtmlFromTicker } from '../../../backend/sec-functions/fetch10K';
import { fetch10QHtmlFromTicker } from '../../../backend/sec-functions/fetch10Q';
import { getNews } from '../../../backend/sec-functions/getNews';

export const analyzeStock = async (ticker) => {
  try {
    // Fetch all required data in parallel
    const [eightK, tenK, tenQ, news] = await Promise.all([
      fetch8KHtmlFromTicker(ticker),
      fetch10KHtmlFromTicker(ticker),
      fetch10QHtmlFromTicker(ticker),
      getNews(ticker)
    ]);

    // Prepare the prompt for Gemini
    const prompt = `
      Analyze the following stock information for ${ticker}:

      8-K Filing:
      ${eightK.substring(0, 1000)}${eightK.length > 1000 ? "..." : ""}

      10-K Filing:
      ${tenK.substring(0, 1000)}${tenK.length > 1000 ? "..." : ""}

      10-Q Filing:
      ${tenQ.substring(0, 1000)}${tenQ.length > 1000 ? "..." : ""}

      Recent News:
      ${news}

      Please provide:
      1. A sentiment score from 1-5 (1 being very negative, 5 being very positive)
      2. A brief explanation of the sentiment score
      3. Key points from the filings and news that influenced the score
    `;

    // TODO: Replace with actual Gemini API call
    // This is a mock response for now
    const mockResponse = {
      sentiment: 4,
      explanation: "Strong earnings growth and positive market sentiment",
      keyPoints: [
        "Revenue increased by 15% YoY",
        "New product launch received positive market reception",
        "Strong balance sheet with increasing cash reserves"
      ]
    };

    return {
      ticker,
      sentiment: mockResponse.sentiment,
      explanation: mockResponse.explanation,
      keyPoints: mockResponse.keyPoints,
      lastUpdated: new Date()
    };

  } catch (error) {
    console.error('Error analyzing stock:', error);
    throw new Error('Failed to analyze stock data');
  }
}; 