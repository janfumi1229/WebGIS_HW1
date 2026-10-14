// js/articles.js
// Used by articles.html (the Articles page).
// What it does:
//   1. Loads data/articles.json with fetch()
//   2. Builds one card for each article (newest first)
//   3. Filters the cards when a category chip is clicked

// --- Find the parts of the page we need ---
var cardList = document.getElementById("article-list");
var statusLine = document.getElementById("articles-status");
var chips = document.querySelectorAll(".chip");

// All articles from the JSON file are kept here
var allArticles = [];

// "2026-09-15" -> "Sep 15, 2026". If the date is not a real date (for example "[CHECK]"), show it as it is.
function formatDate(text) {
  // Year only ("2026") is shown as it is
  if (/^\d{4}-\d{2}$/.test(text)) {   // "2026-07" -> "Jul 2026"
    return new Date(text + "-01T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }
  var date = new Date(text + "T00:00:00Z");
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

// Small helper: create an element, give it a class and some text
function makeElement(tag, className, text) {
  var element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text; // textContent is safe: it never runs HTML from the data
  }
  return element;
}

// Build the HTML for ONE article card
function makeCard(article) {
  var item = document.createElement("li");

  // The whole card is one link to article.html?id=<id>
  var link = makeElement("a", "card");
  link.href = "article.html?id=" + encodeURIComponent(article.id);

  var thumb = document.createElement("img");
  thumb.className = "card__thumb";
  thumb.src = article.cover;
  thumb.alt = article.caption ? article.caption : "Cover image for " + article.title;
  thumb.loading = "lazy";
  if (article.coverFit === "contain") {
    thumb.classList.add("is-contain"); // show the whole picture (e.g. a book cover) instead of cropping it
  }

  var body = makeElement("div", "card__body");
  body.appendChild(makeElement("h2", "card__title", article.title));

  // #hashtags made from the "tags" list in articles.json
  if (article.tags && article.tags.length > 0) {
    var tagList = makeElement("ul", "card__tags");
    article.tags.forEach(function (tag) {
      tagList.appendChild(makeElement("li", "", "#" + tag));
    });
    body.appendChild(tagList);
  }

  // Date + category badge (data-category lets the CSS pick a colour)
  var meta = makeElement("div", "card__meta");
  if (article.date) {
    meta.appendChild(makeElement("time", "", formatDate(article.date)));
  }
  var badge = makeElement("span", "tag", article.category);
  badge.dataset.category = article.category;
  meta.appendChild(badge);
  body.appendChild(meta);

  body.appendChild(makeElement("p", "card__summary", article.summary));

  link.appendChild(thumb);
  link.appendChild(body);
  item.appendChild(link);
  return item;
}

// Show the cards for one category ("All" shows everything)
function showCategory(category) {
  var visible = allArticles;
  if (category !== "All") {
    visible = allArticles.filter(function (article) {
      return article.category === category;
    });
  }

  cardList.replaceChildren(); // remove the old cards

  if (visible.length === 0) {
    statusLine.textContent = "No articles in this category yet.";
    return;
  }

  visible.forEach(function (article) {
    cardList.appendChild(makeCard(article));
  });
  statusLine.textContent = visible.length + (visible.length === 1 ? " article" : " articles");
}

// When a chip is clicked: mark it as pressed and show that category
chips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    chips.forEach(function (other) {
      other.setAttribute("aria-pressed", "false");
    });
    chip.setAttribute("aria-pressed", "true");
    showCategory(chip.dataset.category);
  });
});

// Load the JSON file, then show all articles
fetch("data/articles.json")
  .then(function (response) {
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    return response.json(); // turn the JSON text into a JavaScript array
  })
  .then(function (articles) {
    // Newest first. Dates look like "2026-09-15", so comparing them as text works.
    allArticles = articles.sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });
    showCategory("All");
  })
  .catch(function (error) {
    console.error("Could not load data/articles.json:", error);
    statusLine.textContent = "Sorry, the article list could not be loaded. Please try again later.";
  });
