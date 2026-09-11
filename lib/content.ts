export type NavLink = { label: string; href: string };

export type Stat = { label: string; value: string; accent?: string };

export type Mentor = {
  index: string;
  name: string;
  role: string;
  commitment?: string;
  commitmentTone: "volt" | "outline" | "none";
  blurb: string;
  image?: string;
  open?: boolean;
};

export type Partner = { name: string; logo: string };

export type RhythmEntry = { when: string; title: string; body: string };

export type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
  width: string;
};

export type CampusStage = {
  title: string;
  status: string;
  body: string;
  marker: "filled" | "outline" | "faint";
};

export type Hackathon = {
  edition: string;
  city: string;
  window: string;
  format: string;
  status: string;
  tone: "live" | "default" | "muted" | "open";
};

export type TeamMember = {
  name: string;
  remit: string;
  avatar?: string;
  initials?: string;
  links: { label: string; href: string }[];
};

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export const SITE = {
  wordmark: "hack47",
  url: "https://hack47.org",
  email: "hello@hack47.org",
  phone: "+91 90412 60790",
  phoneRaw: "+919041260790",
  cohort: "batch 01",
  window: "sept 15 — oct 15",
  places: 16,
  days: 30,
  reach: "40,000",
  // The application posts to this Google Apps Script endpoint, which appends
  // a row to the existing intake Google Sheet. Field ids must stay in sync
  // with APPLICATION_QUESTIONS below.
  applyEndpoint:
    "https://script.google.com/macros/s/AKfycbxfqO1VrEUves58l8qfU6Jq2sKUwawN4SLBi4TXOOHjO8vpoV7_HMvtocGUiLtLmi7DTA/exec",
} as const;

export const SOCIALS = {
  x: "https://x.com/hack47org",
  instagram: "https://www.instagram.com/hack47.0rg/",
  linkedin: "https://www.linkedin.com/company/hack47",
  variance: "https://www.variance.house",
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: "batch 01", href: "#pilot" },
  { label: "partners", href: "#partners" },
  { label: "the 30 days", href: "#house" },
  { label: "hackathons", href: "#hackathons" },
];

export const HERO_STATS: Stat[] = [
  { label: "reached across india", value: "40,000", accent: "+" },
  { label: "places", value: "16" },
  { label: "cohort", value: "batch 01" },
];

export const SELECTION_STATS: Stat[] = [
  { label: "builders reached across india", value: "40,000+" },
  { label: "places in batch 01", value: "16", accent: "volt" },
  { label: "days in the house", value: "30" },
];

export const MENTORS: Mentor[] = [
  {
    index: "01",
    name: "[mentor name]",
    role: "staff engineer · infrastructure",
    commitment: "two weeks resident",
    commitmentTone: "volt",
    blurb:
      "Taking a prototype that works on one machine and making it survive real traffic — queues, storage, cost per request, and what to leave out.",
    image: "https://i.pravatar.cc/560?u=mentor-infra-h47",
  },
  {
    index: "02",
    name: "[mentor name]",
    role: "research scientist",
    commitment: "weekly office hours",
    commitmentTone: "volt",
    blurb:
      "Reading a paper properly, designing an evaluation you can trust, and knowing when a result is real rather than a lucky seed.",
    image: "https://i.pravatar.cc/560?u=mentor-research-h47",
  },
  {
    index: "03",
    name: "[mentor name]",
    role: "founder",
    commitment: "one long dinner",
    commitmentTone: "volt",
    blurb:
      "Finding the first ten people who actually want the thing, and the difference between interest and use.",
    image: "https://i.pravatar.cc/560?u=mentor-gtm-h47",
  },
  {
    index: "04",
    name: "[mentor name]",
    role: "product designer",
    commitment: "being confirmed",
    commitmentTone: "outline",
    blurb:
      "Making a rough tool legible to somebody who did not build it — naming, hierarchy, and cutting the second screen.",
    image: "https://i.pravatar.cc/560?u=mentor-design-h47",
  },
  {
    index: "05",
    name: "to be announced",
    role: "open seat",
    commitmentTone: "none",
    blurb:
      "One seat is deliberately unfilled until the cohort is picked, so it can be matched to what the sixteen are actually building.",
    open: true,
  },
];

