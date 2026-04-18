/**
 * @file script.js
 * @description Core logic for the Human Firewall application. Handles Universal Dark Mode,
 * interactive UI components (Modals, Accordions), and the 20-scenario Simulation Engine.
 */

// ==========================================================================
// 1. SCENARIO DATASET (20 Scenarios)
// ==========================================================================
const SCENARIOS = [
  // --- EMAIL SCENARIOS (10) ---
  {
    id: "email_01",
    type: "email",
    isPhishing: true,
    difficulty: "medium",
    title: "Google Security Alert",
    content: `
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-lg text-on-surface leading-tight">Google Security <span class="font-normal text-slate-500 text-sm ml-1">&lt;security@goog1e-account.com&gt;</span></h3>
            </div>
            <h4 class="font-extrabold text-on-surface uppercase text-xs tracking-tight mb-4">Subject: Suspicious sign-in attempt detected</h4>
            <p class="mb-4">We noticed a sign-in attempt from a new device in Russia.</p>
            <p class="mb-6">If this was not you, secure your account immediately:</p>
            <a href="#" class="text-blue-600 underline font-medium">Review Activity (http://google-account-security-alert.xyz)</a>
        `,
    attackType: "Phishing",
    humanFactor: "Fear + Urgency",
    defenseTips: [
      "Check sender domain carefully (goog1e vs google)",
      "Hover over links before clicking",
    ],
    correctAction: "report",
    explanation:
      "The domain 'goog1e-account.com' uses a number '1' instead of an 'l'. The link points to an unofficial .xyz domain.",
  },
  {
    id: "email_02",
    type: "email",
    isPhishing: false,
    difficulty: "medium",
    title: "Google Security Notification",
    content: `
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-lg text-on-surface leading-tight">Google <span class="font-normal text-slate-500 text-sm ml-1">&lt;no-reply@accounts.google.com&gt;</span></h3>
            </div>
            <h4 class="font-extrabold text-on-surface uppercase text-xs tracking-tight mb-4">Subject: New sign-in from Chrome on Mac</h4>
            <p class="mb-4">You signed in on a new device.</p>
            <p class="mb-6">If this was you, no action is needed. If it wasn't, please check your activity.</p>
            <a href="#" class="text-blue-600 underline font-medium">Check Activity (https://myaccount.google.com/security)</a>
        `,
    attackType: "Legitimate",
    humanFactor: "Trust",
    defenseTips: [
      "Verify the sender domain is exactly google.com",
      "Check that the URL uses HTTPS and the correct domain",
    ],
    correctAction: "reply",
    explanation:
      "The sender domain and link are legitimate Google domains. No phishing indicators are present.",
  },
  {
    id: "email_03",
    type: "email",
    isPhishing: true,
    difficulty: "easy",
    title: "Netflix Billing Issue",
    content: `
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-lg text-on-surface leading-tight">Netflix Support <span class="font-normal text-slate-500 text-sm ml-1">&lt;billing@netfIix-support.com&gt;</span></h3>
            </div>
            <h4 class="font-extrabold text-on-surface uppercase text-xs tracking-tight mb-4">Subject: Payment Declined - Account Suspension</h4>
            <p class="mb-4">We were unable to process your last payment. Your account will be suspended in 24 hours.</p>
            <a href="#" class="bg-red-600 text-white px-4 py-2 rounded font-bold inline-block">Update Payment Details</a>
            <p class="mt-2 text-xs text-slate-500">(Link points to: http://netflix-account-billing.com/update)</p>
        `,
    attackType: "Phishing",
    humanFactor: "Urgency + Fear",
    defenseTips: [
      "Look for spelling tricks (capital I instead of lowercase l)",
      "Never click billing links in emails",
    ],
    correctAction: "report",
    explanation:
      "'netfIix' uses a capital 'I' instead of an 'l'. The link is not an official Netflix domain.",
  },
  {
    id: "email_04",
    type: "email",
    isPhishing: false,
    difficulty: "easy",
    title: "Netflix Payment Confirmation",
    content: `
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-lg text-on-surface leading-tight">Netflix <span class="font-normal text-slate-500 text-sm ml-1">&lt;info@mailer.netflix.com&gt;</span></h3>
            </div>
            <h4 class="font-extrabold text-on-surface uppercase text-xs tracking-tight mb-4">Subject: Your payment was successful</h4>
            <p class="mb-4">Hi there, your monthly subscription payment has been successfully processed.</p>
            <p>Enjoy watching!</p>
        `,
    attackType: "Legitimate",
    humanFactor: "Normal communication",
    defenseTips: [
      "Check sender domain",
      "Note the lack of urgent requests or suspicious links",
    ],
    correctAction: "reply",
    explanation:
      "This is a standard notification with no suspicious links or pressure to act.",
  },
  {
    id: "email_05",
    type: "email",
    isPhishing: true,
    difficulty: "hard",
    title: "Urgent Request from CEO",
    content: `
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-lg text-on-surface leading-tight">Sarah Thompson (CEO) <span class="font-normal text-slate-500 text-sm ml-1">&lt;ceo@company-mail.co&gt;</span></h3>
            </div>
            <h4 class="font-extrabold text-on-surface uppercase text-xs tracking-tight mb-4">Subject: URGENT: Wire Transfer Needed</h4>
            <p class="mb-4">I'm heading into a board meeting and need you to process a highly confidential vendor payment immediately.</p>
            <p class="mb-4">Please reply to this email so I can send you the wire instructions. Do not discuss this with anyone else.</p>
            <p>- Sarah</p>
        `,
    attackType: "Business Email Compromise (BEC)",
    humanFactor: "Authority + Urgency",
    defenseTips: [
      "Verify requests involving money independently (call or message via Slack/Teams)",
    ],
    correctAction: "report",
    explanation:
      "The domain is slightly altered (.co instead of .com). The request bypasses normal procedures and demands secrecy.",
  },
  {
    id: "email_06",
    type: "email",
    isPhishing: true,
    difficulty: "medium",
    title: "Invoice Attached",
    content: `
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-lg text-on-surface leading-tight">Accounts Payable <span class="font-normal text-slate-500 text-sm ml-1">&lt;invoice@pay-billing.net&gt;</span></h3>
            </div>
            <h4 class="font-extrabold text-on-surface uppercase text-xs tracking-tight mb-4">Subject: Overdue Invoice #88392</h4>
            <p class="mb-4">Please find attached the overdue invoice for last month's services. Kindly process payment to avoid late fees.</p>
            <div class="p-3 border border-slate-300 dark:border-slate-700 rounded flex items-center gap-2 w-max">
                <span class="material-symbols-outlined text-red-500">picture_as_pdf</span>
                <span class="font-medium">Invoice_88392.pdf.exe</span>
            </div>
        `,
    attackType: "Malware/Phishing",
    humanFactor: "Curiosity + Fear",
    defenseTips: [
      "Never open unexpected attachments",
      "Check file extensions carefully (.exe disguised as .pdf)",
    ],
    correctAction: "report",
    explanation:
      "The attachment has a double extension (.pdf.exe), which is a classic malware delivery technique.",
  },
  {
    id: "email_07",
    type: "email",
    isPhishing: false,
    difficulty: "medium",
    title: "Team Meeting Update",
    content: `
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-lg text-on-surface leading-tight">HR Department <span class="font-normal text-slate-500 text-sm ml-1">&lt;hr@yourcompany.com&gt;</span></h3>
            </div>
            <h4 class="font-extrabold text-on-surface uppercase text-xs tracking-tight mb-4">Subject: All-Hands Meeting Moved</h4>
            <p class="mb-4">Hi team, just a quick note that today's All-Hands meeting has been moved to 2:00 PM EST.</p>
            <p>The calendar invite has been updated automatically.</p>
        `,
    attackType: "Legitimate",
    humanFactor: "Routine",
    defenseTips: [
      "Check context and sender",
      "Note the absence of links or requests for data",
    ],
    correctAction: "reply",
    explanation:
      "Matches expected internal communication with no malicious payload.",
  },
  {
    id: "email_08",
    type: "email",
    isPhishing: true,
    difficulty: "medium",
    title: "IT: Password Expiry",
    content: `
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-lg text-on-surface leading-tight">IT Helpdesk <span class="font-normal text-slate-500 text-sm ml-1">&lt;support@secure-login-portal.co&gt;</span></h3>
            </div>
            <h4 class="font-extrabold text-on-surface uppercase text-xs tracking-tight mb-4">Subject: Action Required: Password Expires in 2 Hours</h4>
            <p class="mb-4">Your corporate password will expire in 2 hours. You will lose access to your email if you do not update it now.</p>
            <a href="#" class="text-blue-600 underline font-medium">Keep Same Password (http://secure-login-portal.co/auth)</a>
        `,
    attackType: "Credential Harvesting",
    humanFactor: "Urgency",
    defenseTips: ["IT will never provide a link to 'keep the same password'"],
    correctAction: "report",
    explanation:
      "Unknown domain, artificial urgency, and the illogical offer to 'keep the same password' via a link.",
  },
  {
    id: "email_09",
    type: "email",
    isPhishing: true,
    difficulty: "easy",
    title: "Package Delivery Failed",
    content: `
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-lg text-on-surface leading-tight">FedEx Delivery <span class="font-normal text-slate-500 text-sm ml-1">&lt;tracking@fedx-delivery-alerts.com&gt;</span></h3>
            </div>
            <h4 class="font-extrabold text-on-surface uppercase text-xs tracking-tight mb-4">Subject: Missed Delivery - Action Required</h4>
            <p class="mb-4">We tried to deliver your package today but no one was home. Please pay the $2.99 redelivery fee to schedule a new time.</p>
            <a href="#" class="text-blue-600 underline font-medium">Schedule Redelivery (http://fedx-delivery-alerts.com/pay)</a>
        `,
    attackType: "Phishing",
    humanFactor: "Curiosity + Greed",
    defenseTips: [
      "Be wary of unexpected delivery notices",
      "Couriers rarely ask for small redelivery fees via email links",
    ],
    correctAction: "report",
    explanation:
      "The domain is misspelled ('fedx'), and asking for a small fee is a common tactic to steal credit card details.",
  },
  {
    id: "email_10",
    type: "email",
    isPhishing: false,
    difficulty: "hard",
    title: "Bank Statement Available",
    content: `
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-lg text-on-surface leading-tight">Chase Bank <span class="font-normal text-slate-500 text-sm ml-1">&lt;alerts@chase.com&gt;</span></h3>
            </div>
            <h4 class="font-extrabold text-on-surface uppercase text-xs tracking-tight mb-4">Subject: Your monthly statement is ready</h4>
            <p class="mb-4">Your statement for the period ending yesterday is now available online.</p>
            <p>Log in to your account at chase.com or use the mobile app to view it.</p>
        `,
    attackType: "Legitimate",
    humanFactor: "Awareness",
    defenseTips: [
      "Notice that the email tells you to log in manually rather than providing a direct link",
    ],
    correctAction: "reply",
    explanation:
      "Legitimate bank emails usually instruct you to log in via the app or by typing the URL yourself, avoiding direct links.",
  },

  // --- SMS SCENARIOS (5) ---
  {
    id: "sms_01",
    type: "sms",
    isPhishing: true,
    difficulty: "easy",
    title: "Bank SMS Alert",
    content: `<div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-2xl rounded-tl-none max-w-[80%]"><p>CHASE: Your account is locked due to suspicious activity. Visit bit.ly/chase-secure-now to verify your identity.</p></div>`,
    attackType: "Smishing",
    humanFactor: "Urgency + Fear",
    defenseTips: ["Banks do not use URL shorteners (bit.ly)"],
    correctAction: "report",
    explanation:
      "Shortened links and extreme urgency are classic smishing red flags.",
  },
  {
    id: "sms_02",
    type: "sms",
    isPhishing: false,
    difficulty: "easy",
    title: "OTP Code",
    content: `<div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-2xl rounded-tl-none max-w-[80%]"><p>Your Microsoft verification code is 839201. Do not share this code with anyone.</p></div>`,
    attackType: "Legitimate",
    humanFactor: "Routine",
    defenseTips: ["Never share OTPs", "Ensure you actually requested the code"],
    correctAction: "reply",
    explanation: "This is a standard, legitimate OTP message with no links.",
  },
  {
    id: "sms_03",
    type: "sms",
    isPhishing: true,
    difficulty: "medium",
    title: "USPS Delivery SMS",
    content: `<div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-2xl rounded-tl-none max-w-[80%]"><p>USPS: Your package is on hold due to an incorrect address. Update here: usps-post-tracking.xyz/update</p></div>`,
    attackType: "Smishing",
    humanFactor: "Curiosity",
    defenseTips: [
      "Check the URL carefully",
      "USPS will not send unsolicited texts with links",
    ],
    correctAction: "report",
    explanation: "The URL is a fake .xyz domain, not the official usps.com.",
  },
  {
    id: "sms_04",
    type: "sms",
    isPhishing: true,
    difficulty: "medium",
    title: "Lottery Win",
    content: `<div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-2xl rounded-tl-none max-w-[80%]"><p>Congratulations! Your number was selected to win a $1,000 Amazon Gift Card. Claim it now: amzn-rewards-claim.com</p></div>`,
    attackType: "Smishing",
    humanFactor: "Greed",
    defenseTips: ["If it sounds too good to be true, it is"],
    correctAction: "report",
    explanation:
      "Classic baiting technique using a fake domain to steal information.",
  },
  {
    id: "sms_05",
    type: "sms",
    isPhishing: false,
    difficulty: "medium",
    title: "Telco Alert",
    content: `<div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-2xl rounded-tl-none max-w-[80%]"><p>Verizon: You have used 90% of your monthly data allowance. Data speeds may be reduced soon.</p></div>`,
    attackType: "Legitimate",
    humanFactor: "Routine",
    defenseTips: ["Notice the lack of links or requests for personal info"],
    correctAction: "reply",
    explanation: "A standard informational alert from a service provider.",
  },

  // --- VISHING SCENARIOS (2) ---
  {
    id: "vishing_01",
    type: "vishing",
    isPhishing: true,
    difficulty: "hard",
    title: "IT Support Call",
    content: `
            <div class="flex items-center gap-4 mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <span class="material-symbols-outlined text-4xl text-blue-600">support_agent</span>
                <div>
                    <p class="font-bold">Incoming Call: "IT Helpdesk"</p>
                    <p class="text-sm text-slate-500">00:14</p>
                </div>
            </div>
            <p class="italic text-slate-700 dark:text-slate-300">"Hi, this is Mike from IT. We're seeing some unusual activity on your VPN account. I need to verify your identity to stop the lockout. Can you read me the 6-digit code I just texted you?"</p>
        `,
    attackType: "Vishing",
    humanFactor: "Authority + Urgency",
    defenseTips: ["IT will never ask for your MFA/OTP code"],
    correctAction: "report",
    explanation:
      "The attacker is trying to bypass Multi-Factor Authentication by tricking you into reading the code to them.",
  },
  {
    id: "vishing_02",
    type: "vishing",
    isPhishing: false,
    difficulty: "medium",
    title: "Customer Support Callback",
    content: `
            <div class="flex items-center gap-4 mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <span class="material-symbols-outlined text-4xl text-blue-600">support_agent</span>
                <div>
                    <p class="font-bold">Incoming Call: "Apple Support"</p>
                    <p class="text-sm text-slate-500">00:22</p>
                </div>
            </div>
            <p class="italic text-slate-700 dark:text-slate-300">"Hello, this is Sarah from Apple Support returning your call about your repair ticket. Are you still experiencing issues with your screen?"</p>
        `,
    attackType: "Legitimate",
    humanFactor: "Routine",
    defenseTips: ["Verify that you actually initiated a ticket recently"],
    correctAction: "reply",
    explanation:
      "A legitimate callback regarding an existing ticket, with no requests for sensitive data.",
  },

  // --- LOGIN PAGE SCENARIOS (3) ---
  {
    id: "login_01",
    type: "login",
    isPhishing: true,
    difficulty: "hard",
    title: "Fake Microsoft Login",
    content: `
            <div class="border border-slate-300 dark:border-slate-700 rounded-t-xl bg-slate-100 dark:bg-slate-800 p-2 flex items-center gap-2 text-sm font-mono">
                <span class="material-symbols-outlined text-red-500 text-sm">lock_open</span>
                <span>http://login-microsoftonline-secure.com/oauth2</span>
            </div>
            <div class="p-8 border border-t-0 border-slate-300 dark:border-slate-700 rounded-b-xl flex flex-col items-center">
                <h2 class="text-xl font-bold mb-4">Sign in to Microsoft</h2>
                <input type="text" placeholder="Email, phone, or Skype" class="w-full max-w-xs border border-slate-300 dark:border-slate-600 bg-transparent p-2 mb-4" disabled>
                <button class="bg-blue-600 text-white px-8 py-2 w-full max-w-xs">Next</button>
            </div>
        `,
    attackType: "Credential Harvesting",
    humanFactor: "Familiarity",
    defenseTips: ["Always check the URL bar for the exact domain"],
    correctAction: "report",
    explanation:
      "The domain is a fake lookalike. Microsoft's real login domain is login.microsoftonline.com.",
  },
  {
    id: "login_02",
    type: "login",
    isPhishing: false,
    difficulty: "easy",
    title: "Real Google Login",
    content: `
            <div class="border border-slate-300 dark:border-slate-700 rounded-t-xl bg-slate-100 dark:bg-slate-800 p-2 flex items-center gap-2 text-sm font-mono">
                <span class="material-symbols-outlined text-blue-600 text-sm">lock</span>
                <span>https://accounts.google.com/signin/v2</span>
            </div>
            <div class="p-8 border border-t-0 border-slate-300 dark:border-slate-700 rounded-b-xl flex flex-col items-center">
                <h2 class="text-xl font-bold mb-4">Google</h2>
                <p class="mb-6">Sign in</p>
                <input type="text" placeholder="Email or phone" class="w-full max-w-xs border border-slate-300 dark:border-slate-600 bg-transparent p-2 rounded mb-4" disabled>
                <button class="bg-blue-600 text-white px-8 py-2 w-full max-w-xs rounded">Next</button>
            </div>
        `,
    attackType: "Legitimate",
    humanFactor: "Routine",
    defenseTips: ["Verify the URL is exactly accounts.google.com"],
    correctAction: "reply",
    explanation:
      "The URL is correct and uses HTTPS. This is the legitimate Google login page.",
  },
  {
    id: "login_03",
    type: "login",
    isPhishing: true,
    difficulty: "medium",
    title: "Fake Bank Login",
    content: `
            <div class="border border-slate-300 dark:border-slate-700 rounded-t-xl bg-slate-100 dark:bg-slate-800 p-2 flex items-center gap-2 text-sm font-mono">
                <span class="material-symbols-outlined text-blue-600 text-sm">lock</span>
                <span>https://secure-chase-banking-update.com/login</span>
            </div>
            <div class="p-8 border border-t-0 border-slate-300 dark:border-slate-700 rounded-b-xl flex flex-col items-center">
                <h2 class="text-xl font-bold mb-4 text-blue-800 dark:text-blue-400">CHASE</h2>
                <input type="text" placeholder="Username" class="w-full max-w-xs border border-slate-300 dark:border-slate-600 bg-transparent p-2 mb-2" disabled>
                <input type="password" placeholder="Password" class="w-full max-w-xs border border-slate-300 dark:border-slate-600 bg-transparent p-2 mb-4" disabled>
                <button class="bg-blue-800 text-white px-8 py-2 w-full max-w-xs">Sign In</button>
            </div>
        `,
    attackType: "Credential Harvesting",
    humanFactor: "Trust",
    defenseTips: [
      "HTTPS does not mean a site is safe, only that the connection is encrypted",
    ],
    correctAction: "report",
    explanation:
      "Even though it has HTTPS, the domain is a fake lookalike designed to steal banking credentials.",
  },
];

