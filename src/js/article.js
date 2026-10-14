// js/article.js
// Used by article.html?id=<id>
// What it does:
//   1. Reads the id from the address bar and checks it is safe
//   2. Loads data/articles.json (title, date, cover ...) and content/articles/<id>.md (the text)
//   3. Uses marked to turn the Markdown into HTML, then builds the page

var root = document.getElementById("article-root");
var SITE_NAME = "Jen-Fu Huang";

// An id may only contain lowercase letters, digits and hyphens
var ID_PATTERN = /^[a-z0-9-]+$/;

// "2026-09-15" -> "Sep 15, 2026" (same helper as in articles.js)
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

// Small helper: create an element with a class and some (safe) text
function makeElement(tag, className, text) {
  var element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}

// If the text contains Chinese characters, tell the browser (lang="zh-Hant") so it picks the right font
function setLanguage(element, text) {
  if (/[一-鿿]/.test(text)) {
    element.lang = "zh-Hant";
  }
}

// Show a friendly message instead of the article (not found, load error ...)
function showMessage(heading, message) {
  document.title = heading + " · " + SITE_NAME;
  root.replaceChildren();

  var box = makeElement("div", "state-box");
  box.style.margin = "3rem 1rem";
  box.appendChild(makeElement("h1", "", heading));
  box.appendChild(makeElement("p", "", message));

  var back = makeElement("a", "", "← Back to all articles");
  back.href = "articles.html";
  box.appendChild(back);

  root.appendChild(box);
}

// Fetch a file and return its text. Throws an error if the file is missing.
function fetchText(url) {
  return fetch(url).then(function (response) {
    if (!response.ok) {
      throw new Error("HTTP " + response.status + " for " + url);
    }
    return response.text();
  });
}

// Make the Markdown HTML a little nicer after marked has created it
function polishBody(prose) {
  // Images: lazy loading
  prose.querySelectorAll("img").forEach(function (image) {
    image.loading = "lazy";
  });
  // Tables: wrap them so wide tables can scroll sideways on phones
  prose.querySelectorAll("table").forEach(function (table) {
    var wrapper = makeElement("div", "table-wrap");
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
  // Links that leave my site open in a new tab
  prose.querySelectorAll("a[href^='http']").forEach(function (link) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

// Build the "Previous / Next" link box
function makePagerLink(article, label, extraClass) {
  var link = makeElement("a", extraClass);
  link.href = "article.html?id=" + encodeURIComponent(article.id);
  link.appendChild(makeElement("span", "pager__label", label));
  link.appendChild(makeElement("span", "pager__title", article.title));
  return link;
}

// Put everything on the page
function renderArticle(article, markdown, older, newer) {
  document.title = article.title + " · " + SITE_NAME;
  root.replaceChildren();

  // --- Title block (thin tan line on the left) ---
  var head = makeElement("header", "reader-head");
  var block = makeElement("div", "title-block");

  var metaParts = [article.category];
  if (article.date) {
    metaParts.push(formatDate(article.date));
  }
  if (article.place) {
    metaParts.push(article.place);
  }
  block.appendChild(makeElement("p", "title-block__meta", metaParts.join(" · ")));

  var title = makeElement("h1", "", article.title);
  setLanguage(title, article.title);
  block.appendChild(title);

  if (article.subtitle) {
    var subtitle = makeElement("p", "title-block__subtitle", article.subtitle);
    setLanguage(subtitle, article.subtitle);
    block.appendChild(subtitle);
  }
  head.appendChild(block);
  root.appendChild(head);

  // --- ONE wide cover image, directly under the title block ---
  var figure = makeElement("figure", "cover");
  var cover = document.createElement("img");
  cover.src = article.cover;
  cover.alt = article.caption ? article.caption : "Cover image for " + article.title;
  cover.loading = "lazy";
  if (article.coverFit === "contain") {
    cover.classList.add("is-contain"); // show the whole picture (e.g. a book cover) instead of cropping it
  }
  figure.appendChild(cover);
  if (article.caption) {
    figure.appendChild(makeElement("figcaption", "", article.caption));
  }
  root.appendChild(figure);

  // --- Article text (Markdown -> HTML) ---
  var prose = makeElement("article", "prose");
  if (markdown === null) {
    prose.appendChild(makeElement("p", "", "Sorry, the text of this article could not be loaded."));
  } else if (typeof marked === "undefined") {
    // The marked library did not load (for example, no internet): show the plain text instead
    prose.style.whiteSpace = "pre-wrap";
    prose.textContent = markdown;
  } else {
    // marked.parse() converts Markdown to an HTML string.
    // This is safe here because the .md files are written by me, not by visitors.
    prose.innerHTML = marked.parse(markdown, { breaks: true }); // breaks: true = a single new line becomes a line break
    polishBody(prose);
  }
  setLanguage(prose, markdown || "");
  root.appendChild(prose);

  // --- End of article: tags, previous/next, back link ---
  var end = makeElement("footer", "article-end");

  if (article.tags && article.tags.length > 0) {
    var tagList = makeElement("ul", "tag-list");
    tagList.setAttribute("aria-label", "Tags");
    article.tags.forEach(function (tag) {
      var item = document.createElement("li");
      item.appendChild(makeElement("span", "tag", tag));
      tagList.appendChild(item);
    });
    end.appendChild(tagList);
  }

  var pager = makeElement("nav", "pager");
  pager.setAttribute("aria-label", "More articles");
  if (older) {
    pager.appendChild(makePagerLink(older, "← Previous article", "pager__prev"));
  }
  if (newer) {
    pager.appendChild(makePagerLink(newer, "Next article →", "pager__next"));
  }
  if (older || newer) {
    end.appendChild(pager);
  }

  var back = makeElement("a", "back-link", "Back to all articles");
  back.href = "articles.html";
  end.appendChild(back);

  root.appendChild(end);
}

// --- Start here ---
function start() {
  var id = new URLSearchParams(window.location.search).get("id");

  // 1. Check the id before using it anywhere
  if (!id || !ID_PATTERN.test(id)) {
    showMessage("Article not found", "This link does not point to an article.");
    return;
  }

  // 2. Load the list of articles (title, date, cover ...)
  fetchText("data/articles.json")
    .then(function (jsonText) {
      var articles = JSON.parse(jsonText);

      // Newest first, same order as the Home page
      articles.sort(function (a, b) {
        return b.date.localeCompare(a.date);
      });

      var position = articles.findIndex(function (item) {
        return item.id === id;
      });
      if (position === -1) {
        showMessage("Article not found", "I could not find an article called “" + id + "”.");
        return;
      }

      var article = articles[position];
      var older = articles[position + 1] || null; // "Previous article" = the older one
      var newer = articles[position - 1] || null; // "Next article" = the newer one

      // 3. Load the Markdown text. If it fails we still show the title and cover.
      return fetchText("content/articles/" + id + ".md")
        .catch(function (error) {
          console.error(error);
          return null;
        })
        .then(function (markdown) {
          renderArticle(article, markdown, older, newer);
        });
    })
    .catch(function (error) {
      console.error(error);
      showMessage("Something went wrong", "The article list could not be loaded. Please try again later.");
    });
}

start();