export const PARTNERS: Partner[] = [
  { name: "OpenAI", logo: "/logos/openai.svg" },
  { name: "Anthropic", logo: "/logos/anthropic.svg" },
  { name: "Gemini", logo: "/logos/googlegemini.svg" },
  { name: "Meta AI", logo: "/logos/meta.svg" },
  { name: "Hugging Face", logo: "/logos/huggingface.svg" },
  { name: "Perplexity", logo: "/logos/perplexity.svg" },
  { name: "NVIDIA", logo: "/logos/nvidia.svg" },
  { name: "Ollama", logo: "/logos/ollama.svg" },
  { name: "Modal", logo: "/logos/modal.svg" },
  { name: "Ray", logo: "/logos/ray.svg" },
  { name: "PyTorch", logo: "/logos/pytorch.svg" },
  { name: "LangChain", logo: "/logos/langchain.svg" },
  { name: "Docker", logo: "/logos/docker.svg" },
  { name: "Kubernetes", logo: "/logos/kubernetes.svg" },
  { name: "Cloudflare", logo: "/logos/cloudflare.svg" },
  { name: "Postgres", logo: "/logos/postgresql.svg" },
  { name: "Vercel", logo: "/logos/vercel.svg" },
  { name: "Supabase", logo: "/logos/supabase.svg" },
  { name: "MongoDB", logo: "/logos/mongodb.svg" },
  { name: "GitHub", logo: "/logos/github.svg" },
  { name: "Linear", logo: "/logos/linear.svg" },
  { name: "Figma", logo: "/logos/figma.svg" },
  { name: "Stripe", logo: "/logos/stripe.svg" },
  { name: "Replit", logo: "/logos/replit.svg" },
];

export const PARTNER_MODES = [
  "credits",
  "compute",
  "tooling",
  "teaching time",
  "capital",
];

export const RHYTHM: RhythmEntry[] = [
  {
    when: "day 00",
    title: "you arrive mid‑build",
    body: "Nobody starts from a blank page. You come in with something already running — a repo, a prototype, a user or two — and the thirty days are spent pushing it somewhere it could not have gone alone.",
  },
  {
    when: "daily",
    title: "build in the open",
    body: "One log entry a day, posted where the other fifteen can read it. What moved, what broke, what you are stuck on. Being stuck in public is how you stop being stuck.",
  },
  {
    when: "every friday",
    title: "demo, not slides",
    body: "Four demo nights across the month. Ten minutes each, live software only. If it cannot be shown running, it does not get shown.",
  },
  {
    when: "nightly, 9pm",
    title: "the table is the seminar",
    body: "One long table, everyone at it. Whoever is closest to a hard problem talks first, and the rest of the room takes it apart. Most of what people remember happens here.",
  },
  {
    when: "day 15",
    title: "the honest cut",
    body: "Halfway, every project gets a hard review from mentors and the room. Double down, cut scope, or start again with two weeks left. People who change direction here usually finish stronger.",
  },
  {
    when: "all month",
    title: "no friction budget",
    body: "Room, food, laundry, desk, bandwidth and machines are handled by the house. Not a perk — a design decision. The only difficult thing in your day should be the work.",
  },
  {
    when: "day 30",
    title: "ship day",
    body: "One open evening in Delhi. Mentors, partners and whoever the sixteen want in the room. Everything shown is running, and everything shown is yours — Hack47 takes no equity.",
  },
  {
    when: "after",
    title: "you keep the room",
    body: "The thirty days end, the fifteen other people do not. Alumni of pilot 01 keep house access, intros, and first call on every room that opens after this one.",
  },
];