// ==========================================================================
// 2. STATE MANAGEMENT
// ==========================================================================
/**
 * @namespace State
 * @description Handles reading and writing simulation data to sessionStorage.
 */
const State = {
  getSession: () => JSON.parse(sessionStorage.getItem("currentSession")) || [],
  getIndex: () => parseInt(sessionStorage.getItem("currentIndex")) || 0,
  getAnswers: () => JSON.parse(sessionStorage.getItem("userAnswers")) || [],

  setSession: (data) =>
    sessionStorage.setItem("currentSession", JSON.stringify(data)),
  setIndex: (idx) => sessionStorage.setItem("currentIndex", idx),
  setAnswers: (answers) =>
    sessionStorage.setItem("userAnswers", JSON.stringify(answers)),

  clearSession: () => {
    sessionStorage.removeItem("currentSession");
    sessionStorage.removeItem("currentIndex");
    sessionStorage.removeItem("userAnswers");
    sessionStorage.removeItem("startTime");
  },
};

// ==========================================================================
// 3. GLOBAL INITIALIZATION (Theme & Navigation)
// ==========================================================================
/**
 * @function initGlobal
 * @description Initializes Universal Dark Mode and Mobile Navigation.
 * Targets document.documentElement to ensure Tailwind 'dark:' classes apply globally.
 */
