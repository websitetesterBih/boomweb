let lastScroll = 0;
const header = document.getElementById("header_container");
const headerDate = document.getElementById("header_date_container");
const landingContainer = document.getElementById("landing_container");
const menuItems = document.getElementById("menu_items");
const menuButton = document.getElementById("menuButton");
const menuIcon = document.getElementById("menuHeaderIcon");
const languageButton = document.getElementById("language_button");
const languageFlag = document.getElementById("language_flag");

// Language state
let currentLanguage = "en";
let translations = {
  en: null,
  bs: null,
};
let menuOpen = false;

// Helper: place the date container either at the top (when header is hidden)
// or directly below the header (when header visible). Uses header's
// bounding rect to determine visibility so it reacts to CSS transform changes
// and to header height changes caused by responsive layout.
function updateHeaderDatePosition() {
  if (!header || !headerDate) return;

  const headerRect = header.getBoundingClientRect();
  const headerHeight = header.offsetHeight;

  // If header's top is negative it has been moved off-screen (hidden).
  if (headerRect.top < 0) {
    headerDate.style.top = "0";
  } else {
    headerDate.style.top = `${headerHeight}px`;
  }
}

// Recalculate position on load and resize to handle header size changes
// (for example when the page becomes narrower/wider and header height changes).
window.addEventListener("load", updateHeaderDatePosition);
window.addEventListener("resize", updateHeaderDatePosition);

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  const headerHeight = header.offsetHeight;

  // Get section boundaries
  const landingSection = document.getElementById("landing_container");
  const infoSection = document.getElementById("info_container");
  const landingBottom =
    landingSection.getBoundingClientRect().bottom + window.pageYOffset;
  const infoRect = infoSection.getBoundingClientRect();
  const infoTop = infoRect.top + window.pageYOffset;

  // Only allow header hiding after the landing section
  const isPastLanding = currentScroll >= landingBottom;

  if (currentScroll > lastScroll && isPastLanding) {
    // Scrolling down after landing section → hide header
    header.style.transform = "translateY(-100%)";
    menuItems.classList.remove("menu-visible");
    menuOpen = false;
    menuIcon.style.transform = "rotate(0deg)";
    // headerDate moves to top of page
    headerDate.style.top = "0";
  } else {
    // Scrolling up or outside info section → show header
    header.style.transform = "translateY(0)";
    // headerDate moves just below header
    headerDate.style.top = `${headerHeight}px`;
  }

  lastScroll = currentScroll;
});

// Also call once immediately in case the script loads after DOM rendering
// but before the `load` event (ensures correct initial placement).
updateHeaderDatePosition();

// 1. Load saved language or default to English
let currentLang = localStorage.getItem("siteLang") || "en";

// 2. Load the correct translation file and apply it
async function loadLanguage(lang) {
  try {
    const res = await fetch(`./${lang}.json`);
    const translations = await res.json();

    // 3. Replace text for each ID
    for (const id in translations) {
      const el = document.getElementById(id);
      if (el) {
        // Special handling for elements with nested content (info_welcome has info_description span)
        if (id === "info_welcome") {
          // Reconstruct the paragraph with both welcome text and description span
          const descSpan = el.querySelector("#info_description");
          const descText = descSpan ? translations["info_description"] : "";
          el.innerHTML =
            translations[id] +
            '<br /><br /><span id="info_description">' +
            descText +
            "</span>";
        } else if (id === "info_description") {
          // Skip—already handled above
          continue;
        } else {
          // If translation contains HTML (e.g. <br />) use innerHTML,
          // otherwise set textContent to avoid injecting HTML unintentionally.
          const value = translations[id];
          if (typeof value === "string" && /<[^>]+>/.test(value)) {
            el.innerHTML = value;
          } else {
            el.textContent = value;
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error loading language file (${lang}):`, err);
  }
}

// 4. Toggle language on button click
document.getElementById("language_button").addEventListener("click", () => {
  currentLang = currentLang === "en" ? "bs" : "en";
  localStorage.setItem("siteLang", currentLang);
  loadLanguage(currentLang);

  // Update flag image based on current language
  const languageFlag = document.getElementById("language_flag");
  if (languageFlag) {
    languageFlag.src =
      currentLang === "en"
        ? "./images/header_imgs/flagofuk.webp"
        : "./images/header_imgs/flagbosnia.webp";
  }
});

// Also update form input placeholders when language changes
document.querySelectorAll("#excelForm input").forEach((input) => {
  const origPlaceholder = input.getAttribute("data-placeholder-key");
  if (!origPlaceholder) {
    // Store original placeholder key
    input.setAttribute("data-placeholder-key", input.name);
  }
});

// Override the language loading to also handle form inputs and complex updates
const originalLoadLanguage = loadLanguage;
window.loadLanguage = async function (lang) {
  await originalLoadLanguage(lang);

  // Update form input placeholders
  document.querySelectorAll("#excelForm input").forEach((input) => {
    const key = input.getAttribute("data-placeholder-key") || input.name;
    const formKey = `form_${key}`;

    // Try to get translation from localStorage cache or fetch
    fetch(`./${lang}.json`)
      .then((res) => res.json())
      .then((translations) => {
        if (translations[formKey]) {
          input.placeholder = translations[formKey];
        }
      });
  });

  // Update submit button text (special handling)
  const submitBtn = document.getElementById("form_submit");
  if (submitBtn) {
    fetch(`./${lang}.json`)
      .then((res) => res.json())
      .then((translations) => {
        if (translations["form_submit"]) {
          submitBtn.textContent = translations["form_submit"];
        }
      });
  }
};

// Handle menu toggling
menuButton.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent body click from immediately closing menu
  menuOpen = !menuOpen;
  menuIcon.style.transform = menuOpen ? "rotate(-90deg)" : "rotate(0deg)";
  menuItems.classList.toggle("menu-visible");
});

// Close menu when clicking outside
document.body.addEventListener("click", (e) => {
  if (
    menuOpen &&
    !menuItems.contains(e.target) &&
    !menuButton.contains(e.target)
  ) {
    menuOpen = false;
    menuIcon.style.transform = "rotate(0deg)";
    menuItems.classList.remove("menu-visible");
  }
});

// Handle smooth scrolling for menu items
document.querySelectorAll(".menu-item").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    // Close the menu
    menuOpen = false;
    menuIcon.style.transform = "rotate(0deg)";
    menuItems.classList.remove("menu-visible");

    // Get the target section
    const targetId = link.getAttribute("href").slice(1);
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      // Account for fixed header height
      const headerHeight = header.offsetHeight + headerDate.offsetHeight;
      const targetPosition = targetSection.offsetTop - headerHeight;

      // Smooth scroll to target
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  });
});

const form = document.getElementById("excelForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Stop normal form submission (no redirect)

  // Collect form data into an object
  const data = Object.fromEntries(new FormData(form));

  try {
    const response = await fetch(
      "https://boombackend-4g79.onrender.com/submit", // Your backend URL
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      alert("Form submitted successfully!");
      form.reset(); // Optional: clear the form after submission
    } else {
      alert("Error submitting form.");
    }
  } catch (err) {
    alert("Network or server error.");
    console.error(err);
  }
});

// Initialize language on page load
window.addEventListener("load", () => {
  loadLanguage(currentLang);

  // Set initial flag image
  const languageFlag = document.getElementById("language_flag");
  if (languageFlag) {
    languageFlag.src =
      currentLang === "en"
        ? "./images/header_imgs/flagofuk.webp"
        : "./images/header_imgs/flagbosnia.webp";
  }
});