export const GALLERY: GalleryItem[] = [
  {
    src: "https://images.pexels.com/photos/4913346/pexels-photo-4913346.jpeg?auto=compress&cs=tinysrgb&w=1200&q=80",
    alt: "Long shared wooden dining table in a villa, photograph by Maria Orlova on Pexels",
    caption: "01 / the work table",
    width: "min(720px,74vw)",
  },
  {
    src: "https://images.pexels.com/photos/36578943/pexels-photo-36578943.jpeg?auto=compress&cs=tinysrgb&w=900&q=80",
    alt: "Atmospheric courtyard with dense planting, photograph by Vero Lova on Pexels",
    caption: "02 / the courtyard",
    width: "min(330px,56vw)",
  },
  {
    src: "https://images.pexels.com/photos/28399223/pexels-photo-28399223.jpeg?auto=compress&cs=tinysrgb&w=900&q=80",
    alt: "Workspace with laptops under warm task lighting, photograph by Hilmi Isilak on Pexels",
    caption: "03 / late light",
    width: "min(330px,56vw)",
  },
  {
    src: "https://images.pexels.com/photos/20219148/pexels-photo-20219148.jpeg?auto=compress&cs=tinysrgb&w=900&q=80",
    alt: "Illuminated street at night, photograph by Bryan Dijkhuizen on Pexels",
    caption: "04 / the street outside",
    width: "min(330px,56vw)",
  },
];

export const HERO_IMAGE = {
  src: "https://images.unsplash.com/photo-1562439427-b53f43a453bc?auto=format&w=2000&q=80&fit=crop",
  srcSmall:
    "https://images.unsplash.com/photo-1562439427-b53f43a453bc?auto=format&w=800&q=80&fit=crop",
  alt: "Villa facade at night with warm illuminated windows, photograph by Anahita on Unsplash",
};

export const CAMPUS_STUDY = {
  src: "/campus/campus-facade-delhi.webp",
  alt: "Architectural study of the proposed Delhi founder campus: five stacked floors of glazed balconies behind vertical fins, framed by a mature tree and street-level planting.",
};

export const CAMPUS_STAGES: CampusStage[] = [
  {
    title: "the house",
    status: "now · pilot 01",
    body: "One villa, sixteen places, thirty days.",
    marker: "filled",
  },
  {
    title: "back-to-back rooms",
    status: "next",
    body: "Cohorts that overlap, so the room never fully empties.",
    marker: "outline",
  },
  {
    title: "the campus",
    status: "being designed",
    body: "A permanent Delhi address built for founders who live on site.",
    marker: "faint",
  },
];

export const HACKATHON_STATS: Stat[] = [
  { label: "hours per edition", value: "47" },
  { label: "cities in the calendar", value: "06" },
  { label: "running now", value: "01", accent: "volt" },
  { label: "to enter, always", value: "free" },
];

export const HACKATHONS: Hackathon[] = [
  {
    edition: "01",
    city: "delhi",
    window: "aug 22 — aug 24",
    format: "Opening edition. Two hundred builders, one floor, forty-seven hours.",
    status: "registration open",
    tone: "live",
  },
  {
    edition: "02",
    city: "bengaluru",
    window: "oct · dates soon",
    format: "Infra and agents weekend, hosted inside a working engineering office.",
    status: "venue locked",
    tone: "default",
  },
  {
    edition: "03",
    city: "mumbai",
    window: "nov · dates soon",
    format: "Consumer weekend. Ship something a stranger can use by Sunday night.",
    status: "scouting",
    tone: "default",
  },
  {
    edition: "04",
    city: "hyderabad",
    window: "dec · dates soon",
    format: "Campus edition, run with student engineering societies.",
    status: "scouting",
    tone: "default",
  },
  {
    edition: "05",
    city: "your city",
    window: "open slot",
    format:
      "We bring the format, judging and prizes. You bring a room and a hundred builders.",
    status: "host one",
    tone: "open",
  },
];

