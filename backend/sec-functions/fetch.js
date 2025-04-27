import { fetchCikFromTicker } from "./fetchCikFromTicker.js";
import { loadSecApiKey } from '../server.js';
import { loadFMPApiKey } from '../server.js';
import { convert } from 'html-to-text';

async function fetchFilingSection(ticker, formType) {
  const headers = {
    'User-Agent': 'sebastianrincon04@gmail.com'
  }
    const apiKey = await loadFMPApiKey();
    const url = `https://financialmodelingprep.com/api/v3/sec_filings/${ticker}?type=${formType}&page=0&apikey=${apiKey}`;
    const response = await fetch(url, { headers });
    const data = await response.json();
    console.log(data[0].finalLink);
    const filingResponse = await fetch(data[0].finalLink, { headers });
    const html = await (await filingResponse.text());
    const text = convert(html, {
      wordwrap: 400,          // wrap at 130 chars
      selectors: [
        { selector: 'a', options: { hideLinkHrefIfSameAsText: true } }
      ]
    });
   // console.log(text);
    return text;
}

  export { fetchFilingSection };