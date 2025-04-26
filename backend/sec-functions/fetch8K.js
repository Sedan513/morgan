import { fetchCikFromTicker } from "./fetchCikFromTicker.js";

/**
 * Fetches the latest 8-K HTML for a given ticker by:
 *  1. Looking up the zero-padded CIK via company_tickers.json
 *  2. Fetching the company’s submissions JSON
 *  3. Finding the most recent 8-K accession number
 *  4. Downloading and returning the 8-K HTML document
 *
 * If no 8-K is available, returns the string "N/A".
 */
async function fetch8KHtmlFromTicker(ticker) {
  const headers = {
    "User-Agent": "arosen64@jh.edu",
  };

  // 1. Get zero-padded CIK
  const cik = await fetchCikFromTicker(ticker);
  console.log(`Ticker ${ticker.toUpperCase()} → CIK ${cik}`);

  // 2. Fetch company submissions
  const submissionsUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
  const submissionsResp = await fetch(submissionsUrl, { headers });
  if (!submissionsResp.ok) {
    throw new Error(`Failed to fetch submissions: ${submissionsResp.statusText}`);
  }
  const submissions = await submissionsResp.json();

  // 3. Locate the latest 8-K in recent filings
  const { form, accessionNumber } = submissions.filings.recent;
  let latestAcc = null;
  for (let i = 0; i < form.length; i++) {
    if (form[i] === "8-K") {
      latestAcc = accessionNumber[i];
      break;
    }
  }

  //  → If no 8-K filings, return "N/A"
  if (!latestAcc) {
    console.warn(`No 8-K filing found for ticker ${ticker}`);
    return "N/A";
  }
  console.log(`Found 8-K accession: ${latestAcc}`);

  // 4. Build the index page URL
  const accNoDashes = latestAcc.replace(/-/g, "");
  const idxUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accNoDashes}/${latestAcc}-index.html`;

  // 5. Fetch the index page and extract the .htm link
  const idxResp = await fetch(idxUrl, { headers });
  if (!idxResp.ok) {
    throw new Error(`Failed to fetch index page: ${idxResp.statusText}`);
  }
  const idxHtml = await idxResp.text();
  const match = idxHtml.match(/href="([^"]+\.htm)"/i);
  if (!match || !match[1]) {
    // No document link → treat as “no data”
    console.warn(`8-K HTML link not found in index for ticker ${ticker}`);
    return "N/A";
  }
  const docUrl = `https://www.sec.gov${match[1]}`;
  console.log(`Downloading 8-K from: ${docUrl}`);

  // 6. Download and return the 8-K HTML
  const docResp = await fetch(docUrl, { headers });
  if (!docResp.ok) {
    throw new Error(`Failed to download 8-K document: ${docResp.statusText}`);
  }
  return await docResp.text();
}

export { fetch8KHtmlFromTicker };
