import { fetch10KHtmlFromTicker } from "./sec-functions/fetch10K.js";
import { fetch10QHtmlFromTicker } from "./sec-functions/fetch10Q.js";
import { fetch8KHtmlFromTicker } from "./sec-functions/fetch8K.js";
import { fetchCikFromTicker } from "./sec-functions/fetchCikFromTicker.js";

async function runTests() {
    console.log("Running tests...\n");
  
    // Test 1: fetch10QHtmlFromTicker
    try {
      console.log(await fetchCikFromTicker("AAPL"));
      console.log("Testing fetch10QHtmlFromTicker with AAPL...");
      const tenQHtml = await fetch10QHtmlFromTicker("AAPL");
      if (typeof tenQHtml === "string" && tenQHtml.includes("<html")) {
        console.log("✅ fetch10QHtmlFromTicker passed.\n");
      } else {
        console.error("❌ fetch10QHtmlFromTicker failed.\n");
      }
    } catch (err) {
      console.error("❌ fetch10QHtmlFromTicker threw error:", err.message, "\n");
    }
  
    // Test 2: fetch8KHtmlFromTicker
    try {
      console.log("Testing fetch8KHtmlFromTicker with AAPL...");
      const eightKHtml = await fetch8KHtmlFromTicker("AAPL");
      if (typeof eightKHtml === "string" && eightKHtml.includes("<html")) {
        console.log("✅ fetch8KHtmlFromTicker passed.\n");
      } else {
        console.error("❌ fetch8KHtmlFromTicker failed.\n");
      }
    } catch (err) {
      console.error("❌ fetch8KHtmlFromTicker threw error:", err.message, "\n");
    }
  
    // Test 3: fetch10KHtmlFromTicker (if you have it)
    try {
      console.log("Testing fetch10KHtmlFromTicker with AAPL...");
      const tenKHtml = await fetch10KHtmlFromTicker("AAPL");
      if (typeof tenKHtml === "string" && tenKHtml.includes("<html")) {
        console.log("✅ fetch10KHtmlFromTicker passed.\n");
      } else {
        console.error("❌ fetch10KHtmlFromTicker failed.\n");
      }
    } catch (err) {
      console.error("❌ fetch10KHtmlFromTicker threw error:", err.message, "\n");
    }
  }
  
  runTests();