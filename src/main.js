import { clinicConfig } from "./config.js";
import { ar } from "./translations/ar.js";
import { en } from "./translations/en.js";

const translations = { ar, en };

export async function initClinic() {
  console.log(`Initializing ${clinicConfig.name.en} Website...`);
  // Determine language based on URL path
  const isEnglish =
    window.location.pathname.includes("-en.html") ||
    window.location.pathname.includes("-en");
  const isArabic = !isEnglish;
  const currentLang = isArabic ? "ar" : "en";
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";

  // Inject the global header into any page with #site-header
  await injectHeader(currentLang);
  await injectFooter(currentLang);

  // Setup language toggle if it exists

  const setupToggle = (textId) => {
    const text = document.getElementById(textId);
    if (!text) return;

    let currentPath = window.location.pathname;
    if (currentPath === "/") {
      text.textContent = currentLang === "ar" ? "العربية" : "English";
      return;
    }
    text.textContent = currentLang === "ar" ? "العربية" : "English";
  };

  const setupDropdownLinks = () => {
    const btnAr = document.getElementById("lang-ar-btn");
    const btnEn = document.getElementById("lang-en-btn");
    const btnMobile = document.getElementById("lang-toggle-btn-mobile");
    const textMobile = document.getElementById("lang-toggle-text-mobile");

    let currentPath = window.location.pathname;
    if (currentPath.endsWith("/")) {
      currentPath = currentPath.slice(0, -1);
    }
    let cleanPath = currentPath.replace(".html", "").replace("-en", "");
    if (cleanPath === "") cleanPath = "/index";

    if (btnAr) btnAr.href = cleanPath;
    if (btnEn) btnEn.href = cleanPath + "-en";

    if (btnMobile && textMobile) {
      if (currentLang === "ar") {
        textMobile.textContent = "English";
        btnMobile.href = cleanPath + "-en";
      } else {
        textMobile.textContent = "العربية";
        btnMobile.href = cleanPath;
      }
    }
  };

  setupToggle("lang-toggle-text");
  setupDropdownLinks();

  applyConfigData(currentLang);
  //
  applyTranslations(currentLang); // Only for global header/footer/popup

  // Initialize Before/After Slider if on that page
  initBeforeAfterSliders();
  initPopup();
}

async function injectHeader(lang) {
  const headerContainer = document.getElementById("site-header");
  if (!headerContainer) return;

  try {
    let response = await fetch("/global_header.html");
    if (!response.ok) response = await fetch("/global_header");
    if (!response.ok) throw new Error("Header not found");
    let html = await response.text();
    headerContainer.innerHTML = html;
    console.log("Global Header injected successfully.");
  } catch (error) {
    console.error("Error loading global header:", error);
  }
}

async function injectFooter(lang) {
  const footerContainer = document.getElementById("site-footer");
  if (!footerContainer) return;

  try {
    let response = await fetch("/global_footer.html");
    if (!response.ok) response = await fetch("/global_footer");
    if (!response.ok) throw new Error("Footer not found");
    let html = await response.text();
    footerContainer.innerHTML = html;
    console.log("Global Footer injected successfully.");
  } catch (error) {
    console.error("Error loading global footer:", error);
  }
}

