/**
 * Fetches the SEC CIK for a given ticker symbol by consulting the
 * master mapping JSON at sec.gov. Returns the zero-padded 10-digit CIK.
 */
async function fetchCikFromTicker(ticker) {
    const headers = {
      "User-Agent": "arosen64@jh.edu",  // SEC policy requires a real contact here
    };
  
    // 1. Pull the master list of tickers → CIKs
    const mapUrl = "https://www.sec.gov/files/company_tickers.json";
    const resp = await fetch(mapUrl, { headers });
    if (!resp.ok) {
      throw new Error(`Failed to load ticker map: ${resp.statusText}`);
    }
  
    // 2. Parse and convert to array
    const mapObj = await resp.json();
    const entries = Object.values(mapObj);
  
    // 3. Find the matching entry
    const entry = entries.find(item =>
      item.ticker.toLowerCase() === ticker.toLowerCase()
    );
    if (!entry) {
      throw new Error(`Ticker ${ticker} not found in company_tickers.json`);
    }
  
    // 4. Zero-pad to 10 digits and return
    return entry.cik_str.toString().padStart(10, "0");
  }
  
  export { fetchCikFromTicker };
  