import { fetchCikFromTicker } from "./fetchCikFromTicker.js";

async function fetch10KHtmlFromTicker(ticker) {
  const headers = {
    "User-Agent": "arosen64@jh.edu",
  };

  try {
    // ─────────────────────────────────────────────────────────
    // 1. Get CIK directly from the master mapping JSON
    // ─────────────────────────────────────────────────────────
    const cik = await fetchCikFromTicker(ticker);
    console.log(`Ticker ${ticker.toUpperCase()} maps to CIK ${cik}`);

    // ─────────────────────────────────────────────────────────
    // 2. Fetch company submissions
    // ─────────────────────────────────────────────────────────
    const submissionUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
    const submissionsResp = await fetch(submissionUrl, { headers });
    if (!submissionsResp.ok) {
      throw new Error(`Failed to fetch submissions: ${submissionsResp.statusText}`);
    }
    const submissions = await submissionsResp.json();

    // ─────────────────────────────────────────────────────────
    // 3. Find the latest 10-K
    // ─────────────────────────────────────────────────────────
    const { form, accessionNumber } = submissions.filings.recent;
    let accession = null;
    for (let i = 0; i < form.length; i++) {
      if (form[i] === "10-K") {
        accession = accessionNumber[i];
        break;
      }
    }
    if (!accession) throw new Error("No 10-K filing found.");

    console.log(`Found 10-K: ${accession}`);

    // ─────────────────────────────────────────────────────────
    // 4. Build index URL & download the HTML
    // ─────────────────────────────────────────────────────────
    const noDashes = accession.replace(/-/g, "");
    const indexUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${noDashes}/${accession}-index.html`;
    const indexResp = await fetch(indexUrl, { headers });
    const indexHtml = await indexResp.text();

    const match = indexHtml.match(/href="([^"]+\.htm)"/i);
    if (!match) throw new Error("10-K HTML document not found in index.");

    const fullDocUrl = `https://www.sec.gov${match[1]}`;
    console.log(`Downloading 10-K document: ${fullDocUrl}`);

    const docResp = await fetch(fullDocUrl, { headers });
    return await docResp.text();
  } catch (error) {
    console.error("Error fetching 10-K:", error.message);
    throw error;
  }
}
export { fetch10KHtmlFromTicker };
  