import { fetchCikFromTicker } from "./fetchCikFromTicker.js";
import { loadSecApiKey } from '../server.js';

/**
 * Fetches the latest 10-Q HTML for a given ticker by:
 *  1. Looking up the zero-padded CIK via company_tickers.json
 *  2. Fetching the company's submissions JSON
 *  3. Finding the most recent 10-Q accession number
 *  4. Downloading and returning the 10-Q HTML document
 *
 * If no 10-Q is available, or the document link is missing, returns "N/A".
 */
async function fetch8KHtmlFromTicker(ticker) {
  // 1. Store your API key in a variable
  const apiKey = await loadSecApiKey();
  // 2. Define your ticker and form type
  const formType = "8-K";

  const filingUrl = await getFilingUrl(ticker, formType, apiKey);
  const sectionItem = "1-1"; // For example, Risk Factors section

  const extractorApiUrl = `https://api.sec-api.io/extractor?url=${encodeURIComponent(filingUrl)}&item=${sectionItem}&type=text&token=${apiKey}`;

  try {
      const response = await fetch(extractorApiUrl);
      const sectionText = await response.text();
      console.log("Extracted Section Text:\n", sectionText);
      return sectionText;
  } catch (error) {
      console.error("Error extracting section:", error);
  }
}

// 3. First, fetch the filing URL from the Query API
async function getFilingUrl(ticker, formType, apiKey) {
    const query = {
        query: {
            query_string: {
                query: `ticker:${ticker} AND formType:${formType}`
            }
        },
        from: 0,
        size: 1,
        sort: [{ filedAt: { order: "desc" } }]
    };

    const queryApiUrl = `https://api.sec-api.io?token=${apiKey}&q=${encodeURIComponent(JSON.stringify(query))}`;

    try {
        const response = await fetch(queryApiUrl);
        const data = await response.json();
        const filingUrl = data.filings[0].filingUrl;
        console.log("Filing URL:", filingUrl);
        return filingUrl;
    } catch (error) {
        console.error("Error fetching filing URL:", error);
    }
}

 

export { fetch8KHtmlFromTicker };