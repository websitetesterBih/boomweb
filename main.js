let lastScroll = 0;
const header = document.getElementById("header_container");
const headerDate = document.getElementById("header_date_container");
const landingContainer = document.getElementById("landing_container");
const menuItems = document.getElementById("menu_items");
const menuButton = document.getElementById("menuButton");
const menuIcon = document.getElementById("menuHeaderIcon");
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

  if (currentScroll > lastScroll) {
    // Scrolling down → hide header
    header.style.transform = "translateY(-100%)";
    menuItems.classList.remove("menu-visible");
    menuOpen = false;
    menuIcon.style.transform = "rotate(0deg)";
    // headerDate moves to top of page
    headerDate.style.top = "0";
    landingContainer.style.marginTop = "0px";
  } else {
    // Scrolling up → show header
    header.style.transform = "translateY(0)";
    // headerDate moves just below header
    headerDate.style.top = `${headerHeight}px`;
    landingContainer.style.marginTop = "135px";
  }

  lastScroll = currentScroll;
});

// Also call once immediately in case the script loads after DOM rendering
// but before the `load` event (ensures correct initial placement).
updateHeaderDatePosition();

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
