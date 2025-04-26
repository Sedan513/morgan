async function fetch10KHtmlFromTicker(ticker) {
    const headers = {
      "User-Agent": "Your Name your.email@example.com", // Replace with real info
    };
  
    try {
      // 1. Search for the company by ticker
      const searchUrl = `https://www.sec.gov/edgar/search_company_api.json?keys=${ticker}`;
      const searchResp = await fetch(searchUrl, { headers });
  
      if (!searchResp.ok) {
        throw new Error(`Failed to search ticker: ${searchResp.statusText}`);
      }
  
      const searchData = await searchResp.json();
  
      // 2. Extract CIK
      if (!searchData || !searchData.hits || searchData.hits.hits.length === 0) {
        throw new Error(`Ticker ${ticker} not found in SEC search.`);
      }
  
      const firstHit = searchData.hits.hits[0]._source;
  
      if (!firstHit.cik) {
        throw new Error(`No CIK found for ticker ${ticker}.`);
      }
  
      const cik = firstHit.cik.padStart(10, "0");
      console.log(`Ticker ${ticker.toUpperCase()} maps to CIK ${cik}`);
  
      // 3. Fetch company submissions
      const submissionUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
      const submissionsResp = await fetch(submissionUrl, { headers });
  
      if (!submissionsResp.ok) {
        throw new Error(`Failed to fetch submissions: ${submissionsResp.statusText}`);
      }
  
      const submissions = await submissionsResp.json();
  
      // 4. Find the latest 10-K
      const filings = submissions.filings.recent;
      let accessionNumber = null;
  
      for (let i = 0; i < filings.form.length; i++) {
        if (filings.form[i] === "10-K") {
          accessionNumber = filings.accessionNumber[i];
          break;
        }
      }
  
      if (!accessionNumber) {
        throw new Error("No 10-K filing found.");
      }
  
      console.log(`Found 10-K: ${accessionNumber}`);
  
      // 5. Build index URL
      const accessionNoDashes = accessionNumber.replace(/-/g, "");
      const indexUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionNoDashes}/${accessionNumber}-index.html`;
  
      // 6. Fetch the filing index page
      const indexResp = await fetch(indexUrl, { headers });
      const indexHtml = await indexResp.text();
  
      // 7. Find the 10-K document link
      const docUrlMatch = indexHtml.match(/href="([^"]+\.htm)"/i);
  
      if (!docUrlMatch || !docUrlMatch[1]) {
        throw new Error("10-K HTML document not found in index.");
      }
  
      const docPath = docUrlMatch[1];
      const fullDocUrl = `https://www.sec.gov${docPath}`;
  
      console.log(`Downloading 10-K document: ${fullDocUrl}`);
  
      // 8. Fetch the 10-K document
      const docResp = await fetch(fullDocUrl, { headers });
      const docHtml = await docResp.text();
  
      return docHtml; // 🎯 Return the 10-K HTML content
    } catch (error) {
      console.error("Error fetching 10-K:", error.message);
      throw error;
    }
  }

export { fetch8KHtmlFromTicker };
  