function initGlobal() {
  const htmlElement = document.documentElement;
  const themeToggles = document.querySelectorAll(
    "#theme-toggle, .theme-toggle",
  );

  // Bind toggle buttons for Universal Dark Mode
  themeToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const isDark = htmlElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  });

  // --- Mobile Menu ---
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

// ==========================================================================
// 4. INTERACTIVE UI COMPONENTS (Accordions & Modals)
// ==========================================================================
/**
 * @function initComponents
 * @description Initializes Accordions (FAQ/Glossary) and the Centered Media Modal (Resources).
 */
function initComponents() {
  // --- Accordions (Learning Hub & FAQ) ---
  document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const parent = trigger.closest(".accordion-item");
      const content = parent.querySelector(".accordion-content");
      const isOpen = parent.classList.contains("accordion-open");

      // Close all items
      document.querySelectorAll(".accordion-item").forEach((item) => {
        item.classList.remove("accordion-open");
        const itemContent = item.querySelector(".accordion-content");
        if (itemContent) itemContent.classList.add("hidden");
      });

      // Open clicked item if it wasn't already open
      if (!isOpen) {
        parent.classList.add("accordion-open");
        if (content) content.classList.remove("hidden");
      }
    });
  });

  // --- Centered Media Modal (Resources Page) ---
  // --- Centered Media Modal (Resources Page) ---
  const modal = document.getElementById("modal-overlay");
  if (modal) {
    const modalImg = document.getElementById("modal-image");
    const modalPdf = document.getElementById("modal-pdf");
    const modalTitle = document.getElementById("modal-title");
    const closeModal = document.getElementById("close-modal");
    const downloadBtn = document.getElementById("modal-download-btn");

    document.querySelectorAll(".poster-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        // --- FIX 1: Ignore if clicking the download link inside the card ---
        if (e.target.closest("a") || e.target.closest("button")) return;

        const src = card.dataset.src;
        const title = card.dataset.title;
        const isPdf = src.toLowerCase().endsWith(".pdf");

        // Set Title
        if (modalTitle) modalTitle.textContent = title;

        // --- FIX 2: Force Download & New Tab for Modal Button ---
        if (downloadBtn) {
          downloadBtn.href = src;
          downloadBtn.setAttribute("download", title.replace(/\s+/g, "_")); // Suggests filename
          downloadBtn.setAttribute("target", "_blank"); // Opens in new tab
        }

        // Toggle Media Type (Image vs PDF)
        if (isPdf) {
          if (modalImg) modalImg.classList.add("hidden");
          if (modalPdf) {
            modalPdf.classList.remove("hidden");
            modalPdf.src = src;
          }
        } else {
          if (modalPdf) modalPdf.classList.add("hidden");
          if (modalImg) {
            modalImg.classList.remove("hidden");
            modalImg.src = src;
          }
        }

        // Show Modal
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });

    const hideModal = () => {
      modal.classList.remove("active");
      document.body.style.overflow = "";

      setTimeout(() => {
        if (modalPdf) modalPdf.src = "";
        if (modalImg) modalImg.src = "";
      }, 200);
    };

    if (closeModal) closeModal.addEventListener("click", hideModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) hideModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) hideModal();
    });
  }
}

