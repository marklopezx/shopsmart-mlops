// js/behavior.js
// ShopSmart MLOps - Secret Behavioral Tracking Engine

// 1. LINK DETECTOR: Keep track of whether they are just browsing our site, or actually leaving
let isNavigatingInternally = false;

document.addEventListener("click", (e) => {
  // If they click a link that points to our own website, they aren't abandoning!
  const link = e.target.closest("a");
  if (link && link.href.includes(window.location.hostname)) {
    isNavigatingInternally = true;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.toLowerCase();
  let pageCategory = "Informational"; // Default

  if (
    path.includes("product") ||
    path.includes("cart") ||
    path.includes("checkout") ||
    path.includes("categories")
  ) {
    pageCategory = "ProductRelated";
  } else if (
    path.includes("profile") ||
    path.includes("login") ||
    path.includes("register")
  ) {
    pageCategory = "Administrative";
  }

  // Add +1 to the visit count
  let currentCount = parseInt(sessionStorage.getItem(pageCategory)) || 0;
  sessionStorage.setItem(pageCategory, currentCount + 1);

  const startTime = Date.now();
  let timeSaved = false; // Prevent double-counting time

  // Helper function to stop the stopwatch and save the exact seconds
  function saveTimeSpent() {
    if (timeSaved) return; // Only save once per page
    const timeSpentSeconds = (Date.now() - startTime) / 1000;
    const durationKey = pageCategory + "_Duration";
    let currentDuration =
      parseFloat(sessionStorage.getItem(durationKey)) || 0.0;
    sessionStorage.setItem(durationKey, currentDuration + timeSpentSeconds);
    timeSaved = true;
  }

  // Save time when leaving page normally
  window.addEventListener("beforeunload", () => {
    saveTimeSpent();
  });

  // ------------------------------------------------------------------
  // ULTIMATE ABANDONMENT TRACKER
  // ------------------------------------------------------------------
  document.addEventListener("visibilitychange", () => {
    // If the tab is hidden AND they didn't just click an internal link
    if (document.visibilityState === "hidden" && !isNavigatingInternally) {
      // 1. Force the stopwatch to save the exact seconds RIGHT NOW
      saveTimeSpent();

      // 2. Build the payload
      const payload = buildSessionData(false);

      // 3. Use standard fetch with 'keepalive' to bypass the Beacon/CORS block!
      fetch("http://127.0.0.1:8000/log-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true, // CRITICAL: Forces browser to send data even after tab closes
      }).catch((err) => console.log("Tracking payload dropped", err));
    }
  });

  if (!sessionStorage.getItem("VisitorType")) {
    if (localStorage.getItem("shopsmart_cart")) {
      sessionStorage.setItem("VisitorType", "Returning_Visitor");
    } else {
      sessionStorage.setItem("VisitorType", "New_Visitor");
    }
  }
});

// ------------------------------------------------------------------
// Payload Builder
// ------------------------------------------------------------------
function buildSessionData(didPurchase) {
  const monthStr = new Date().toLocaleString("en-US", { month: "short" });
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return JSON.stringify({
    Administrative: parseInt(sessionStorage.getItem("Administrative")) || 0,
    Administrative_Duration:
      parseFloat(sessionStorage.getItem("Administrative_Duration")) || 0.0,
    Informational: parseInt(sessionStorage.getItem("Informational")) || 0,
    Informational_Duration:
      parseFloat(sessionStorage.getItem("Informational_Duration")) || 0.0,
    ProductRelated: parseInt(sessionStorage.getItem("ProductRelated")) || 0,
    ProductRelated_Duration:
      parseFloat(sessionStorage.getItem("ProductRelated_Duration")) || 0.0,

    BounceRates: 0.02,
    ExitRates: 0.04,
    PageValues: didPurchase ? 25.0 : 0.0,
    SpecialDay: 0.0,
    Month: monthStr,
    OperatingSystems: 2,
    Browser: 2,
    Region: 1,
    TrafficType: 2,
    VisitorType: sessionStorage.getItem("VisitorType") || "New_Visitor",
    Weekend: isWeekend,
    actual_revenue: didPurchase,
  });
}