function applyConfigData(lang) {
  // Update Doctor Name
  document.querySelectorAll('[data-config="doctor-name"]').forEach((el) => {
    el.textContent = clinicConfig.name[lang];
  });

  // Update Doctor Title
  document.querySelectorAll('[data-config="doctor-title"]').forEach((el) => {
    el.textContent = clinicConfig.title[lang];
  });

  // Update Phone Numbers
  document.querySelectorAll('[data-config="phone"]').forEach((el) => {
    el.textContent = clinicConfig.phone;
    if (el.tagName.toLowerCase() === "a") {
      el.href = `tel:${clinicConfig.phone.replace(/\\s/g, "")}`;
    }
  });

  // Update WhatsApp Links
  document.querySelectorAll('[data-config="whatsapp"]').forEach((el) => {
    if (el.tagName.toLowerCase() === "a") {
      el.href = `https://wa.me/${clinicConfig.whatsapp.replace(/\\s|\\+|\\-/g, "")}`;
    }
  });

  // Update Facebook Links
  document.querySelectorAll('[data-config="facebook"]').forEach((el) => {
    if (el.tagName.toLowerCase() === "a") {
      el.href = clinicConfig.facebook;
    }
  });

  // Update Instagram Links
  document.querySelectorAll('[data-config="instagram"]').forEach((el) => {
    if (el.tagName.toLowerCase() === "a") {
      el.href = clinicConfig.instagram;
    }
  });

  // Update Emails
  document.querySelectorAll('[data-config="email"]').forEach((el) => {
    el.textContent = clinicConfig.email;
    if (el.tagName.toLowerCase() === "a") {
      el.href = `mailto:${clinicConfig.email}`;
    }
  });

  // Update Locations
  document.querySelectorAll('[data-config="location"]').forEach((el) => {
    el.textContent = clinicConfig.location[lang];
  });

  // Update Copyright
  document.querySelectorAll('[data-config="copyright"]').forEach((el) => {
    el.textContent = clinicConfig.copyright[lang];
  });

  // Translate header/footer services if english
  if (lang === "en") {
    const serviceTranslations = {
      "زراعة الأسنان": "Dental Implants",
      "ابتسامة هوليود": "Hollywood Smile",
      "الفينير واللومينير": "Veneers & Lumineers",
      "علاج الجذور": "Root Canal",
      "أسنان الأطفال": "Pediatric Dentistry",
      "توريد اللثة": "Gum Depigmentation",
      "الحشوات التجميلية": "Cosmetic Fillings",
      "تقويم الأسنان": "Orthodontics",
      "تبييض الأسنان": "Teeth Whitening",
      "تركيبات الأسنان": "Dental Crowns",
      الخدمات: "Services",
      التواصل: "Contact",
      "عن العيادة": "About Us",
      "قبل وبعد": "Before & After",
      فيديوهات: "Videos",
    };

    const containers = [
      document.getElementById("site-header"),
      document.getElementById("site-footer"),
    ];
    containers.forEach((container) => {
      if (!container) return;
      container.querySelectorAll("a, h4, p, span, button").forEach((el) => {
        // Find text nodes
        Array.from(el.childNodes).forEach((node) => {
          if (node.nodeType === 3) {
            const text = node.nodeValue.trim();
            if (serviceTranslations[text]) {
              node.nodeValue = node.nodeValue.replace(
                text,
                serviceTranslations[text],
              );
            }
          }
        });
      });
    });
  }

  // Translate hrefs for English
  if (lang === "en") {
    document.querySelectorAll("a").forEach((el) => {
      let href = el.getAttribute("href");
      if (
        href &&
        href.endsWith(".html") &&
        !href.endsWith("-en.html") &&
        !href.startsWith("http")
      ) {
        el.setAttribute("href", href.replace(".html", "-en.html"));
      }
    });
  }

  // Update Map Embed
  const mapIframe = document.querySelector('[data-config="map-embed"]');
  if (mapIframe && mapIframe.tagName.toLowerCase() === "iframe") {
    mapIframe.src = clinicConfig.mapEmbed;
  }
}

function applyTranslations(lang) {
  const t = translations[lang];
  if (!t) return;

  // Only target elements inside the global header, footer, and popup
  // to avoid overwriting the static translated page bodies.
  const targets = [
    document.getElementById("site-header"),
    document.getElementById("site-footer"),
    document.getElementById("booking-popup"),
  ];

  targets.forEach((container) => {
    if (!container) return;
    container.querySelectorAll("[data-t]").forEach((el) => {
      const key = el.getAttribute("data-t");
      const keys = key.split(".");
      let value = t;
      keys.forEach((k) => {
        value = value ? value[k] : null;
      });
      if (value) {
        // If it's a placeholder, update placeholder
        if (
          el.tagName.toLowerCase() === "input" &&
          el.hasAttribute("placeholder")
        ) {
          el.placeholder = value;
        } else {
          el.textContent = value;
        }
      }
    });
  });
}

function initBeforeAfterSliders() {
  const sliders = document.querySelectorAll(".slider-input");
  sliders.forEach((slider) => {
    slider.addEventListener("input", (e) => {
      const container = e.target.parentElement;
      const beforeImage = container.querySelector(".image-before");
      const handle = container.querySelector(".slider-handle");

      if (beforeImage && handle) {
        // Determine direction based on document direction

        // For RTL, 0% is right side, 100% is left side
        // Calculate clip percentage: e.target.value goes 0 to 100
        const isRtl = document.documentElement.dir === "rtl";
        const clipValue = isRtl ? e.target.value : 100 - e.target.value;
        const handlePos = isRtl ? 100 - e.target.value : e.target.value;

        // Update clip-path
        // RTL clip: inset(top right bottom left) -> inset(0 X% 0 0) where X decreases to reveal more
        if (isRtl) {
          beforeImage.style.clipPath = `inset(0 0 0 ${100 - e.target.value}%)`;
        } else {
          beforeImage.style.clipPath = `inset(0 ${100 - e.target.value}% 0 0)`;
        }

        // Update handle position
        if (isRtl) {
          handle.style.right = `${e.target.value}%`;
          handle.style.left = "auto";
        } else {
          handle.style.left = `${e.target.value}%`;
          handle.style.right = "auto";
        }
      }
    });

    // Trigger once to set initial state correctly based on RTL/LTR
    slider.dispatchEvent(new Event("input"));
  });
}