// ==========================================================================
// 5. SIMULATOR ENGINE (simulator.html)
// ==========================================================================
let scenarioTimerInterval;

function initSimulator() {
  const container = document.getElementById("simulation-container");
  if (!container) return; // Exit if not on simulator page

  const introModal = document.getElementById("intro-modal");
  const startBtn = document.getElementById("start-sim-btn");

  // Handle Intro Modal (Show once per session)
  if (introModal && !sessionStorage.getItem("introShown")) {
    introModal.classList.remove("hidden");
    introModal.classList.add("flex");

    startBtn.addEventListener("click", () => {
      introModal.classList.add("hidden");
      introModal.classList.remove("flex");
      sessionStorage.setItem("introShown", "true");
      startNewSession();
    });
  } else if (State.getSession().length === 0) {
    startNewSession();
  } else {
    renderScenario();
  }

  // Bind Action Buttons (Click, Reply, Report)
  document.querySelectorAll(".sim-action-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const action = e.currentTarget.dataset.action;
      handleUserAction(action);
    });
  });
}

function startNewSession() {
  State.clearSession();

  // Shuffle and pick 5 scenarios
  const shuffled = [...SCENARIOS].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);

  State.setSession(selected);
  State.setIndex(0);
  State.setAnswers([]);
  sessionStorage.setItem("startTime", Date.now());

  renderScenario();
}

