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

// Language switching functionality
async function loadTranslations() {
  // Use fetch + Promise.all to load both translation files in parallel.
  // Note: when serving files via file:// in some browsers this will fail
  // due to CORS — run a local web server (http://) when testing.
  try {
    const [enResp, bsResp] = await Promise.all([
      fetch("./en.json"),
      fetch("./bs.json"),
    ]);

    if (!enResp.ok || !bsResp.ok) {
      throw new Error(
        `Failed to fetch translations: en ${enResp.status}, bs ${bsResp.status}`
      );
    }

    translations.en = await enResp.json();
    translations.bs = await bsResp.json();
    updatePageLanguage();
  } catch (err) {
    console.error("Error loading translations:", err);
    // Try a sequential fallback (best-effort) so partial loads still work
    try {
      const enResp = await fetch("./en.json");
      if (enResp.ok) translations.en = await enResp.json();

      const bsResp = await fetch("./bs.json");
      if (bsResp.ok) translations.bs = await bsResp.json();

      if (translations.en || translations.bs) updatePageLanguage();
    } catch (err2) {
      console.error("Secondary fetch attempt failed:", err2);
    }
  }
}

function updatePageLanguage() {
  const t = translations[currentLanguage];
  if (!t) return;

  // Update menu items
  document.querySelectorAll(".menu-item").forEach((item, index) => {
    item.textContent = Object.values(t.menu)[index];
  });

  // Update header date
  document.querySelector("#date span").textContent = t.header.saveTheDate;
  document.querySelector("#date").lastChild.textContent =
    " " + t.header.dateLocation;

  // Update landing title
  const titleWords = t.landing.title.split(" ");
  landingContainer.querySelector("h3").innerHTML =
    titleWords.slice(0, 2).join(" ") +
    " <br/>" +
    titleWords[2] +
    " <br/>" +
    titleWords[3];

  // Update info section
  document.querySelector("#info_container h3").textContent = t.info.title;
  document.querySelector("#info_container p").innerHTML =
    t.info.welcomeText + "<br/><br/>" + t.info.description;

  // Update meet section
  document.querySelector("#meet_container h3").textContent = t.meet.title;
  document.querySelectorAll(".person").forEach((person, index) => {
    const speaker = Object.values(t.meet.speakers)[index];
    person.querySelector("h4").textContent = speaker.name;
    person.querySelector("p").innerHTML = speaker.topics.join("<br/>");
  });

  // Update schedule section
  document.querySelector("#schedule_container h3").textContent =
    t.schedule.title;
  document.querySelector("#schedule_day1 .dayText1").textContent =
    t.schedule.day1.date;
  document.querySelector("#schedule_day1 .dayText2").textContent =
    t.schedule.day1.dayLabel;
  document.querySelector("#schedule_day2 .dayText1").textContent =
    t.schedule.day2.date;
  document.querySelector("#schedule_day2 .dayText2").textContent =
    t.schedule.day2.dayLabel;

  // Update form
  document.querySelector("#form_container h3").textContent = t.form.title;
  document.querySelectorAll("#excelForm input").forEach((input) => {
    input.placeholder = t.form.fields[input.name];
  });
  document.querySelector("#submitButton").textContent = t.form.submit;
  document.querySelector("#form_container p").innerHTML =
    t.form.note + "<br/>" + t.form.bank;

  // Update fees section
  document.querySelector("#fees_container h3").textContent = t.fees.title;
  const feesContainer = document.querySelector("#fees_textcontainer");
  const feesParagraphs = feesContainer.querySelectorAll("p");

  // Update each paragraph in order
  feesParagraphs[0].textContent = t.fees.mainText;
  feesParagraphs[1].textContent = t.fees.invoiceNote;
  feesParagraphs[2].textContent = t.fees.registrationFees;
  feesParagraphs[3].innerHTML = `<span class="fees_black">${t.fees.earlyRegistration.title}</span> <br/>${t.fees.earlyRegistration.text}`;
  feesParagraphs[4].innerHTML = `<span class="fees_black">${t.fees.lateRegistration.title}</span> <br/>${t.fees.lateRegistration.text}`;
  feesParagraphs[5].textContent = t.fees.dailyRegistration;
  feesParagraphs[6].textContent = t.fees.entitlements;
  feesParagraphs[7].textContent = t.fees.dailyNote;
  feesParagraphs[8].textContent = t.fees.importantNote;
  feesParagraphs[9].innerHTML = `${t.fees.paymentInfo} <br/>${t.fees.bankInfo}`;

  // Update footer
  document.querySelector("#footer_container p").textContent = t.footer.text;

  // Update flag
  languageFlag.src =
    currentLanguage === "en"
      ? "./images/header_imgs/flagofuk.png"
      : "./images/header_imgs/flagbosnia.png";
}

languageButton.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "bs" : "en";
  updatePageLanguage();
});

// Load translations when the page loads
loadTranslations();

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