// Global initialization
window.addEventListener("DOMContentLoaded", initClinic);

// Popup Logic

function initPopup() {
  const popup = document.getElementById("booking-popup");
  const closeBtn = document.getElementById("close-popup");
  const form = document.getElementById("booking-form");

  if (!popup || !closeBtn || !form) return;

  // Translate UI immediately if arabic
  if (currentLang === "ar") {
    popup.querySelector('[data-t="popup.title"]').textContent = "احجز استشارتك";
    popup.querySelector('[data-t="popup.subtitle"]').textContent =
      "قم بملء البيانات بالأسفل وسنتواصل معك عبر واتساب لتأكيد موعدك.";
    popup.querySelector('[data-t="popup.name"]').textContent = "الاسم بالكامل";
    popup.querySelector("#popup-name").placeholder = "أدخل اسمك";
    popup.querySelector('[data-t="popup.phone"]').textContent = "رقم الهاتف";
    popup.querySelector('[data-t="popup.service"]').textContent =
      "الخدمة المطلوبة (اختياري)";
    popup.querySelector('[data-t="popup.submit"]').textContent =
      "إرسال عبر واتساب";

    // Select options
    const options = {
      "General Consultation": "استشارة عامة",
      "Dental Implants": "زراعة الأسنان",
      "Hollywood Smile": "ابتسامة هوليود",
      Veneers: "الفينير واللومينير",
      "Root Canal": "علاج الجذور",
      Pediatric: "أسنان الأطفال",
      "Gum Depigmentation": "توريد اللثة",
      "Cosmetic Fillings": "الحشوات التجميلية",
      Orthodontics: "تقويم الأسنان",
      "Teeth Whitening": "تبييض الأسنان",
      "Dental Crowns": "تركيبات الأسنان",
    };

    Array.from(document.getElementById("popup-service").options).forEach(
      (opt) => {
        if (options[opt.value]) opt.textContent = options[opt.value];
      },
    );
  }

  const openPopup = (e) => {
    e.preventDefault();
    popup.classList.remove("hidden");
    setTimeout(() => {
      popup.classList.remove("opacity-0");
      popup.firstElementChild.classList.remove("scale-95");
    }, 10);
  };

  const closePopupHandler = () => {
    popup.classList.add("opacity-0");
    popup.firstElementChild.classList.add("scale-95");
    setTimeout(() => {
      popup.classList.add("hidden");
    }, 300);
  };

  closeBtn.addEventListener("click", closePopupHandler);
  popup.addEventListener("click", (e) => {
    if (e.target === popup) closePopupHandler();
  });

  // Attach to all booking buttons
  // Find all buttons or links that have text like "Book Now" or "Schedule" or "احجز"
  const ctaKeywords = ["book", "schedule", "consult", "احجز", "موعد"];
  const allLinks = document.querySelectorAll("a, button");
  allLinks.forEach((el) => {
    const text = (el.textContent || "").toLowerCase();
    const href = el.getAttribute("href") || "";
    if (
      (ctaKeywords.some((kw) => text.includes(kw)) ||
        href.includes("wa.me") ||
        el.hasAttribute("data-popup")) &&
      !el.id.includes("lang-toggle")
    ) {
      // Exclude floating whatsapp button itself if you want, but it's fine.
      el.addEventListener("click", openPopup);
    }
  });

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("popup-name").value;
    const phone = document.getElementById("popup-phone").value;
    const service = document.getElementById("popup-service").value;

    const message = `Hello Prof. Dr. Ahmed Nabil,\nI would like to book a consultation.\nName: ${name}\nPhone: ${phone}\nService: ${service}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${clinicConfig.whatsapp.replace(/\s|\+|\-/g, "")}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    closePopupHandler();
    form.reset();
  });
}