function startScenarioTimer() {
  clearInterval(scenarioTimerInterval);
  let timeLeft = 120; // 2 minutes per scenario

  // Find the timer display element (assuming it's next to the timer icon)
  const timerIcon = document.querySelector(
    '.material-symbols-outlined[data-icon="timer"]',
  );
  const timerDisplay = timerIcon ? timerIcon.nextElementSibling : null;

  if (!timerDisplay) return;

  scenarioTimerInterval = setInterval(() => {
    timeLeft--;
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    timerDisplay.textContent = `${m}:${s} remaining`;

    if (timeLeft <= 0) {
      clearInterval(scenarioTimerInterval);
      handleUserAction("timeout"); // Auto-fail if time runs out
    }
  }, 1000);
}

function renderScenario() {
  const session = State.getSession();
  const index = State.getIndex();

  // If finished, redirect to results
  if (index >= session.length) {
    clearInterval(scenarioTimerInterval);
    window.location.href = "results.html";
    return;
  }

  const scenario = session[index];

  // Update UI Elements
  const counterEl = document.getElementById("scenario-counter");
  const titleEl = document.getElementById("scenario-title");
  const contentArea = document.getElementById("scenario-content");

  if (counterEl) counterEl.textContent = `Scenario 0${index + 1} / 05`;
  if (titleEl) titleEl.textContent = scenario.title;

  // Render based on scenario type
  let html = "";
  if (scenario.type === "email") {
    html = `<div class="p-8 font-body leading-relaxed max-w-2xl mx-auto">${scenario.content}</div>`;
  } else if (scenario.type === "sms") {
    html = `<div class="p-8 flex flex-col items-center justify-center min-h-[300px] bg-slate-50 dark:bg-slate-800/50">${scenario.content}</div>`;
  } else if (scenario.type === "vishing") {
    html = `<div class="p-8 max-w-xl mx-auto">${scenario.content}</div>`;
  } else if (scenario.type === "login") {
    html = `<div class="p-8 max-w-2xl mx-auto">${scenario.content}</div>`;
  }

  if (contentArea) contentArea.innerHTML = html;

  // Start the 2-minute countdown for this specific scenario
  startScenarioTimer();
}