export const TEAM: TeamMember[] = [
  {
    name: "Rishul Chanana",
    remit: "founder",
    avatar: "/team/rishul.jpeg",
    links: [
      { label: "linkedin ↗", href: "https://www.linkedin.com/in/rishul-chanana/" },
      { label: "x ↗", href: "https://x.com/rishhul" },
    ],
  },
  {
    name: "Pratyush Pandey",
    remit: "co-founder",
    avatar: "/team/pratyush.jpeg",
    links: [
      {
        label: "linkedin ↗",
        href: "https://www.linkedin.com/in/pratyush-pandey-09b35b219",
      },
      { label: "x ↗", href: "https://x.com/P_Pratyush7" },
    ],
  },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "the house",
    links: NAV_LINKS,
  },
  {
    title: "get involved",
    links: [
      { label: "apply for a place", href: "#apply" },
      { label: "become a partner", href: "#partners" },
      { label: "back the campus", href: "#campus" },
      { label: "host a hackathon", href: "#hackathons" },
      { label: "join the team", href: "mailto:hello@hack47.org" },
    ],
  },
  {
    title: "elsewhere",
    links: [
      { label: "hello@hack47.org", href: "mailto:hello@hack47.org" },
      { label: "x / twitter ↗", href: SOCIALS.x },
      { label: "linkedin ↗", href: SOCIALS.linkedin },
      { label: "instagram ↗", href: SOCIALS.instagram },
      { label: "variance.house ↗", href: SOCIALS.variance },
    ],
  },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: "contact", href: "mailto:hello@hack47.org" },
  { label: "instagram", href: SOCIALS.instagram },
  { label: "x / twitter", href: SOCIALS.x },
  { label: "linkedin", href: SOCIALS.linkedin },
];

export type ApplicationQuestion = {
  id: string;
  label: string;
  hint?: string;
  type: "text" | "email" | "tel" | "textarea" | "mcq";
  placeholder?: string;
  options?: string[];
};

/**
 * The intake questions. Field ids map 1:1 onto the columns of the linked
 * Google Sheet (via SITE.applyEndpoint), so ids must not change without
 * updating the Apps Script. Copy has been reworked from the old "sell your
 * soul" tone into something professional but still with personality.
 */
export const APPLICATION_QUESTIONS: ApplicationQuestion[] = [
  {
    id: "name",
    label: "What's your name?",
    type: "text",
    placeholder: "Your full name",
  },
  {
    id: "email",
    label: "Where can we reach you?",
    hint: "We'll only use this to follow up on your application.",
    type: "email",
    placeholder: "you@builder.dev",
  },
  {
    id: "phone",
    label: "And a phone number.",
    hint: "For when email is too slow.",
    type: "tel",
    placeholder: "+91 ...",
  },
  {
    id: "instagram",
    label: "Instagram",
    type: "text",
    placeholder: "@your_handle",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    type: "text",
    placeholder: "linkedin.com/in/...",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    type: "text",
    placeholder: "@handle or x.com/...",
  },
  {
    id: "brag",
    label: "Show us what you've built.",
    hint: "Projects shipped, hackathons won, repos, startups, communities. Links welcome — be specific, not modest.",
    type: "textarea",
    placeholder:
      "I built...\ngithub.com/...\na product used by...\nlink to the thing",
  },
  {
    id: "icecream",
    label: "Most important question: best ice cream flavour?",
    hint: "Choose wisely.",
    type: "text",
    placeholder: "Be honest.",
  },
  {
    id: "failure",
    label: "Tell us about a time something you cared about fell apart.",
    hint: "What broke, and how you came back from it. We value honesty here.",
    type: "textarea",
    placeholder: "The real story...",
  },
  {
    id: "caffeine",
    label: "How do you take your caffeine?",
    type: "text",
    placeholder: "Black coffee at 3AM? Chai? Neither?",
  },
  {
    id: "food",
    label: "House logistics.",
    hint: "Food preferences, dietary restrictions, and your go-to late-night meal when the build is working.",
    type: "textarea",
    placeholder: "Veg / non-veg, allergies, midnight order of choice...",
  },
  {
    id: "funding",
    label: "On money.",
    hint: "This does not affect your application in any way — selection is on merit alone. We just want to plan honestly.",
    type: "mcq",
    options: [
      "I'd need to attend fully funded",
      "I could contribute a little",
      "I'm happy to contribute meaningfully",
      "Cost isn't a barrier for me",
    ],
  },
];
