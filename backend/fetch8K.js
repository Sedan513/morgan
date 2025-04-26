async function fetch8KHtmlFromTicker(ticker) {
  const headers = {
    "User-Agent": "arosen64@jh.edu",
  };

  try {
    // 1. Search company
    const searchUrl = `https://www.sec.gov/edgar/search_company_api.json?keys=${ticker}`;
    const searchResp = await fetch(searchUrl, { headers });

    if (!searchResp.ok) {
      throw new Error(`Failed to search ticker: ${searchResp.statusText}`);
    }

    const searchData = await searchResp.json();

    // 2. Find CIK
    if (!searchData.hits || searchData.hits.hits.length === 0) {
      throw new Error(`Ticker ${ticker} not found.`);
    }

    const cik = searchData.hits.hits[0]._source.cik.padStart(10, "0");

    console.log(`Found CIK ${cik} for ticker ${ticker}`);

    // 3. Get company submissions
    const submissionsUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
    const submissionsResp = await fetch(submissionsUrl, { headers });
    const submissions = await submissionsResp.json();

    // 4. Find latest 8-K
    const filings = submissions.filings.recent;
    let accessionNumber = null;

    for (let i = 0; i < filings.form.length; i++) {
      if (filings.form[i] === "8-K") {
        accessionNumber = filings.accessionNumber[i];
        break;
      }
    }

    if (!accessionNumber) {
      throw new Error("No 8-K filing found.");
    }

    // 5. Build filing URL
    const accessionNoDashes = accessionNumber.replace(/-/g, "");
    const indexUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionNoDashes}/${accessionNumber}-index.html`;

    // 6. Fetch index page and find the 8-K document
    const indexResp = await fetch(indexUrl, { headers });
    const indexHtml = await indexResp.text();

    const docMatch = indexHtml.match(/href="([^"]+\.htm)"/i);
    if (!docMatch) {
      throw new Error("8-K document link not found.");
    }

    const fullDocUrl = `https://www.sec.gov${docMatch[1]}`;

    console.log(`Downloading 8-K from: ${fullDocUrl}`);

    // 7. Download and return
    const docResp = await fetch(fullDocUrl, { headers });
    const docHtml = await docResp.text();

    return docHtml;
  } catch (error) {
    console.error(`Error fetching 8-K:`, error.message);
    throw error;
  }
}

export { fetch8KHtmlFromTicker };