function handleUserAction(action) {
  clearInterval(scenarioTimerInterval); // Stop timer immediately

  const session = State.getSession();
  const index = State.getIndex();
  const scenario = session[index];
  const answers = State.getAnswers();

  // Determine if correct. If timeout, it's automatically false.
  const isCorrect =
    action === "timeout" ? false : action === scenario.correctAction;

  answers.push({
    scenarioId: scenario.id,
    title: scenario.title,
    isCorrect: isCorrect,
    userAction: action,
    correctAction: scenario.correctAction,
    explanation:
      action === "timeout"
        ? "You ran out of time. In security, failing to act can be as dangerous as acting incorrectly."
        : scenario.explanation,
    defenseTips: scenario.defenseTips,
  });

  State.setAnswers(answers);
  State.setIndex(index + 1);

  // Move to next scenario (or results if done)
  renderScenario();
}

// ==========================================================================
// 6. RESULTS ENGINE (results.html)
// ==========================================================================
function initResults() {
  const scoreDisplay = document.getElementById("score-display");
  if (!scoreDisplay) return; // Exit if not on results page

  const answers = State.getAnswers();
  const emptyState = document.getElementById("empty-state");
  const resultsContent = document.getElementById("results-content");

  // Handle Empty State (User navigated here without playing)
  if (!answers || answers.length === 0) {
    if (resultsContent) resultsContent.classList.add("hidden");
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  // Calculate Metrics
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const total = answers.length;
  const accuracy = Math.round((correctCount / total) * 100);

  const startTime = parseInt(sessionStorage.getItem("startTime"));
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  const mins = Math.floor(timeTaken / 60)
    .toString()
    .padStart(2, "0");
  const secs = (timeTaken % 60).toString().padStart(2, "0");

  // Update Score UI
  document.getElementById("score-correct").textContent = correctCount;
  document.getElementById("score-total").textContent = `/ ${total} Correct`;
  document.getElementById("time-taken").textContent = `${mins}:${secs}`;
  document.getElementById("accuracy-rate").textContent = `${accuracy}%`;

  // Animate Accuracy Bar
  setTimeout(() => {
    const bar = document.getElementById("accuracy-bar");
    if (bar) bar.style.width = `${accuracy}%`;
  }, 100);

  // Generate Dynamic Lessons & Recommendations
  const lessonsList = document.getElementById("lessons-list");
  const recommendationsList = document.getElementById("recommendations-list");

  if (lessonsList) lessonsList.innerHTML = "";
  if (recommendationsList) recommendationsList.innerHTML = "";

  const mistakes = answers.filter((a) => !a.isCorrect);

  if (mistakes.length === 0) {
    if (lessonsList)
      lessonsList.innerHTML = `<li class="text-green-500 font-bold">Perfect score! You successfully identified all threats and legitimate communications.</li>`;
    if (recommendationsList)
      recommendationsList.innerHTML = `<li><span class="material-symbols-outlined text-green-500 text-sm mr-2">check_circle</span>Keep up the great work and stay vigilant.</li>`;
  } else {
    mistakes.forEach((mistake, idx) => {
      if (lessonsList) {
        lessonsList.innerHTML += `
                    <li class="flex gap-4 mb-4">
                        <span class="text-blue-600 font-bold text-lg leading-tight">0${idx + 1}</span>
                        <div>
                            <p class="font-bold text-sm">${mistake.title}</p>
                            <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">${mistake.explanation}</p>
                        </div>
                    </li>
                `;
      }

      if (
        recommendationsList &&
        mistake.defenseTips &&
        mistake.defenseTips.length > 0
      ) {
        recommendationsList.innerHTML += `
                    <li class="flex items-start gap-3 mb-3">
                        <span class="material-symbols-outlined text-blue-600 text-sm mt-1">check_circle</span>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">${mistake.defenseTips[0]}</p>
                    </li>
                `;
      }
    });
  }

  // Bind Retry Button
  const retryBtn = document.getElementById("retry-btn");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      State.clearSession();
      window.location.href = "simulator.html";
    });
  }
}

// ==========================================================================
// 7. BOOTSTRAP
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initGlobal();
  initComponents();
  initSimulator();
  initResults();
});
