import { fetchCikFromTicker } from "./fetchCikFromTicker.js";

/**
 * Fetches the latest 10-Q HTML for a given ticker by:
 *  1. Looking up the zero-padded CIK via company_tickers.json
 *  2. Fetching the company’s submissions JSON
 *  3. Finding the most recent 10-Q accession number
 *  4. Downloading and returning the 10-Q HTML document
 */
async function fetch10QHtmlFromTicker(ticker) {
  const headers = {
    "User-Agent": "arosen64@jh.edu",
  };

  try {
    // 1. Get the zero-padded CIK
    const cik = await fetchCikFromTicker(ticker);
    console.log(`Ticker ${ticker.toUpperCase()} → CIK ${cik}`);

    // 2. Fetch company submissions
    const submissionsUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
    const submissionsResp = await fetch(submissionsUrl, { headers });
    if (!submissionsResp.ok) {
      throw new Error(`Failed to fetch submissions: ${submissionsResp.statusText}`);
    }
    const submissions = await submissionsResp.json();

    // 3. Locate the latest 10-Q in recent filings
    const { form, accessionNumber } = submissions.filings.recent;
    let latestAcc = null;
    for (let i = 0; i < form.length; i++) {
      if (form[i] === "10-Q") {
        latestAcc = accessionNumber[i];
        break;
      }
    }
    if (!latestAcc) {
      throw new Error("No 10-Q filing found in recent submissions.");
    }
    console.log(`Found 10-Q accession: ${latestAcc}`);

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
      throw new Error("10-Q HTML document link not found in index page.");
    }
    const docUrl = `https://www.sec.gov${match[1]}`;
    console.log(`Downloading 10-Q from: ${docUrl}`);

    // 6. Download and return the 10-Q HTML
    const docResp = await fetch(docUrl, { headers });
    if (!docResp.ok) {
      throw new Error(`Failed to download 10-Q document: ${docResp.statusText}`);
    }
    return await docResp.text();

  } catch (error) {
    console.error("Error fetching 10-Q:", error.message);
    throw error;
  }
}

export { fetch10QHtmlFromTicker };
