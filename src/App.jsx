import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Check, Plus, X, Trash2, Lock, Award, Bell, BellOff, Scale, Info,
  Settings as SettingsIcon, Home as HomeIcon, History as HistoryIcon,
  Sparkles, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Minus, Share2, Flame, Pill,
  Trophy, Medal, Star, Crown, Target, Pencil, Download, Upload, Moon, Sun, Type,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine,
} from "recharts";

/* ---------------------------------------------------------------------- */
/* Constants & content                                                    */
/* ---------------------------------------------------------------------- */

const WEIGHT_MAP = { low: 5, medium: 10, high: 15 };
const BONUS_POINT_VALUE = 2;
const BONUS_ELIGIBILITY_THRESHOLD = 70;
const WEIGHT_CHECKIN_DAYS = 7;

const BASE_TASKS = [
  { id: "water", name: "Glasses of water", weightTier: "medium", cat: "base", type: "counter", target: 8 },
  { id: "teeth", name: "Brush your teeth", weightTier: "medium", cat: "base" },
  { id: "bathe", name: "Shower or wash up", weightTier: "high", cat: "base" },
  { id: "dress", name: "Get dressed", weightTier: "medium", cat: "base" },
  { id: "eat", name: "Eat something nourishing", weightTier: "high", cat: "base" },
  { id: "outside", name: "Step outside for fresh air", weightTier: "medium", cat: "base" },
  { id: "tidy", name: "Tidy one small space", weightTier: "medium", cat: "base" },
  { id: "connect", name: "Connect with someone", weightTier: "low", cat: "base" },
  { id: "wind", name: "Wind down for bed", weightTier: "low", cat: "base" },
  { id: "bed", name: "Make your bed", weightTier: "low", cat: "base" },
  { id: "dishes", name: "Wash the dishes", weightTier: "medium", cat: "base" },
  { id: "laundry", name: "Do a load of laundry", weightTier: "high", cat: "base" },
  { id: "cleanroom", name: "Clean a room", weightTier: "high", cat: "base" },
];

const GOAL_OPTIONS = [
  { id: "weightloss", label: "Weight loss" },
  { id: "keto", label: "Keto" },
  { id: "mentalhealth", label: "Mental health & mood" },
  { id: "fitness", label: "General fitness" },
  { id: "sleep", label: "Better sleep" },
  { id: "selfcare", label: "General self-care" },
  { id: "other", label: "Other (write your own)" },
];

const GOAL_TASK_LIBRARY = {
  weightloss: [
    { id: "wl_walk", name: "Take a 20-minute walk", weightTier: "medium" },
    { id: "wl_meal", name: "Log a meal", weightTier: "medium" },
    { id: "protein_log", name: "Protein", weightTier: "medium", type: "counter", target: 100, step: 10, unit: "g" },
  ],
  keto: [
    { id: "keto_carbs", name: "Track your carbs", weightTier: "medium" },
    { id: "keto_meal", name: "Prep a keto-friendly meal", weightTier: "high" },
    { id: "keto_sugar", name: "Avoid sugary drinks and junk food", weightTier: "low" },
    { id: "keto_electrolytes", name: "Take electrolytes", weightTier: "low" },
    { id: "protein_log", name: "Protein", weightTier: "medium", type: "counter", target: 100, step: 10, unit: "g" },
  ],
  mentalhealth: [
    { id: "mh_breathe", name: "5 minutes of deep breathing", weightTier: "medium" },
    { id: "mh_gratitude", name: "Write one thing you're grateful for", weightTier: "medium" },
    { id: "mh_joy", name: "Do one small joyful thing", weightTier: "high" },
    { id: "mh_mood", name: "Check in on your mood", weightTier: "low" },
  ],
  fitness: [
    { id: "fit_move", name: "Move your body for 15 minutes", weightTier: "high" },
    { id: "fit_stretch", name: "Stretch", weightTier: "low" },
  ],
  sleep: [
    { id: "sleep_wake", name: "Wake up at a consistent time", weightTier: "medium" },
    { id: "sleep_screen", name: "No screens 30 min before bed", weightTier: "low" },
  ],
  selfcare: [
    { id: "sc_pamper", name: "Do one kind thing for yourself", weightTier: "medium" },
    { id: "sc_break", name: "Take a real break today", weightTier: "low" },
  ],
};

const BONUS_DEFAULTS = [
  { id: "b_extra_walk", name: "Extra walk or movement", points: BONUS_POINT_VALUE },
  { id: "b_journal", name: "Journal for 10 minutes", points: BONUS_POINT_VALUE },
  { id: "b_clean", name: "Extra tidying or a chore", points: BONUS_POINT_VALUE },
  { id: "b_creative", name: "Do something creative", points: BONUS_POINT_VALUE },
  { id: "b_mealprep", name: "Prep a healthy meal in advance", points: BONUS_POINT_VALUE },
  { id: "b_garbage", name: "Take out the garbage", points: BONUS_POINT_VALUE },
  { id: "b_read", name: "Read for 10 minutes", points: BONUS_POINT_VALUE },
  { id: "b_hair", name: "Style your hair", points: BONUS_POINT_VALUE },
];

const AFFIRMATIONS = [
  "Showing up today, even imperfectly, is enough.",
  "Small steps still move you forward.",
  "You don't have to feel motivated to take one small action.",
  "Rest is productive when your body needs it.",
  "Progress isn't a straight line, and that's okay.",
  "You are allowed to be proud of the small things.",
  "One task at a time is still momentum.",
  "You've gotten through every hard day so far.",
  "Today only asks for what you can give right now.",
  "Being gentle with yourself is not the same as giving up.",
];

const AFFIRMATIONS_BY_GOAL = {
  weightloss: [
    "Your worth isn't measured by a number on a scale.",
    "Every walk, every glass of water, is a vote for the person you're becoming.",
  ],
  keto: [
    "Discipline today is kindness to tomorrow's energy levels.",
    "One mindful meal at a time - that's how this works.",
  ],
  mentalhealth: [
    "Your feelings are valid, even the heavy ones.",
    "Healing isn't linear, and neither is today.",
  ],
  fitness: [
    "Movement is a gift you give your body, not a punishment.",
    "Strength is built in the days you almost skipped.",
  ],
  sleep: [
    "Rest is how tomorrow gets its energy.",
    "A good night's sleep is a foundation, not a luxury.",
  ],
  selfcare: [
    "Caring for yourself isn't selfish - it's necessary.",
    "You deserve the same kindness you give everyone else.",
  ],
};

const CELEBRATE_MESSAGES = [
  "You hit your goal today - that's real, and it counts.",
  "Look at that: you did what you set out to do today. Well done.",
  "That's a passing day. Be proud of the effort behind it.",
  "You showed up for yourself today. That matters.",
  "Nice work - today's effort is officially in the books.",
];

const ENCOURAGE_MESSAGES = [
  "You didn't hit the mark today, and that's alright. You'll get another shot tomorrow.",
  "Today was hard, but you still did something. That's not nothing.",
  "Not every day is a passing day - tomorrow starts fresh.",
  "You showed up, even if it wasn't a full day. That counts for something.",
  "Be gentle with yourself tonight. Tomorrow is a new 100 points.",
];

const TASK_TIPS = {
  water: "Keep a marked bottle nearby so you can see progress without counting glasses in your head.",
  teeth: "Keep your toothbrush out in the open as a visual nudge.",
  bathe: "Even a five-minute rinse counts as showing up for yourself.",
  dress: "Laying out clothes the night before removes a decision later.",
  eat: "Anything is better than nothing - crackers or fruit still count.",
  outside: "Standing on a porch or balcony for two minutes still counts.",
  tidy: "Pick one surface, not the whole room.",
  connect: "A short text to someone you trust counts just as much as a call.",
  wind: "Dimming the lights an hour early can help your body downshift.",
  bed: "Even pulling the covers up counts as making your bed.",
  dishes: "Just today's dishes count - the sink doesn't need to be empty.",
  laundry: "Starting a load counts, even if folding happens tomorrow.",
  cleanroom: "Pick the room that's bothering you most, and stop whenever you've had enough.",
  wl_walk: "Even a walk around the block breaks up the day.",
  wl_meal: "Log it in the Nutrition section below - even a rough estimate is useful.",
  keto_carbs: "Log meals in the Nutrition section below to keep a running carb total.",
  protein_log: "Tap + every time you get about 10g of protein in - a palm-sized portion of meat, fish, eggs, or tofu is roughly there.",
  keto_meal: "Prepping ahead removes the hardest part: deciding when you're hungry.",
  keto_sugar: "Sparkling water with a splash of citrus, or a handful of nuts instead of chips, can help with cravings.",
  keto_electrolytes: "Electrolytes are minerals - sodium, potassium, magnesium - that keto diets flush out faster than usual. Low levels cause the fatigue and headaches known as keto flu. Salted broth, a pinch of salt in water, or an electrolyte powder all help replace them.",
  mh_breathe: "Try four counts in, six counts out - even one round helps.",
  mh_gratitude: "It can be as small as 'the coffee was warm.'",
  mh_joy: "It doesn't need to be big - a song, a snack, five minutes outside.",
  mh_mood: "Naming the mood, even briefly, can take some of its weight away.",
  fit_move: "Dancing in your kitchen counts as moving your body.",
  fit_stretch: "Even two minutes of stretching counts.",
  sleep_wake: "Consistency matters more than the exact hour.",
  sleep_screen: "Even dimming your screen brightness helps signal wind-down.",
  sc_pamper: "This can be as small as making your favorite drink.",
  sc_break: "A real break means stepping fully away, even briefly.",
};

const DEFAULT_TIP = (name) =>
  `Try giving "${name}" just two minutes - momentum tends to build after the first step.`;

const REFERRAL_MESSAGE =
  "I've been using Daily Anchor to help track everyday basics like eating, hydrating, and getting dressed on hard days. Thought it might help you too.";

// Replace this with your real, hosted Privacy Policy URL once you have one
// (Google Docs share link, GitHub Pages, Notion public page, your own domain, etc.).
// This is the ONLY place it needs to be updated - it's used everywhere the
// app links to the Privacy Policy.
const PRIVACY_POLICY_URL = "https://example.com/daily-anchor-privacy-policy";

// Achievement badges. `check` receives cumulative stats and returns whether
// the badge should be considered earned. Once earned, a badge is never
// revoked, even if a later streak breaks.
const BADGE_DEFS = [
  { id: "first_day", name: "First Step", desc: "Complete your very first day.", icon: "Sparkles", check: (s) => s.totalDaysCompleted >= 1 },
  { id: "streak_3", name: "3-Day Streak", desc: "Show up three days in a row.", icon: "Flame", check: (s) => s.longestStreak >= 3 },
  { id: "streak_7", name: "Week Warrior", desc: "Show up seven days in a row.", icon: "Flame", check: (s) => s.longestStreak >= 7 },
  { id: "streak_14", name: "Two-Week Streak", desc: "Fourteen days in a row.", icon: "Medal", check: (s) => s.longestStreak >= 14 },
  { id: "streak_30", name: "Consistency Champion", desc: "Thirty days in a row.", icon: "Crown", check: (s) => s.longestStreak >= 30 },
  { id: "passing_10", name: "10 Passing Days", desc: "Hit your passing score on 10 different days.", icon: "Star", check: (s) => s.totalPassingDays >= 10 },
  { id: "passing_25", name: "25 Passing Days", desc: "Hit your passing score on 25 different days.", icon: "Star", check: (s) => s.totalPassingDays >= 25 },
  { id: "passing_50", name: "50 Passing Days", desc: "Hit your passing score on 50 different days.", icon: "Trophy", check: (s) => s.totalPassingDays >= 50 },
  { id: "personal_best", name: "Personal Best", desc: "Score 100 or more in a single day.", icon: "Target", check: (s) => s.bestScore >= 100 },
];
const BADGE_ICONS = { Sparkles, Flame, Medal, Crown, Star, Trophy, Target };

function computeLongestStreak(lockedDatesAsc) {
  let longest = 0, current = 0, prev = null;
  for (const d of lockedDatesAsc) {
    current = prev && daysBetween(prev, d) === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
    prev = d;
  }
  return longest;
}

function computeStats(daysObj, passingThreshold) {
  const locked = Object.keys(daysObj).filter((d) => daysObj[d].locked).sort();
  const totalDaysCompleted = locked.length;
  const totalPassingDays = locked.filter((d) => daysObj[d].score >= passingThreshold).length;
  const bestScore = locked.reduce((m, d) => Math.max(m, daysObj[d].score), 0);
  const longestStreak = computeLongestStreak(locked);
  return { totalDaysCompleted, totalPassingDays, bestScore, longestStreak };
}

function evaluateNewBadges(daysObj, passingThreshold, earnedBadges, todayIso) {
  const stats = computeStats(daysObj, passingThreshold);
  const updated = { ...earnedBadges };
  const newly = [];
  BADGE_DEFS.forEach((b) => {
    if (!updated[b.id] && b.check(stats)) {
      updated[b.id] = todayIso;
      newly.push(b);
    }
  });
  return { updated, newly };
}

const WAIVER_SECTIONS = [
  "ACKNOWLEDGMENT, WAIVER OF LIABILITY, AND TERMS OF USE. Please read the following carefully. By checking the box below, you acknowledge that you have read, understood, and agree to the terms set forth herein.",
  "1. No Medical, Psychological, or Nutritional Advice. Daily Anchor (the \"Application\") is a self-guided habit-tracking and motivational tool only. It is not a medical device, and no content generated, displayed, or suggested by the Application - including without limitation task recommendations, protein and carbohydrate estimates, medication reminders, or affirmations - constitutes medical, psychological, psychiatric, nutritional, or other professional advice, diagnosis, or treatment. Nothing in the Application creates a physician-patient, therapist-client, dietitian-client, or other professional relationship.",
  "2. No Substitute for Professional Care. The Application is not a substitute for consultation with, diagnosis by, or treatment from a licensed physician, mental health professional, registered dietitian, or other qualified healthcare provider. You agree to consult a qualified healthcare provider before making changes to medication, diet, exercise, or any other health-related regimen, and before disregarding or delaying professional medical advice on the basis of anything provided by the Application.",
  "3. Assumption of Risk. You voluntarily assume all risk associated with your use of the Application, including any reliance on the reminders, estimates, scores, or suggestions it provides. Reminders, including medication reminders, depend on device settings, notification permissions, network connectivity, and the Application remaining open and active, and may fail to deliver for reasons outside the developer's control.",
  "4. Accuracy of User-Provided Information. You are solely responsible for the accuracy and completeness of any information you enter into the Application, including without limitation goals, weight, dietary information, protein and carbohydrate figures, mood entries, and medication schedules. The developer is not responsible for any consequence resulting from information that is inaccurate, incomplete, or entered in error.",
  "5. No Warranty. The Application is provided on an \"as is\" and \"as available\" basis, without warranties of any kind, whether express, implied, or statutory, including without limitation implied warranties of merchantability, fitness for a particular purpose, accuracy, reliability, and non-infringement. The developer does not warrant that the Application will be uninterrupted, timely, secure, or free of errors or omissions.",
  "6. Data Storage and Privacy. Information you enter is stored to allow the Application to function across sessions, including any personal identification number (\"PIN\") you set. You are responsible for safeguarding any device on which the Application is used. The Application is not intended or represented to comply with HIPAA or any comparable healthcare privacy regulation, and no assurance is made regarding the security of information you enter. Further detail regarding the collection and use of information is set out in the Application's separate Privacy Policy, which is incorporated into this agreement by reference.",
  "7. Limitation of Liability. To the fullest extent permitted by applicable law, the developer, its affiliates, and any individual involved in creating the Application shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages - including without limitation personal injury, worsening of a medical or mental health condition, a missed medication dose, or any other harm - arising out of or in any way connected with your use of, or inability to use, the Application, regardless of the legal theory on which such damages are claimed and even if the developer has been advised of the possibility of such damages.",
  "8. Indemnification. You agree to indemnify, defend, and hold harmless the developer and its affiliates from and against any and all claims, damages, liabilities, costs, and expenses, including reasonable attorneys' fees, arising out of or related to your use of the Application, your violation of this agreement, or your violation of any right of a third party.",
  "9. Emergency Situations. The Application is not designed or intended for use in a medical or psychiatric emergency. If you are experiencing a medical emergency, or having thoughts of suicide or self-harm, do not rely on the Application. Contact emergency services or a crisis line in your area immediately.",
  "10. Age Requirement. The Application is intended for use by individuals who have reached the age of majority in their jurisdiction of residence. Use by a minor is permitted only under the direct supervision of, and with the consent of, a parent or legal guardian who agrees to be bound by this agreement on the minor's behalf.",
  "11. Lawful Use. You agree to use the Application only for lawful purposes and in a manner consistent with this agreement. You agree not to use the Application to engage in any unlawful, fraudulent, abusive, or malicious activity, including without limitation attempting to gain unauthorized access to the Application or any account, data, or system connected to it, interfering with or disrupting its operation, misrepresenting your identity, or using the Application to harm, harass, or defraud any other person.",
  "12. Enforcement. The developer reserves the right to investigate any suspected violation of this agreement or applicable law and to pursue all available remedies, including civil action and reporting to law enforcement, against any individual who misuses the Application, attempts unauthorized access, or otherwise violates this agreement. Nothing in this agreement limits the developer's right to press charges or cooperate with law enforcement or regulatory authorities in connection with any unlawful act related to the Application.",
  "13. Intellectual Property. The Application, including its design, text, graphics, and underlying software, is owned by the developer or its licensors and is protected by copyright, trademark, and other intellectual property laws. Except for the limited license to use the Application granted herein, no right, title, or interest in the Application is transferred to you. You may not copy, modify, distribute, sell, lease, reverse engineer, or create derivative works based on the Application, except to the extent such restriction is prohibited by applicable law.",
  "14. Term and Termination. This agreement remains in effect for as long as you use the Application. The developer may suspend or terminate your access to the Application at any time, with or without notice, for conduct that violates this agreement or is otherwise harmful to other users, the developer, or third parties. You may discontinue use of the Application at any time.",
  "15. Governing Law and Dispute Resolution. This agreement shall be governed by and construed in accordance with the laws of the developer's principal place of business, without regard to its conflict of law principles, except as otherwise required by applicable consumer protection law in your jurisdiction of residence. Any dispute arising out of or relating to this agreement or the Application shall first be attempted to be resolved informally; if resolution cannot be reached, the dispute may be resolved in a court of competent jurisdiction or, where permitted by law, through binding arbitration.",
  "16. Apple App Store Terms. If you obtained the Application through Apple's App Store, the following additional terms apply and, in the event of any conflict, take precedence over the corresponding terms above: (a) this agreement is between you and the developer only, and not with Apple Inc. (\"Apple\"), and Apple is not responsible for the Application or its content; (b) the license granted to you is limited to a non-transferable license to use the Application on any Apple-branded product that you own or control, as permitted by the App Store's usage rules; (c) Apple has no obligation to furnish any maintenance or support services with respect to the Application; (d) in the event of any failure of the Application to conform to an applicable warranty, you may notify Apple, and Apple will refund the applicable purchase price, if any, and, to the maximum extent permitted by law, Apple will have no other warranty obligation with respect to the Application; (e) the developer, not Apple, is responsible for addressing any claims relating to the Application, including product liability claims, claims that the Application fails to conform to a legal or regulatory requirement, and claims arising under consumer protection or similar legislation; (f) in the event of a third-party claim that the Application infringes a third party's intellectual property rights, the developer, not Apple, is solely responsible for the investigation, defense, and resolution of such claim; (g) you represent and warrant that you are not located in a country subject to a U.S. Government embargo or designated as a \"terrorist supporting\" country, and that you are not listed on any U.S. Government list of prohibited or restricted parties; and (h) Apple and Apple's subsidiaries are third-party beneficiaries of this agreement and, upon your acceptance of these terms, Apple will have the right to enforce this agreement against you as a third-party beneficiary of it.",
  "17. Contact Information. Questions, concerns, or complaints regarding the Application or this agreement may be directed to the developer using the contact details provided on the Application's App Store listing or support page.",
  "18. Modifications. The developer reserves the right to modify, suspend, or discontinue the Application, or any part of these terms, at any time and without prior notice.",
  "19. Severability. If any provision of this agreement is held to be invalid or unenforceable, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.",
  "20. Entire Agreement. This acknowledgment, together with any other terms presented within the Application, constitutes the entire agreement between you and the developer regarding your use of the Application and supersedes any prior understanding or agreement, whether written or oral, relating to its subject matter.",
  "21. Acknowledgment. By checking \"I understand and agree\" below, you affirm that you are voluntarily entering into this agreement, that you have had the opportunity to review its terms in full, and that you accept them without reservation.",
];

/* ---------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ---------------------------------------------------------------------- */

const todayISO = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-CA");
};

const dateLabel = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

const hashDate = (iso) => {
  let h = 0;
  for (let i = 0; i < iso.length; i++) h = (h * 31 + iso.charCodeAt(i)) >>> 0;
  return h;
};

const celebrateFor = (iso) => CELEBRATE_MESSAGES[hashDate(iso + "c") % CELEBRATE_MESSAGES.length];
const encourageFor = (iso) => ENCOURAGE_MESSAGES[hashDate(iso + "e") % ENCOURAGE_MESSAGES.length];

function affirmationFor(iso, goals) {
  let pool = [...AFFIRMATIONS];
  (goals || []).forEach((g) => { if (AFFIRMATIONS_BY_GOAL[g]) pool = pool.concat(AFFIRMATIONS_BY_GOAL[g]); });
  return pool[hashDate(iso) % pool.length];
}

function normalizeTasks(items) {
  const withWeight = items.map((it) => ({ ...it, weight: WEIGHT_MAP[it.weightTier] || 10 }));
  const totalWeight = withWeight.reduce((s, i) => s + i.weight, 0) || 1;
  let running = 0;
  const pts = withWeight.map((it) => {
    const p = Math.max(1, Math.round((it.weight / totalWeight) * 100));
    running += p;
    return { ...it, points: p };
  });
  const diff = 100 - running;
  if (diff !== 0 && pts.length > 0) {
    let maxIdx = 0;
    for (let i = 1; i < pts.length; i++) if (pts[i].points > pts[maxIdx].points) maxIdx = i;
    pts[maxIdx] = { ...pts[maxIdx], points: pts[maxIdx].points + diff };
  }
  return pts;
}

function buildSystemTaskDefs(goalIds, customGoalText, medication) {
  const map = new Map();
  BASE_TASKS.forEach((t) => map.set(t.id, t));
  (goalIds || []).forEach((g) => {
    (GOAL_TASK_LIBRARY[g] || []).forEach((t) => map.set(t.id, { ...t, cat: g }));
  });
  if ((goalIds || []).includes("other") && customGoalText && customGoalText.trim()) {
    const slug = "custom_" + customGoalText.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 24);
    map.set(slug, { id: slug, name: `Work on: ${customGoalText.trim()}`, weightTier: "medium", cat: "other" });
  }
  if (medication && medication.enabled && medication.times && medication.times.length) {
    medication.times.forEach((t, i) => {
      map.set(`meds_${i}`, { id: `meds_${i}`, name: `Take medication (${formatTime(t)})`, weightTier: "high", cat: "medication" });
    });
  }
  return Array.from(map.values());
}

function buildTasksForGoals(goalIds, customGoalText, medication) {
  return normalizeTasks(buildSystemTaskDefs(goalIds, customGoalText, medication));
}

function formatTime(t) {
  if (!t) return "";
  const parts = t.split(":").map(Number);
  const h = parts[0], m = parts[1];
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function timeToParts(t) {
  const safe = t && t.includes(":") ? t : "08:00";
  const bits = safe.split(":");
  let h = parseInt(bits[0], 10);
  if (isNaN(h)) h = 8;
  let m = parseInt(bits[1], 10);
  if (isNaN(m)) m = 0;
  const period = h >= 12 ? "PM" : "AM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return { h12, m, period };
}
function partsToTime(h12, m, period) {
  let h = h12 % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function taskEarnedPoints(task, rec) {
  if (task.type === "counter") {
    const count = (rec.counters && rec.counters[task.id]) || 0;
    const target = task.target || 1;
    const frac = Math.min(1, count / target);
    return Math.round(frac * task.points);
  }
  return (rec.tasksChecked || []).includes(task.id) ? task.points : 0;
}

function regularPointsFor(tasksLib, rec) {
  return tasksLib.reduce((s, t) => s + taskEarnedPoints(t, rec), 0);
}

async function safeGet(key) {
  try {
    const r = await window.storage.get(key, false);
    return r ? JSON.parse(r.value) : null;
  } catch {
    return null;
  }
}
async function safeSet(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
    return true;
  } catch {
    return false;
  }
}
async function safeDelete(key) {
  try {
    await window.storage.delete(key, false);
    return true;
  } catch {
    return false;
  }
}

/* ---------------------------------------------------------------------- */
/* Main App                                                                */
/* ---------------------------------------------------------------------- */

export default function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tasksLib, setTasksLib] = useState([]);
  const [bonusLib, setBonusLib] = useState(BONUS_DEFAULTS.map((b) => ({ ...b })));
  const [days, setDays] = useState({});
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState("home");
  const [finishModal, setFinishModal] = useState(null);
  const [affirmationModal, setAffirmationModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [dayOffset, setDayOffset] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState({});
  const notifiedRef = useRef({});

  const today = todayISO(dayOffset);

  useEffect(() => {
    (async () => {
      const results = await Promise.all([
        safeGet("profile"), safeGet("tasksLib"), safeGet("bonusLib"), safeGet("days"), safeGet("devDayOffset"), safeGet("badges"),
      ]);
      const p = results[0], t = results[1], b = results[2], d = results[3], off = results[4], bd = results[5];
      if (p) setProfile(p);
      if (t) setTasksLib(t);
      if (b) setBonusLib(b);
      if (d) setDays(d);
      if (typeof off === "number") setDayOffset(off);
      if (bd) setEarnedBadges(bd);
      setUnlocked(!(p && p.pin));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!profile || loading) return;
    setDays((prev) => {
      if (prev[today]) return prev;
      const dateKeys = Object.keys(prev).sort();
      const yesterday = dateKeys.filter((k) => k < today).pop();
      const bonusApplied = yesterday && prev[yesterday] && prev[yesterday].locked ? (prev[yesterday].bonusEarned || 0) : 0;
      const next = {
        ...prev,
        [today]: {
          tasksChecked: [], bonusChecked: [], counters: {}, mealEntries: [],
          mood: null, weight: "", locked: false, score: 0, bonusEarned: 0,
          bonusApplied, remindersSent: {}, affirmationSeen: false,
        },
      };
      safeSet("days", next);
      return next;
    });
  }, [profile, loading, today]);

  useEffect(() => {
    if (!profile || !profile.notifications) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") Notification.requestPermission();

    const interval = setInterval(() => {
      const now = new Date();
      const rec = days[today];
      if (!rec) return;
      const flags = notifiedRef.current;
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const hm = `${hh}:${mm}`;

      if (hm === "09:00" && !flags.morning) {
        flags.morning = true;
        try { if (Notification.permission === "granted") new Notification("Daily Anchor", { body: "Good morning. Ready to check off today's first small thing?" }); } catch (e) {}
      }
      if (hm === "11:00" && !flags.eleven && rec.tasksChecked.length === 0 && !rec.locked) {
        flags.eleven = true;
        try { if (Notification.permission === "granted") new Notification("Daily Anchor", { body: "No pressure - even one small task today still counts." }); } catch (e) {}
      }
      const medTimes = (profile.medication && profile.medication.times) || [];
      medTimes.forEach((t) => {
        const key = "med_" + t;
        if (t === hm && !flags[key]) {
          flags[key] = true;
          try { if (Notification.permission === "granted") new Notification("Daily Anchor", { body: `Time to take your medication (${formatTime(t)}).` }); } catch (e) {}
        }
      });
    }, 20000);
    return () => clearInterval(interval);
  }, [profile, days, today]);

  // Keep the saved task list in sync with what the current goal library says
  // it should contain - adds newly-introduced tasks (like Protein) and drops
  // retired ones, without touching anything the user added themselves.
  useEffect(() => {
    if (loading || !profile) return;
    const removedIds = new Set(profile.removedTaskIds || []);
    const systemDefs = buildSystemTaskDefs(profile.goals || [], profile.customGoalText, profile.medication)
      .filter((t) => !removedIds.has(t.id));
    setTasksLib((prev) => {
      const customDefs = prev
        .filter((t) => t.cat === "custom")
        .map(({ points, weight, ...rest }) => rest);
      const merged = normalizeTasks([...systemDefs, ...customDefs]);
      const sameIds =
        prev.length === merged.length && prev.every((t) => merged.some((m) => m.id === t.id));
      if (sameIds) return prev;
      safeSet("tasksLib", merged);
      return merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, profile && JSON.stringify({ g: profile.goals, c: profile.customGoalText, m: profile.medication, r: profile.removedTaskIds })]);

  // Keep the Protein task's target in sync with the profile's protein goal,
  // so the counter and the points it awards always agree.
  useEffect(() => {
    if (!profile) return;
    const desired = Number(profile.proteinGoal) || 100;
    setTasksLib((prev) => {
      const idx = prev.findIndex((t) => t.id === "protein_log");
      if (idx === -1 || prev[idx].target === desired) return prev;
      const next = prev.map((t, i) => (i === idx ? { ...t, target: desired } : t));
      safeSet("tasksLib", next);
      return next;
    });
  }, [profile && profile.proteinGoal]);

  // Self-heal: older profiles won't have a createdDate yet, needed for the
  // once-every-7-days weigh-in cadence. Backfill it once, quietly.
  useEffect(() => {
    if (profile && !profile.createdDate) {
      const dateKeys = Object.keys(days).sort();
      const earliest = dateKeys[0] || today;
      const patched = { ...profile, createdDate: earliest };
      setProfile(patched);
      safeSet("profile", patched);
    }
  }, [profile, days, today]);

  const todayRec = days[today] || {
    tasksChecked: [], bonusChecked: [], counters: {}, mealEntries: [], mood: null,
    weight: "", locked: false, score: 0, bonusEarned: 0, bonusApplied: 0,
    remindersSent: {}, affirmationSeen: false,
  };

  useEffect(() => {
    if (profile && profile.showAffirmation !== false && days[today] && !days[today].affirmationSeen && !loading) {
      setAffirmationModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, !!days[today], loading]);

  const regularPoints = regularPointsFor(tasksLib, todayRec);
  const liveScore = regularPoints + (todayRec.bonusApplied || 0);
  const passingThreshold = (profile && profile.threshold) || 70;
  const showNutrition = !!(profile && profile.goals && (profile.goals.includes("keto") || profile.goals.includes("weightloss")));
  const showWeight = showNutrition;

  const updateDay = useCallback((iso, patchOrFn) => {
    setDays((prev) => {
      const base = prev[iso] || {
        tasksChecked: [], bonusChecked: [], counters: {}, mealEntries: [], mood: null,
        weight: "", locked: false, score: 0, bonusEarned: 0, bonusApplied: 0,
        remindersSent: {}, affirmationSeen: false,
      };
      const patch = typeof patchOrFn === "function" ? patchOrFn(base) : patchOrFn;
      const next = { ...prev, [iso]: { ...base, ...patch } };
      safeSet("days", next);
      return next;
    });
  }, []);

  // These read/write through updateDay's functional form (computing off the
  // freshest `base`, not the outer render's todayRec) so that multiple rapid
  // taps - which React can batch together before any of them re-render -
  // don't clobber each other and silently lose a checked task.
  const toggleTask = (id) => {
    if (todayRec.locked) return;
    updateDay(today, (base) => {
      const has = base.tasksChecked.includes(id);
      return { tasksChecked: has ? base.tasksChecked.filter((x) => x !== id) : [...base.tasksChecked, id] };
    });
  };
  const toggleBonus = (id) => {
    if (todayRec.locked) return;
    updateDay(today, (base) => {
      const has = base.bonusChecked.includes(id);
      return { bonusChecked: has ? base.bonusChecked.filter((x) => x !== id) : [...base.bonusChecked, id] };
    });
  };
  const setCounter = (id, target, delta) => {
    if (todayRec.locked) return;
    updateDay(today, (base) => {
      const cur = (base.counters && base.counters[id]) || 0;
      const next = Math.max(0, Math.min(target, cur + delta));
      return { counters: { ...base.counters, [id]: next } };
    });
  };

  const addMealEntry = (name, carbs) => {
    const entry = { id: "meal_" + Date.now(), name, carbs: Number(carbs) || 0 };
    const mealTask = tasksLib.find((t) => t.id === "wl_meal" || t.id === "keto_meal");
    const mealTaskId = mealTask ? mealTask.id : null;
    const carbTask = tasksLib.find((t) => t.id === "keto_carbs");
    const carbTaskId = carbTask ? carbTask.id : null;
    updateDay(today, (base) => {
      const nextEntries = [...(base.mealEntries || []), entry];
      const patch = { mealEntries: nextEntries };
      let currentChecked = base.tasksChecked;
      if (mealTaskId && !currentChecked.includes(mealTaskId)) {
        currentChecked = [...currentChecked, mealTaskId];
        patch.tasksChecked = currentChecked;
      }
      const totalCarbs = nextEntries.reduce((s, e) => s + e.carbs, 0);
      if (carbTaskId && totalCarbs > 0 && !currentChecked.includes(carbTaskId)) {
        patch.tasksChecked = [...currentChecked, carbTaskId];
      }
      return patch;
    });
  };
  const removeMealEntry = (id) => {
    updateDay(today, (base) => ({ mealEntries: (base.mealEntries || []).filter((e) => e.id !== id) }));
  };

  const finishDay = () => {
    const bonusChecked = todayRec.bonusChecked.length;
    const eligible = regularPoints >= BONUS_ELIGIBILITY_THRESHOLD;
    const bonusEarned = eligible ? bonusChecked * BONUS_POINT_VALUE : 0;
    const score = liveScore;
    updateDay(today, { locked: true, score, bonusEarned });
    const passed = score >= passingThreshold;
    const skipped = tasksLib.filter((t) => taskEarnedPoints(t, todayRec) < t.points);

    const projectedDays = { ...days, [today]: { ...todayRec, locked: true, score, bonusEarned } };
    const { updated: updatedBadges, newly: newBadges } = evaluateNewBadges(projectedDays, passingThreshold, earnedBadges, today);
    if (newBadges.length > 0) {
      setEarnedBadges(updatedBadges);
      safeSet("badges", updatedBadges);
    }

    setFinishModal({ stage: "result", score, passed, skipped, bonusEarned, bonusChecked, eligible, newBadges });
  };

  const addCustomTask = (name, tier) => {
    const id = "custom_" + Date.now();
    const next = normalizeTasks([...tasksLib, { id, name, weightTier: tier, cat: "custom" }]);
    setTasksLib(next);
    safeSet("tasksLib", next);
  };
  const editTask = (id, name, tier) => {
    const next = normalizeTasks(tasksLib.map((t) => (t.id === id ? { ...t, name, weightTier: tier } : t)));
    setTasksLib(next);
    safeSet("tasksLib", next);
  };
  const moveTask = (id, direction) => {
    setTasksLib((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const swapIdx = idx + direction;
      if (idx === -1 || swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[idx];
      next[idx] = next[swapIdx];
      next[swapIdx] = tmp;
      safeSet("tasksLib", next);
      return next;
    });
  };
  const removeTask = (id) => {
    if (tasksLib.length <= 1) return;
    const removed = tasksLib.find((t) => t.id === id);
    const next = normalizeTasks(tasksLib.filter((t) => t.id !== id));
    setTasksLib(next);
    safeSet("tasksLib", next);
    if (removed && removed.cat !== "custom" && profile) {
      const removedTaskIds = Array.from(new Set([...(profile.removedTaskIds || []), id]));
      const patched = { ...profile, removedTaskIds };
      setProfile(patched);
      safeSet("profile", patched);
    }
  };
  const addBonusTask = (name) => {
    const id = "bonus_" + Date.now();
    const next = [...bonusLib, { id, name, points: BONUS_POINT_VALUE }];
    setBonusLib(next);
    safeSet("bonusLib", next);
  };
  const removeBonusTask = (id) => {
    const next = bonusLib.filter((b) => b.id !== id);
    setBonusLib(next);
    safeSet("bonusLib", next);
  };

  const resetToday = () => {
    setDays((prev) => {
      const dateKeys = Object.keys(prev).sort();
      const yesterday = dateKeys.filter((k) => k < today).pop();
      const bonusApplied = yesterday && prev[yesterday] && prev[yesterday].locked ? (prev[yesterday].bonusEarned || 0) : 0;
      const next = {
        ...prev,
        [today]: {
          tasksChecked: [], bonusChecked: [], counters: {}, mealEntries: [],
          mood: null, weight: "", locked: false, score: 0, bonusEarned: 0,
          bonusApplied, remindersSent: {}, affirmationSeen: false,
        },
      };
      safeSet("days", next);
      return next;
    });
    setAffirmationModal(true);
  };

  const advanceDay = () => {
    if (!todayRec.locked) {
      const bonusCheckedCount = todayRec.bonusChecked.length;
      const eligible = regularPoints >= BONUS_ELIGIBILITY_THRESHOLD;
      const bonusEarned = eligible ? bonusCheckedCount * BONUS_POINT_VALUE : 0;
      const score = liveScore;
      updateDay(today, { locked: true, score, bonusEarned });
      const projectedDays = { ...days, [today]: { ...todayRec, locked: true, score, bonusEarned } };
      const { updated: updatedBadges, newly } = evaluateNewBadges(projectedDays, passingThreshold, earnedBadges, today);
      if (newly.length > 0) {
        setEarnedBadges(updatedBadges);
        safeSet("badges", updatedBadges);
      }
    }
    const next = dayOffset + 1;
    setDayOffset(next);
    safeSet("devDayOffset", next);
  };
  const resetDayOffset = () => {
    setDayOffset(0);
    safeSet("devDayOffset", 0);
  };

  const fullReset = async () => {
    await Promise.all([
      safeDelete("profile"), safeDelete("tasksLib"), safeDelete("bonusLib"),
      safeDelete("days"), safeDelete("devDayOffset"), safeDelete("badges"),
    ]);
    setProfile(null);
    setTasksLib([]);
    setBonusLib(BONUS_DEFAULTS.map((b) => ({ ...b })));
    setDays({});
    setDayOffset(0);
    setEarnedBadges({});
    setUnlocked(false);
    setTab("home");
    setFinishModal(null);
    setAffirmationModal(false);
    notifiedRef.current = {};
  };

  const exportData = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(), appVersion: 1,
        profile, tasksLib, bonusLib, days, badges: earnedBadges,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily-anchor-backup-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch {
      return false;
    }
  };

  const importData = (file, onDone) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const payload = JSON.parse(e.target.result);
        if (!payload || typeof payload !== "object") throw new Error("bad file");
        const tasks = [
          payload.profile ? safeSet("profile", payload.profile) : Promise.resolve(),
          payload.tasksLib ? safeSet("tasksLib", payload.tasksLib) : Promise.resolve(),
          payload.bonusLib ? safeSet("bonusLib", payload.bonusLib) : Promise.resolve(),
          payload.days ? safeSet("days", payload.days) : Promise.resolve(),
          payload.badges ? safeSet("badges", payload.badges) : Promise.resolve(),
        ];
        await Promise.all(tasks);
        if (payload.profile) setProfile(payload.profile);
        if (payload.tasksLib) setTasksLib(payload.tasksLib);
        if (payload.bonusLib) setBonusLib(payload.bonusLib);
        if (payload.days) setDays(payload.days);
        if (payload.badges) setEarnedBadges(payload.badges);
        setUnlocked(!(payload.profile && payload.profile.pin));
        onDone(true);
      } catch {
        onDone(false);
      }
    };
    reader.onerror = () => onDone(false);
    reader.readAsText(file);
  };

  const completeOnboarding = (data) => {
    const medication = { enabled: data.medsNeeded, times: data.medsNeeded ? data.medTimes.filter(Boolean) : [] };
    const built = buildTasksForGoals(data.goals, data.customGoalText, medication);
    const newProfile = {
      name: data.name, pin: data.pin || "", goals: data.goals,
      customGoalText: data.customGoalText || "", notifications: data.notifications,
      threshold: 70, startWeight: data.startWeight || "", goalWeight: data.goalWeight || "",
      medication: medication, proteinGoal: "", carbGoal: data.goals.includes("keto") ? 25 : "",
      waiverAccepted: !!data.waiverAccepted, createdDate: today,
      darkMode: false, fontSize: "medium", showAffirmation: true,
    };
    setProfile(newProfile);
    setTasksLib(built);
    setUnlocked(!newProfile.pin);
    safeSet("profile", newProfile);
    safeSet("tasksLib", built);
    safeSet("bonusLib", BONUS_DEFAULTS.map((b) => ({ ...b })));
  };

  const lockedDates = Object.keys(days).filter((d) => days[d].locked).sort();
  const last7 = lockedDates.slice(-7);
  const weeklyAvg = last7.length ? Math.round(last7.reduce((s, d) => s + days[d].score, 0) / last7.length) : null;

  let streak = 0;
  {
    const allLocked = [...lockedDates].sort().reverse();
    let cursor = todayRec.locked ? today : allLocked[0];
    for (let i = 0; i < allLocked.length; i++) {
      if (!cursor) break;
      if (allLocked[i] === cursor) {
        streak += 1;
        const d = new Date(cursor + "T00:00:00");
        d.setDate(d.getDate() - 1);
        cursor = d.toLocaleDateString("en-CA");
      } else break;
    }
  }

  const daysSinceStart = profile && profile.createdDate ? daysBetween(profile.createdDate, today) : 0;
  const showWeighInPrompt = showWeight && daysSinceStart > 0 && daysSinceStart % WEIGHT_CHECKIN_DAYS === 0;

  const appClass = "da-app"
    + (profile && profile.darkMode ? " da-dark" : "")
    + (profile && profile.fontSize === "large" ? " da-font-large" : "")
    + (profile && profile.fontSize === "small" ? " da-font-small" : "");

  if (loading) {
    return (
      <div className={appClass + " da-center"} style={{ minHeight: 420 }}>
        <style>{STYLE}</style>
        <p className="da-muted">Loading your day...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={appClass}>
        <style>{STYLE}</style>
        <Onboarding onComplete={completeOnboarding} />
      </div>
    );
  }

  if (profile.pin && !unlocked) {
    return (
      <div className={appClass + " da-center"} style={{ minHeight: 420 }}>
        <style>{STYLE}</style>
        <div className="da-card" style={{ maxWidth: 320, width: "100%", textAlign: "center" }}>
          <Lock size={28} style={{ color: "var(--sage-dark)" }} />
          <h2 className="da-h2" style={{ marginTop: 8 }}>Welcome back, {profile.name}</h2>
          <p className="da-muted" style={{ marginBottom: 14 }}>Enter your PIN to continue.</p>
          <input
            className="da-input" type="password" inputMode="numeric" value={pinInput} maxLength={8}
            onChange={(e) => { setPinInput(e.target.value); setPinError(""); }}
            style={{ textAlign: "center", letterSpacing: 4, fontSize: 20 }} placeholder="****"
          />
          {pinError && <p style={{ color: "#B5544A", fontSize: 13, marginTop: 6 }}>{pinError}</p>}
          <button
            className="da-btn da-btn-primary" style={{ marginTop: 12, width: "100%" }}
            onClick={() => {
              if (pinInput === profile.pin) { setUnlocked(true); setPinInput(""); }
              else setPinError("That PIN doesn't match. Try again.");
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={appClass}>
      <style>{STYLE}</style>
      <div className="da-shell">
        <header className="da-header">
          <div>
            <p className="da-eyebrow">
              {(() => { const d = new Date(); d.setDate(d.getDate() + dayOffset); return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }); })()}
            </p>
            <h1 className="da-h1">Hi, {profile.name}</h1>
          </div>
          <div className="da-header-icon">{profile.notifications ? <Bell size={20} /> : <BellOff size={20} />}</div>
        </header>

        {streak >= 2 && (
          <div className="da-streak-banner">
            <Flame size={16} /> {streak}-day streak - you're building real consistency.
          </div>
        )}

        {tab === "home" && (
          <Home
            profile={profile} tasksLib={tasksLib} bonusLib={bonusLib} todayRec={todayRec}
            liveScore={liveScore} regularPoints={regularPoints} passingThreshold={passingThreshold}
            showNutrition={showNutrition} showWeighInPrompt={showWeighInPrompt} daysSinceStart={daysSinceStart}
            toggleTask={toggleTask} toggleBonus={toggleBonus} setCounter={setCounter}
            addMealEntry={addMealEntry} removeMealEntry={removeMealEntry}
            onFinishRequest={() => setFinishModal({ stage: "confirm" })}
            addCustomTask={addCustomTask} addBonusTask={addBonusTask}
            updateDay={updateDay} today={today}
          />
        )}

        {tab === "history" && (
          <HistoryView
            days={days} tasksLib={tasksLib} bonusLib={bonusLib} lockedDates={lockedDates}
            weeklyAvg={weeklyAvg} passingThreshold={passingThreshold} showWeight={showWeight}
            earnedBadges={earnedBadges}
          />
        )}

        {tab === "settings" && (
          <SettingsView
            profile={profile} setProfile={(p) => { setProfile(p); safeSet("profile", p); }}
            tasksLib={tasksLib} removeTask={removeTask} editTask={editTask} moveTask={moveTask} addCustomTask={addCustomTask}
            bonusLib={bonusLib} removeBonusTask={removeBonusTask} addBonusTask={addBonusTask}
            resetToday={resetToday} dayOffset={dayOffset} advanceDay={advanceDay} resetDayOffset={resetDayOffset}
            fullReset={fullReset} exportData={exportData} importData={importData}
          />
        )}

        <nav className="da-nav">
          <NavBtn active={tab === "home"} onClick={() => setTab("home")} icon={<HomeIcon size={20} />} label="Today" />
          <NavBtn active={tab === "history"} onClick={() => setTab("history")} icon={<HistoryIcon size={20} />} label="History" />
          <NavBtn active={tab === "settings"} onClick={() => setTab("settings")} icon={<SettingsIcon size={20} />} label="Settings" />
        </nav>
      </div>

      {affirmationModal && (
        <Modal onClose={() => { setAffirmationModal(false); updateDay(today, { affirmationSeen: true }); }}>
          <div style={{ textAlign: "center" }}>
            <Sparkles size={26} style={{ color: "var(--sage-dark)" }} />
            <p className="da-label" style={{ marginTop: 10 }}>Today's affirmation</p>
            <h2 className="da-h2" style={{ fontStyle: "italic" }}>"{affirmationFor(today, profile.goals)}"</h2>
          </div>
          <button
            className="da-btn da-btn-primary" style={{ marginTop: 16, width: "100%" }}
            onClick={() => { setAffirmationModal(false); updateDay(today, { affirmationSeen: true }); }}
          >
            Start my day
          </button>
        </Modal>
      )}

      {finishModal && finishModal.stage === "confirm" && (
        <Modal onClose={() => setFinishModal(null)}>
          <h2 className="da-h2">Finished for today?</h2>
          <p className="da-muted">
            Once you confirm, today's tasks will be locked and can't be edited.
            {regularPoints >= BONUS_ELIGIBILITY_THRESHOLD
              ? " Your checked bonus tasks will carry over as extra points toward tomorrow."
              : ` Bonus points only carry over once you reach ${BONUS_ELIGIBILITY_THRESHOLD} regular points - you're at ${regularPoints} right now, so bonus won't be banked today.`}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="da-btn da-btn-ghost" style={{ flex: 1 }} onClick={() => setFinishModal(null)}>Not yet</button>
            <button className="da-btn da-btn-primary" style={{ flex: 1 }} onClick={finishDay}>Yes, finish today</button>
          </div>
        </Modal>
      )}

      {finishModal && finishModal.stage === "result" && (
        <Modal onClose={() => setFinishModal(null)}>
          <div style={{ textAlign: "center", position: "relative" }}>
            {finishModal.passed && <Confetti />}
            <Award size={30} className={finishModal.passed ? "da-award-pop" : ""} style={{ color: finishModal.passed ? "var(--peach)" : "var(--sky)" }} />
            <h2 className="da-h2" style={{ marginTop: 8 }}>{finishModal.score} / 100</h2>
            <p style={{ marginTop: 6 }}>{finishModal.passed ? celebrateFor(today) : encourageFor(today)}</p>
            {finishModal.bonusChecked > 0 && (
              <p className="da-muted" style={{ marginTop: 8 }}>
                {finishModal.eligible
                  ? `+${finishModal.bonusEarned} bonus points will start off tomorrow.`
                  : `Your ${finishModal.bonusChecked} bonus task(s) weren't banked - you needed ${BONUS_ELIGIBILITY_THRESHOLD} regular points first.`}
              </p>
            )}
          </div>
          {finishModal.newBadges && finishModal.newBadges.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p className="da-label">New badge{finishModal.newBadges.length > 1 ? "s" : ""} unlocked</p>
              <div className="da-badge-row">
                {finishModal.newBadges.map((b) => (
                  <BadgeChip key={b.id} badge={b} earned />
                ))}
              </div>
            </div>
          )}
          {finishModal.skipped.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p className="da-label">For next time</p>
              <ul className="da-tip-list">
                {finishModal.skipped.slice(0, 3).map((t) => (
                  <li key={t.id}><strong>{t.name}:</strong> {TASK_TIPS[t.id] || DEFAULT_TIP(t.name)}</li>
                ))}
              </ul>
            </div>
          )}
          <button className="da-btn da-btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={() => setFinishModal(null)}>Done</button>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Onboarding                                                              */
/* ---------------------------------------------------------------------- */

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [goals, setGoals] = useState([]);
  const [customGoalText, setCustomGoalText] = useState("");
  const [startWeight, setStartWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [medsNeeded, setMedsNeeded] = useState(false);
  const [medTimes, setMedTimes] = useState(["08:00"]);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [showWellnessInfo, setShowWellnessInfo] = useState(false);
  const [showKetoInfo, setShowKetoInfo] = useState(false);

  const needsWeight = goals.includes("weightloss") || goals.includes("keto");
  const isKetoGoal = goals.includes("keto");
  const steps = ["welcome", "overview", "waiver", "name", "pin", "goals"]
    .concat(needsWeight ? ["weight"] : [])
    .concat(["medication", "notifications"]);
  const stepKey = steps[step];

  const toggleGoal = (id) => setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="da-center" style={{ minHeight: 480 }}>
      <div className="da-card" style={{ maxWidth: 420, width: "100%" }}>
        <div className="da-progress-dots">
          {steps.map((s, i) => (<span key={s} className={"da-dot" + (i <= step ? " da-dot-active" : "")} />))}
        </div>

        {stepKey === "welcome" && (
          <>
            <Sparkles size={26} style={{ color: "var(--sage-dark)" }} />
            <h2 className="da-h2" style={{ marginTop: 8 }}>Welcome to Daily Anchor</h2>
            <p className="da-muted">
              Daily Anchor is a gentle companion for the everyday things that can feel hard some days -
              brushing your teeth, eating, getting dressed, and more. There's no judgment here, just small
              steps and steady encouragement, one day at a time.
            </p>
            <p className="da-muted" style={{ marginTop: 10 }}>
              Thank you for downloading Daily Anchor. We're glad you're here.
            </p>
          </>
        )}

        {stepKey === "overview" && (
          <>
            <h2 className="da-h2">What Daily Anchor can do</h2>
            <p className="da-muted" style={{ marginBottom: 8 }}>A quick look before you get started.</p>
            <ul className="da-tip-list">
              <li>Track everyday tasks - hygiene, eating, chores, and more - each worth points that add up to 100 a day.</li>
              <li>Match your task list to goals you choose: weight loss, keto, mental health, fitness, sleep, or one you write yourself.</li>
              <li>Log meals and carbs, and track protein with a simple tap counter.</li>
              <li>Get a weekly weigh-in prompt and, if you need one, medication reminders on your own schedule.</li>
              <li>Earn bonus points for extra effort that carry into tomorrow once you've hit your regular points for the day.</li>
              <li>See your daily score, weekly average, and streaks under History.</li>
              <li>Get a daily affirmation and steady, non-judgmental feedback, whatever kind of day it's been.</li>
              <li>Made a mistake, or want a completely clean slate? You can reset just today, or reset the entire app, anytime from Settings.</li>
            </ul>
            <p className="da-label" style={{ marginTop: 16 }}>What you get for finishing</p>
            <ul className="da-tip-list">
              <li>Hit your passing score for the day and you'll get a small celebration and an encouraging message - not just a checkmark.</li>
              <li>Any bonus tasks you complete carry real points into tomorrow, giving you a head start.</li>
              <li>Streaks and milestones unlock achievement badges (visible anytime under History) - your first day, a 7-day streak, 10 passing days, and more.</li>
              <li>Missing the mark never resets anything or takes points away - you always get a fresh 100 the next day.</li>
            </ul>
            <p className="da-label" style={{ marginTop: 16 }}>How you can help this work</p>
            <ul className="da-tip-list">
              <li>Be honest when you check things off. The score, streaks, and feedback are only useful if they reflect what actually happened - there's no one to impress here but yourself.</li>
              <li>Log things in the moment when you can, rather than guessing at the end of the day.</li>
              <li>An honest low score is more useful than an inflated one - it's the only way the app can actually notice a pattern and help.</li>
              <li>Progress, not perfection - a few honest tasks checked off beats a fully checked list that isn't true.</li>
            </ul>
            <p className="da-label" style={{ marginTop: 16 }}>What it can't do</p>
            <ul className="da-tip-list da-limits-list">
              <li>It can't give medical, psychological, or nutritional advice, or diagnose or treat any condition.</li>
              <li>It can't tell you what medications, doses, or diets are right for you - that's for your doctor or dietitian.</li>
              <li>It isn't a crisis or emergency service and won't notify anyone else if you're struggling.</li>
              <li>Its protein, carb, and reminder features are simple estimates and tools, not clinical tracking.</li>
              <li>It can't replace care from a qualified healthcare provider.</li>
            </ul>
          </>
        )}

        {stepKey === "waiver" && (
          <>
            <h2 className="da-h2">Before we begin</h2>
            <p className="da-muted">A quick, important note.</p>
            <div className="da-waiver-box">
              {WAIVER_SECTIONS.map((section, i) => (
                <p key={i} style={{ marginBottom: i === WAIVER_SECTIONS.length - 1 ? 0 : 10 }}>{section}</p>
              ))}
            </div>
            <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="da-link">
              Read the full Privacy Policy
            </a>
            <label className="da-toggle-row" style={{ marginTop: 12 }}>
              <span>I understand and agree</span>
              <input type="checkbox" checked={waiverAccepted} onChange={(e) => setWaiverAccepted(e.target.checked)} />
            </label>
          </>
        )}

        {stepKey === "name" && (
          <>
            <h2 className="da-h2">What should we call you?</h2>
            <p className="da-muted">Just a name, nothing formal.</p>
            <input className="da-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </>
        )}

        {stepKey === "pin" && (
          <>
            <h2 className="da-h2">Set an optional PIN</h2>
            <p className="da-muted">
              This is just a light lock screen for privacy on a shared device - it isn't secure encryption,
              so don't reuse a password you rely on elsewhere. Leave it blank to skip.
            </p>
            <input
              className="da-input" type="password" inputMode="numeric" maxLength={8}
              placeholder="4-digit PIN (optional)" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            />
          </>
        )}

        {stepKey === "goals" && (
          <>
            <h2 className="da-h2">What are you working on?</h2>
            <p className="da-muted">Pick as many as you like. Your task list will match your goals.</p>
            <div className="da-chip-grid">
              {GOAL_OPTIONS.map((g) => (
                <button key={g.id} className={"da-chip" + (goals.includes(g.id) ? " da-chip-active" : "")} onClick={() => toggleGoal(g.id)}>
                  {g.label}
                </button>
              ))}
            </div>
            {goals.includes("other") && (
              <input className="da-input" style={{ marginTop: 10 }} placeholder="Describe your goal" value={customGoalText} onChange={(e) => setCustomGoalText(e.target.value)} />
            )}
            <div style={{ marginTop: 14 }}>
              <button className="da-add-link" style={{ paddingLeft: 0 }} onClick={() => setShowWellnessInfo(true)}>
                Why hydration, sleep, and movement matter
              </button>
            </div>
            {isKetoGoal && (
              <div>
                <button className="da-add-link" style={{ paddingLeft: 0 }} onClick={() => setShowKetoInfo(true)}>
                  New to keto? Read a quick overview
                </button>
              </div>
            )}
          </>
        )}

        {stepKey === "weight" && (
          <>
            <Scale size={24} style={{ color: "var(--sage-dark)" }} />
            <h2 className="da-h2" style={{ marginTop: 8 }}>Weight tracking</h2>
            <p className="da-muted">Optional, and only asked weekly - not every day. Skip either field if you'd rather add it later.</p>
            <input className="da-input" placeholder="Starting weight" value={startWeight} onChange={(e) => setStartWeight(e.target.value)} />
            <input className="da-input" style={{ marginTop: 10 }} placeholder="Goal weight" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} />
          </>
        )}

        {stepKey === "medication" && (
          <>
            <Pill size={24} style={{ color: "var(--sage-dark)" }} />
            <h2 className="da-h2" style={{ marginTop: 8 }}>Medication reminders</h2>
            <p className="da-muted">Do you need a reminder to take medication?</p>
            <div className="da-chip-grid">
              <button className={"da-chip" + (medsNeeded ? " da-chip-active" : "")} onClick={() => setMedsNeeded(true)}>Yes</button>
              <button className={"da-chip" + (!medsNeeded ? " da-chip-active" : "")} onClick={() => setMedsNeeded(false)}>No</button>
            </div>
            {medsNeeded && (
              <div style={{ marginTop: 12 }}>
                <p className="da-label">Reminder times</p>
                {medTimes.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                    <TimeSelect
                      value={t}
                      onChange={(val) => setMedTimes((arr) => arr.map((x, idx) => (idx === i ? val : x)))}
                    />
                    {medTimes.length > 1 && (
                      <button className="da-icon-btn" onClick={() => setMedTimes((arr) => arr.filter((_, idx) => idx !== i))}><Trash2 size={15} /></button>
                    )}
                  </div>
                ))}
                <button className="da-add-link" onClick={() => setMedTimes((arr) => [...arr, "08:00"])}><Plus size={14} /> Add another time</button>
              </div>
            )}
          </>
        )}

        {stepKey === "notifications" && (
          <>
            <Bell size={24} style={{ color: "var(--sage-dark)" }} />
            <h2 className="da-h2" style={{ marginTop: 8 }}>Reminders</h2>
            <p className="da-muted">
              Get a gentle morning nudge, an 11am check-in if nothing's been marked yet, and any medication reminders you set. Turn this off anytime.
            </p>
            <label className="da-toggle-row">
              <span>Enable reminders</span>
              <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
            </label>
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {step > 0 && <button className="da-btn da-btn-ghost" onClick={back}><ChevronLeft size={16} /> Back</button>}
          {stepKey !== "notifications" ? (
            <button
              className="da-btn da-btn-primary" style={{ flex: 1 }}
              disabled={(stepKey === "name" && !name.trim()) || (stepKey === "waiver" && !waiverAccepted)}
              onClick={next}
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="da-btn da-btn-primary" style={{ flex: 1 }}
              onClick={() => onComplete({ name: name.trim(), pin, goals, customGoalText, startWeight, goalWeight, notifications, medsNeeded, medTimes, waiverAccepted })}
            >
              Start my first day
            </button>
          )}
        </div>
      </div>

      {showWellnessInfo && (
        <Modal onClose={() => setShowWellnessInfo(false)}>
          <Sparkles size={26} style={{ color: "var(--sage-dark)" }} />
          <h2 className="da-h2" style={{ marginTop: 8 }}>A few things that help everyone</h2>
          <p className="da-muted" style={{ marginBottom: 8 }}>
            Whatever goals you picked, these three things tend to make the biggest difference to how everything
            else on your list feels.
          </p>
          <ul className="da-tip-list" style={{ fontSize: 13.5 }}>
            <li><strong>Hydration.</strong> Even mild dehydration can affect your energy, mood, and focus. Sipping water steadily through the day works better than waiting until you're thirsty.</li>
            <li><strong>Sleep.</strong> Most adults do best with somewhere around 7-9 hours a night. Short or inconsistent sleep tends to make everything else on your task list feel heavier than it is.</li>
            <li><strong>Movement.</strong> Regular movement - even a short walk - supports mood and energy. It doesn't need to be intense to count.</li>
          </ul>
          <p className="da-muted" style={{ marginTop: 10, fontSize: 12.5 }}>
            This is general wellness information, not medical advice, and it isn't a substitute for guidance from
            a healthcare provider about what's right for you.
          </p>
          <button className="da-btn da-btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={() => setShowWellnessInfo(false)}>Close</button>
        </Modal>
      )}

      {showKetoInfo && (
        <Modal onClose={() => setShowKetoInfo(false)}>
          <Info size={24} style={{ color: "var(--sage-dark)" }} />
          <h2 className="da-h2" style={{ marginTop: 8 }}>About the keto diet</h2>
          <ul className="da-tip-list" style={{ fontSize: 13.5 }}>
            <li><strong>What it is.</strong> Keto is a low-carb, high-fat way of eating. Cutting carbs low enough can shift your body toward burning fat for fuel instead of glucose - a state called ketosis.</li>
            <li><strong>Typical targets.</strong> Many people start around 20-50g of net carbs a day, with most of the rest of their calories coming from fat and a moderate amount of protein. Your carb and protein goals in Settings default to a common starting range, and you can adjust them anytime.</li>
            <li><strong>"Keto flu."</strong> The first several days can bring low energy, headaches, or irritability as your body adjusts and loses water weight along with sodium, potassium, and magnesium. That's why there's an electrolytes task on your list.</li>
            <li><strong>It isn't for everyone.</strong> Talk to a doctor before starting if you're pregnant or breastfeeding, have diabetes or kidney disease, take medication affected by diet, or have any condition involving your metabolism.</li>
          </ul>
          <p className="da-muted" style={{ marginTop: 10, fontSize: 12.5 }}>
            This is general information, not medical or nutritional advice tailored to you.
          </p>
          <button className="da-btn da-btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={() => setShowKetoInfo(false)}>Close</button>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Home                                                                    */
/* ---------------------------------------------------------------------- */

function Home({
  profile, tasksLib, bonusLib, todayRec, liveScore, regularPoints, passingThreshold,
  showNutrition, showWeighInPrompt, daysSinceStart, toggleTask, toggleBonus, setCounter,
  addMealEntry, removeMealEntry, onFinishRequest, addCustomTask, addBonusTask, updateDay, today,
}) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddBonus, setShowAddBonus] = useState(false);
  const [activeTip, setActiveTip] = useState(null);
  const pct = Math.min(100, liveScore);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - pct / 100);
  const moods = ["\uD83D\uDE1E", "\uD83D\uDE15", "\uD83D\uDE10", "\uD83D\uDE42", "\uD83D\uDE04"];
  const bonusEligible = regularPoints >= BONUS_ELIGIBILITY_THRESHOLD;

  return (
    <div className="da-scroll">
      <div className="da-card" style={{ textAlign: "center" }}>
        <svg width="140" height="140" viewBox="0 0 120 120" style={{ margin: "0 auto" }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--ring-bg)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54" fill="none" stroke="var(--sage-dark)" strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
          <text x="60" y="55" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--ink)">{liveScore}</text>
          <text x="60" y="74" textAnchor="middle" fontSize="11" fill="var(--muted-ink)">of 100</text>
        </svg>
        {todayRec.bonusApplied > 0 && <p className="da-muted" style={{ marginTop: 4 }}>Includes +{todayRec.bonusApplied} bonus from yesterday</p>}
        {todayRec.locked && <p className="da-locked-pill"><Lock size={12} /> Today is locked in</p>}
      </div>

      <SectionLabel text="Today's tasks" />
      <div className="da-card">
        {tasksLib.map((t) => (
          <TaskRow
            key={t.id} task={t}
            checked={t.type === "counter" ? ((todayRec.counters && todayRec.counters[t.id]) || 0) >= t.target : todayRec.tasksChecked.includes(t.id)}
            count={(todayRec.counters && todayRec.counters[t.id]) || 0}
            disabled={todayRec.locked}
            onToggle={() => toggleTask(t.id)}
            onIncrement={() => setCounter(t.id, t.target, t.step || 1)}
            onDecrement={() => setCounter(t.id, t.target, -(t.step || 1))}
            showTip={activeTip === t.id}
            onInfo={() => setActiveTip(activeTip === t.id ? null : t.id)}
          />
        ))}
        {!todayRec.locked && (
          showAddTask ? (
            <AddTaskInline onAdd={(name, tier) => { addCustomTask(name, tier); setShowAddTask(false); }} onCancel={() => setShowAddTask(false)} />
          ) : (
            <button className="da-add-link" onClick={() => setShowAddTask(true)}><Plus size={15} /> Add a task</button>
          )
        )}
      </div>

      {showWeighInPrompt && (
        <>
          <SectionLabel text="Weekly weigh-in" />
          <div className="da-card">
            <p className="da-muted" style={{ marginBottom: 8 }}>
              It's day {daysSinceStart} - time for your weekly weigh-in. This only shows up once every 7 days.
            </p>
            <input
              className="da-input" placeholder="Today's weight" value={todayRec.weight} disabled={todayRec.locked}
              onChange={(e) => updateDay(today, { weight: e.target.value })}
            />
          </div>
        </>
      )}

      {showNutrition && (
        <>
          <SectionLabel text="Nutrition log" />
          <NutritionCard profile={profile} todayRec={todayRec} addMealEntry={addMealEntry} removeMealEntry={removeMealEntry} locked={todayRec.locked} />
        </>
      )}

      <SectionLabel text="Bonus (2 pts each - carries to tomorrow if you reach 70 regular points today)" />
      <div className="da-card">
        {!bonusEligible && (
          <p className="da-muted" style={{ marginBottom: 8 }}>
            You're at {regularPoints}/{BONUS_ELIGIBILITY_THRESHOLD} regular points - bonus checked below will only bank once you cross that.
          </p>
        )}
        {bonusLib.map((b) => (
          <TaskRow
            key={b.id} task={b} bonus
            checked={todayRec.bonusChecked.includes(b.id)}
            disabled={todayRec.locked}
            onToggle={() => toggleBonus(b.id)}
          />
        ))}
        {!todayRec.locked && (
          showAddBonus ? (
            <AddBonusInline onAdd={(name) => { addBonusTask(name); setShowAddBonus(false); }} onCancel={() => setShowAddBonus(false)} />
          ) : (
            <button className="da-add-link" onClick={() => setShowAddBonus(true)}><Plus size={15} /> Add a bonus task</button>
          )
        )}
      </div>

      <SectionLabel text="Mood check-in (optional)" />
      <div className="da-card" style={{ display: "flex", justifyContent: "space-between" }}>
        {moods.map((m, i) => (
          <button key={i} disabled={todayRec.locked} className={"da-mood-btn" + (todayRec.mood === i ? " da-mood-active" : "")} onClick={() => updateDay(today, { mood: i })}>
            {m}
          </button>
        ))}
      </div>

      {!todayRec.locked ? (
        <button className="da-btn da-btn-primary" style={{ width: "100%", marginTop: 18 }} onClick={onFinishRequest}>I'm done for today</button>
      ) : (
        <p className="da-muted" style={{ textAlign: "center", marginTop: 18 }}>Come back tomorrow for a fresh 100 points.</p>
      )}
    </div>
  );
}

function NutritionCard({ profile, todayRec, addMealEntry, removeMealEntry, locked }) {
  const [name, setName] = useState("");
  const [carbs, setCarbs] = useState("");
  const entries = todayRec.mealEntries || [];
  const totalCarbs = entries.reduce((s, e) => s + e.carbs, 0);
  const carbGoal = Number(profile.carbGoal) || null;

  return (
    <div className="da-card">
      <div className="da-nutri-bar-wrap">
        <div className="da-nutri-label"><span>Carbs</span><span>{totalCarbs}g{carbGoal ? ` / ${carbGoal}g` : ""}</span></div>
        <div className="da-bar-track"><div className="da-bar-fill" style={{ width: (carbGoal ? Math.min(100, (totalCarbs / carbGoal) * 100) : 0) + "%", background: "var(--peach)" }} /></div>
      </div>
      {!carbGoal && <p className="da-muted" style={{ fontSize: 12, marginTop: 6 }}>Set a daily net carb limit in Settings to track progress here.</p>}

      {entries.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {entries.map((e) => (
            <div key={e.id} className="da-manage-row">
              <span>{e.name} <span className="da-muted">({e.carbs}g carbs)</span></span>
              {!locked && <button className="da-icon-btn" onClick={() => removeMealEntry(e.id)}><Trash2 size={14} /></button>}
            </div>
          ))}
        </div>
      )}

      {!locked && (
        <div className="da-inline-form" style={{ marginTop: 10 }}>
          <input className="da-input" placeholder="Meal name (e.g. lunch)" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="da-input" placeholder="Carbs (g)" inputMode="numeric" value={carbs} onChange={(e) => setCarbs(e.target.value.replace(/\D/g, ""))} />
          <button
            className="da-btn da-btn-ghost" style={{ marginTop: 8, width: "100%" }}
            disabled={!name.trim()}
            onClick={() => { addMealEntry(name.trim(), carbs); setName(""); setCarbs(""); }}
          >
            <Plus size={14} /> Log meal
          </button>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, checked, count, target, disabled, onToggle, onIncrement, onDecrement, bonus, showTip, onInfo }) {
  const tip = TASK_TIPS[task.id] || DEFAULT_TIP(task.name);
  const effectiveTarget = target != null ? target : task.target;
  const unit = task.unit || "";
  return (
    <div className="da-task-wrap">
      <div className="da-task-row">
        {task.type === "counter" ? (
          <>
            <span className={"da-checkbox" + (checked ? " da-checkbox-checked" : "")}>{checked && <Check size={14} color="#fff" />}</span>
            <span className="da-task-name">{task.name}</span>
            <div className="da-stepper">
              <button className="da-stepper-btn" disabled={disabled} onClick={onDecrement}><Minus size={13} /></button>
              <span className="da-stepper-count">{count}{unit}/{effectiveTarget}{unit}</span>
              <button className="da-stepper-btn" disabled={disabled} onClick={onIncrement}><Plus size={13} /></button>
            </div>
          </>
        ) : (
          <button className={"da-task-clickable" + (disabled ? " da-task-disabled" : "")} onClick={onToggle} disabled={disabled}>
            <span className={"da-checkbox" + (checked ? " da-checkbox-checked" : "")}>{checked && <Check size={14} color="#fff" />}</span>
            <span className={"da-task-name" + (checked ? " da-task-done" : "")}>{task.name}</span>
          </button>
        )}
        {onInfo && <button className="da-info-btn" onClick={onInfo}><Info size={14} /></button>}
        <span className={"da-points-pill" + (bonus ? " da-points-bonus" : "")}>+{task.points}</span>
      </div>
      {showTip && <p className="da-tip-inline">{tip}</p>}
    </div>
  );
}

function AddTaskInline({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [tier, setTier] = useState("medium");
  return (
    <div className="da-inline-form">
      <input className="da-input" placeholder="Task name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="da-chip-grid" style={{ marginTop: 8 }}>
        {["low", "medium", "high"].map((t) => (
          <button key={t} className={"da-chip" + (tier === t ? " da-chip-active" : "")} onClick={() => setTier(t)}>{t[0].toUpperCase() + t.slice(1)} priority</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="da-btn da-btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        <button className="da-btn da-btn-primary" style={{ flex: 1 }} disabled={!name.trim()} onClick={() => onAdd(name.trim(), tier)}>Add</button>
      </div>
    </div>
  );
}

function EditTaskInline({ task, onSave, onCancel }) {
  const [name, setName] = useState(task.name);
  const [tier, setTier] = useState(task.weightTier || "medium");
  return (
    <div className="da-inline-form" style={{ padding: "10px 4px" }}>
      <input className="da-input" placeholder="Task name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="da-chip-grid" style={{ marginTop: 8 }}>
        {["low", "medium", "high"].map((t) => (
          <button key={t} className={"da-chip" + (tier === t ? " da-chip-active" : "")} onClick={() => setTier(t)}>{t[0].toUpperCase() + t.slice(1)} priority</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="da-btn da-btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        <button className="da-btn da-btn-primary" style={{ flex: 1 }} disabled={!name.trim()} onClick={() => onSave(name.trim(), tier)}>Save</button>
      </div>
    </div>
  );
}

function AddBonusInline({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  return (
    <div className="da-inline-form">
      <input className="da-input" placeholder="Bonus task name" value={name} onChange={(e) => setName(e.target.value)} />
      <p className="da-muted" style={{ fontSize: 12, marginTop: 6 }}>All bonus tasks are worth {BONUS_POINT_VALUE} points.</p>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="da-btn da-btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        <button className="da-btn da-btn-primary" style={{ flex: 1 }} disabled={!name.trim()} onClick={() => onAdd(name.trim())}>Add</button>
      </div>
    </div>
  );
}

function SectionLabel({ text }) {
  return <p className="da-section-label">{text}</p>;
}

/* ---------------------------------------------------------------------- */
/* History                                                                 */
/* ---------------------------------------------------------------------- */

function HistoryView({ days, tasksLib, bonusLib, lockedDates, weeklyAvg, passingThreshold, showWeight, earnedBadges }) {
  const [viewDay, setViewDay] = useState(null);
  const chartData = lockedDates.slice(-14).map((d) => ({ date: dateLabel(d).split(",")[0], score: days[d].score }));
  const weightData = lockedDates.filter((d) => days[d].weight).slice(-14).map((d) => ({ date: dateLabel(d).split(",")[0], weight: Number(days[d].weight) || 0 }));

  let weeklySuggestion = "Log a few days to see your weekly average and a tailored suggestion here.";
  if (weeklyAvg !== null) {
    if (weeklyAvg < 50) weeklySuggestion = "This week has been heavy. Consider focusing on just two or three core tasks a day rather than the full list.";
    else if (weeklyAvg < 70) weeklySuggestion = "You're building consistency. Try anchoring one task to something you already do daily, like brushing your teeth.";
    else if (weeklyAvg < 90) weeklySuggestion = "Solid week. Look at which task gets skipped most often and see if it needs to move earlier in your day.";
    else weeklySuggestion = "Excellent week - you're clearly finding a rhythm that works. Keep an eye on what's making it click.";
  }

  const moods = ["😞", "😕", "😐", "🙂", "😄"];

  return (
    <div className="da-scroll">
      <div className="da-card">
        <p className="da-label">Weekly average (last {lockedDates.slice(-7).length} days)</p>
        <h2 className="da-h1" style={{ margin: "4px 0" }}>{weeklyAvg !== null ? `${weeklyAvg} / 100` : "-"}</h2>
        <p className="da-muted">{weeklySuggestion}</p>
      </div>

      {chartData.length > 0 && (
        <div className="da-card">
          <p className="da-label" style={{ marginBottom: 8 }}>Recent scores</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ring-bg)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 120]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <ReferenceLine y={passingThreshold} stroke="var(--peach)" strokeDasharray="4 4" />
              <Bar dataKey="score" fill="var(--sage-dark)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {showWeight && weightData.length > 0 && (
        <div className="da-card">
          <p className="da-label" style={{ marginBottom: 8 }}>Weight over time</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ring-bg)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="var(--sky)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <SectionLabel text="Achievements" />
      <div className="da-card">
        <div className="da-badge-grid">
          {BADGE_DEFS.map((b) => (
            <BadgeChip key={b.id} badge={b} earned={!!earnedBadges[b.id]} />
          ))}
        </div>
      </div>

      <SectionLabel text="Day by day" />
      <p className="da-muted" style={{ padding: "0 4px", marginBottom: 8, fontSize: 12.5 }}>Tap a day to see the full breakdown.</p>
      {lockedDates.length === 0 && <p className="da-muted" style={{ padding: "0 4px" }}>Finish your first day to see it appear here.</p>}
      {[...lockedDates].reverse().map((d) => {
        const rec = days[d];
        const skipped = tasksLib.filter((t) => taskEarnedPoints(t, rec) < t.points);
        return (
          <button className="da-card da-day-card" key={d} onClick={() => setViewDay(d)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{dateLabel(d)}</strong>
              <span className={"da-points-pill" + (rec.score >= passingThreshold ? "" : " da-points-muted")}>{rec.score} pts</span>
            </div>
            {skipped.length > 0 && <p className="da-muted" style={{ marginTop: 6, fontSize: 13 }}>Missed: {skipped.map((t) => t.name).join(", ")}</p>}
          </button>
        );
      })}

      {viewDay && days[viewDay] && (
        <Modal onClose={() => setViewDay(null)}>
          <h2 className="da-h2">{dateLabel(viewDay)}</h2>
          <p className="da-muted" style={{ marginBottom: 12 }}>
            {days[viewDay].score} / 100 {days[viewDay].score >= passingThreshold ? "- a passing day" : ""}
            {days[viewDay].mood != null ? ` - felt ${moods[days[viewDay].mood]}` : ""}
          </p>
          <p className="da-label">Tasks</p>
          <div style={{ marginBottom: 12 }}>
            {tasksLib.map((t) => {
              const earned = taskEarnedPoints(t, days[viewDay]) >= t.points;
              return (
                <div key={t.id} className="da-manage-row">
                  <span className={earned ? "" : "da-muted"}>{earned ? "✓ " : "· "}{t.name}</span>
                  <span className="da-muted">{taskEarnedPoints(t, days[viewDay])}/{t.points}</span>
                </div>
              );
            })}
          </div>
          {(bonusLib || []).some((b) => (days[viewDay].bonusChecked || []).includes(b.id)) && (
            <>
              <p className="da-label">Bonus completed</p>
              <p className="da-muted" style={{ marginBottom: 12 }}>
                {(bonusLib || []).filter((b) => (days[viewDay].bonusChecked || []).includes(b.id)).map((b) => b.name).join(", ")}
              </p>
            </>
          )}
          {days[viewDay].weight && (
            <p className="da-muted">Weight logged: {days[viewDay].weight}</p>
          )}
          {(days[viewDay].mealEntries || []).length > 0 && (
            <>
              <p className="da-label" style={{ marginTop: 12 }}>Meals logged</p>
              <p className="da-muted">
                {days[viewDay].mealEntries.map((e) => `${e.name} (${e.carbs}g carbs)`).join(", ")}
              </p>
            </>
          )}
          <button className="da-btn da-btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={() => setViewDay(null)}>Close</button>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Settings                                                                */
/* ---------------------------------------------------------------------- */

function SettingsView({ profile, setProfile, tasksLib, removeTask, editTask, moveTask, addCustomTask, bonusLib, removeBonusTask, addBonusTask, resetToday, dayOffset, advanceDay, resetDayOffset, fullReset, exportData, importData }) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddBonus, setShowAddBonus] = useState(false);
  const [pin, setPin] = useState(profile.pin || "");
  const [confirmAction, setConfirmAction] = useState(null); // { message, onConfirm }
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [importMessage, setImportMessage] = useState("");
  const importInputRef = useRef(null);
  const [calcWeight, setCalcWeight] = useState("");
  const [calcActivity, setCalcActivity] = useState("moderate");
  const [copied, setCopied] = useState(false);
  const isKeto = profile.goals && profile.goals.includes("keto");
  const multiplierMap = { sedentary: 0.6, moderate: 0.7, active: 0.85 };
  const multiplier = multiplierMap[calcActivity];
  const suggestedProtein = calcWeight ? Math.round(Number(calcWeight) * multiplier) : null;

  const copyReferral = () => {
    try {
      navigator.clipboard.writeText(REFERRAL_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="da-scroll">
      <SectionLabel text="Appearance" />
      <div className="da-card">
        <label className="da-toggle-row">
          <span>{profile.darkMode ? <Moon size={16} style={{ marginRight: 6, verticalAlign: "-3px" }} /> : <Sun size={16} style={{ marginRight: 6, verticalAlign: "-3px" }} />}Dark mode</span>
          <input type="checkbox" checked={!!profile.darkMode} onChange={(e) => setProfile({ ...profile, darkMode: e.target.checked })} />
        </label>
        <div style={{ marginTop: 12 }}>
          <p className="da-label"><Type size={13} style={{ marginRight: 4, verticalAlign: "-2px" }} />Text size</p>
          <div className="da-chip-grid">
            {["small", "medium", "large"].map((f) => (
              <button key={f} className={"da-chip" + ((profile.fontSize || "medium") === f ? " da-chip-active" : "")} onClick={() => setProfile({ ...profile, fontSize: f })}>
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SectionLabel text="Reminders" />
      <div className="da-card">
        <label className="da-toggle-row">
          <span>Enable reminders</span>
          <input type="checkbox" checked={!!profile.notifications} onChange={(e) => setProfile({ ...profile, notifications: e.target.checked })} />
        </label>
        <p className="da-muted" style={{ fontSize: 13, marginTop: 6 }}>
          A gentle nudge at 9am, a check-in at 11am if nothing's marked yet, and any medication times you've set. Only fires while this tab is open.
        </p>
        <label className="da-toggle-row" style={{ marginTop: 12 }}>
          <span>Show daily affirmation pop-up</span>
          <input type="checkbox" checked={profile.showAffirmation !== false} onChange={(e) => setProfile({ ...profile, showAffirmation: e.target.checked })} />
        </label>
      </div>

      <SectionLabel text="Medication reminders" />
      <div className="da-card">
        <label className="da-toggle-row">
          <span>I need a reminder to take medication</span>
          <input
            type="checkbox" checked={!!(profile.medication && profile.medication.enabled)}
            onChange={(e) => setProfile({ ...profile, medication: { enabled: e.target.checked, times: (profile.medication && profile.medication.times && profile.medication.times.length) ? profile.medication.times : ["08:00"] } })}
          />
        </label>
        {profile.medication && profile.medication.enabled && (
          <div style={{ marginTop: 10 }}>
            {(profile.medication.times || []).map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                <TimeSelect
                  value={t}
                  onChange={(val) => {
                    const times = profile.medication.times.map((x, idx) => (idx === i ? val : x));
                    setProfile({ ...profile, medication: { ...profile.medication, times } });
                  }}
                />
                <button
                  className="da-icon-btn"
                  onClick={() => setProfile({ ...profile, medication: { ...profile.medication, times: profile.medication.times.filter((_, idx) => idx !== i) } })}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              className="da-add-link"
              onClick={() => setProfile({ ...profile, medication: { ...profile.medication, times: [...(profile.medication.times || []), "08:00"] } })}
            >
              <Plus size={14} /> Add another time
            </button>
          </div>
        )}
      </div>

      <SectionLabel text="Passing score" />
      <div className="da-card">
        <div className="da-chip-grid">
          {[50, 60, 70, 80].map((n) => (
            <button key={n} className={"da-chip" + (profile.threshold === n ? " da-chip-active" : "")} onClick={() => setProfile({ ...profile, threshold: n })}>{n} pts</button>
          ))}
        </div>
      </div>

      {profile.goals && (profile.goals.includes("keto") || profile.goals.includes("weightloss")) && (
        <>
          <SectionLabel text="Nutrition goals" />
          <div className="da-card">
            <p className="da-label">Daily protein goal (g)</p>
            <input
              className="da-input" inputMode="numeric" value={profile.proteinGoal || ""}
              onChange={(e) => setProfile({ ...profile, proteinGoal: e.target.value.replace(/\D/g, "") })}
              placeholder="e.g. 100"
            />
            {profile.goals.includes("keto") && (
              <>
                <p className="da-label" style={{ marginTop: 12 }}>Daily net carb limit (g)</p>
                <input
                  className="da-input" inputMode="numeric" value={profile.carbGoal || ""}
                  onChange={(e) => setProfile({ ...profile, carbGoal: e.target.value.replace(/\D/g, "") })}
                  placeholder="e.g. 25"
                />
              </>
            )}

            {isKeto && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--bg)" }}>
                <p className="da-label">Protein calculator</p>
                <p className="da-muted" style={{ fontSize: 12, marginBottom: 8 }}>A rough estimate - not medical advice.</p>
                <input className="da-input" inputMode="numeric" placeholder="Your weight (lbs)" value={calcWeight} onChange={(e) => setCalcWeight(e.target.value.replace(/\D/g, ""))} />
                <div className="da-chip-grid" style={{ marginTop: 8 }}>
                  {["sedentary", "moderate", "active"].map((a) => (
                    <button key={a} className={"da-chip" + (calcActivity === a ? " da-chip-active" : "")} onClick={() => setCalcActivity(a)}>{a[0].toUpperCase() + a.slice(1)}</button>
                  ))}
                </div>
                {suggestedProtein && (
                  <div style={{ marginTop: 10 }}>
                    <p className="da-muted">Suggested: <strong style={{ color: "var(--ink)" }}>{suggestedProtein}g protein/day</strong></p>
                    <button className="da-btn da-btn-ghost" style={{ marginTop: 6 }} onClick={() => setProfile({ ...profile, proteinGoal: String(suggestedProtein) })}>Use as my goal</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <SectionLabel text="PIN" />
      <div className="da-card">
        <input className="da-input" type="password" inputMode="numeric" maxLength={8} placeholder="Leave blank for no PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
        <button className="da-btn da-btn-ghost" style={{ marginTop: 8 }} onClick={() => setProfile({ ...profile, pin })}>Save PIN</button>
      </div>

      <SectionLabel text="Manage tasks" />
      <div className="da-card">
        {tasksLib.map((t, idx) => (
          <div key={t.id}>
            <div className="da-manage-row">
              <div className="da-reorder-btns">
                <button className="da-icon-btn da-icon-neutral" disabled={idx === 0} onClick={() => moveTask(t.id, -1)}><ChevronUp size={14} /></button>
                <button className="da-icon-btn da-icon-neutral" disabled={idx === tasksLib.length - 1} onClick={() => moveTask(t.id, 1)}><ChevronDown size={14} /></button>
              </div>
              <span style={{ flex: 1 }}>{t.name} <span className="da-muted">({t.points} pts)</span></span>
              {t.cat === "custom" && (
                <button className="da-icon-btn da-icon-neutral" onClick={() => setEditingTaskId(editingTaskId === t.id ? null : t.id)}><Pencil size={14} /></button>
              )}
              <button className="da-icon-btn" onClick={() => removeTask(t.id)}><Trash2 size={15} /></button>
            </div>
            {editingTaskId === t.id && (
              <EditTaskInline
                task={t}
                onSave={(name, tier) => { editTask(t.id, name, tier); setEditingTaskId(null); }}
                onCancel={() => setEditingTaskId(null)}
              />
            )}
          </div>
        ))}
        {showAddTask ? (
          <AddTaskInline onAdd={(name, tier) => { addCustomTask(name, tier); setShowAddTask(false); }} onCancel={() => setShowAddTask(false)} />
        ) : (
          <button className="da-add-link" onClick={() => setShowAddTask(true)}><Plus size={15} /> Add a task</button>
        )}
      </div>

      <SectionLabel text="Manage bonus tasks" />
      <div className="da-card">
        {bonusLib.map((b) => (
          <div key={b.id} className="da-manage-row">
            <span>{b.name} <span className="da-muted">(+{b.points} pts)</span></span>
            <button className="da-icon-btn" onClick={() => removeBonusTask(b.id)}><Trash2 size={15} /></button>
          </div>
        ))}
        {showAddBonus ? (
          <AddBonusInline onAdd={(name) => { addBonusTask(name); setShowAddBonus(false); }} onCancel={() => setShowAddBonus(false)} />
        ) : (
          <button className="da-add-link" onClick={() => setShowAddBonus(true)}><Plus size={15} /> Add a bonus task</button>
        )}
      </div>

      <SectionLabel text="Reset & Start Over" />
      <div className="da-card">
        <p className="da-muted" style={{ marginBottom: 10 }}>
          Made a mistake today, or just want a clean slate? You're never locked into anything for good.
        </p>
        <button
          className="da-btn da-btn-ghost" style={{ width: "100%" }}
          onClick={() => setConfirmAction({
            message: "Clear today's checked tasks and start over?",
            confirmLabel: "Start today over",
            onConfirm: resetToday,
          })}
        >
          Clear today and start it over
        </button>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--bg)" }}>
          <p className="da-muted" style={{ marginBottom: 8 }}>
            Want a completely fresh start - new name, new goals, a clean task list, and no history?
          </p>
          <button
            className="da-btn da-btn-primary" style={{ width: "100%" }}
            onClick={() => setConfirmAction({
              message: "This erases your name, goals, tasks, and all history so you can go through onboarding again. This can't be undone.",
              confirmLabel: "Reset everything",
              danger: true,
              onConfirm: fullReset,
            })}
          >
            Reset entire app (start fresh)
          </button>
        </div>
      </div>

      <SectionLabel text="Developer Tools" />
      <div className="da-card" style={{ border: "1.5px dashed var(--ring-bg)" }}>
        <p className="da-muted" style={{ marginBottom: 10, fontSize: 12 }}>
          For testing only - remove this section before shipping to the App Store. It lets you skip ahead in
          time to test streaks, weekly averages, and bonus carryover without waiting for real days to pass.
        </p>
        <p className="da-label">
          Currently viewing: {dayOffset === 0 ? "the real today" : `${dayOffset} day${dayOffset > 1 ? "s" : ""} ahead of today`}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="da-btn da-btn-ghost" style={{ flex: 1 }} onClick={advanceDay}>
            Advance to next day
          </button>
          {dayOffset > 0 && (
            <button className="da-btn da-btn-ghost" style={{ flex: 1 }} onClick={resetDayOffset}>
              Back to real today
            </button>
          )}
        </div>
      </div>

      {confirmAction && (
        <Modal onClose={() => setConfirmAction(null)}>
          <h2 className="da-h2">Are you sure?</h2>
          <p className="da-muted">{confirmAction.message}</p>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="da-btn da-btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmAction(null)}>Cancel</button>
            <button
              className="da-btn da-btn-primary" style={{ flex: 1 }}
              onClick={() => { confirmAction.onConfirm(); setConfirmAction(null); }}
            >
              {confirmAction.confirmLabel}
            </button>
          </div>
        </Modal>
      )}

      {showWaiverModal && (
        <Modal onClose={() => setShowWaiverModal(false)}>
          <h2 className="da-h2">Terms of Use &amp; Waiver</h2>
          <div className="da-waiver-box" style={{ maxHeight: 320 }}>
            {WAIVER_SECTIONS.map((section, i) => (
              <p key={i} style={{ marginBottom: i === WAIVER_SECTIONS.length - 1 ? 0 : 10 }}>{section}</p>
            ))}
          </div>
          <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="da-link">
            Read the full Privacy Policy
          </a>
          <button className="da-btn da-btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={() => setShowWaiverModal(false)}>
            Close
          </button>
        </Modal>
      )}

      <SectionLabel text="Your Data" />
      <div className="da-card">
        <p className="da-muted" style={{ marginBottom: 10 }}>
          Back up everything - your tasks, history, and badges - as a file you can keep, or restore from later
          (for example, after reinstalling or switching phones).
        </p>
        <button className="da-btn da-btn-ghost" style={{ width: "100%" }} onClick={exportData}>
          <Download size={15} /> Export my data
        </button>
        <button
          className="da-btn da-btn-ghost" style={{ width: "100%", marginTop: 8 }}
          onClick={() => importInputRef.current && importInputRef.current.click()}
        >
          <Upload size={15} /> Import from a backup file
        </button>
        <input
          ref={importInputRef} type="file" accept="application/json" style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            importData(file, (success) => {
              setImportMessage(success ? "Backup restored." : "That file couldn't be read as a Daily Anchor backup.");
              setTimeout(() => setImportMessage(""), 4000);
            });
            e.target.value = "";
          }}
        />
        {importMessage && <p className="da-muted" style={{ marginTop: 8, fontSize: 13 }}>{importMessage}</p>}
      </div>

      <SectionLabel text="Legal" />
      <div className="da-card">
        <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="da-link" style={{ marginTop: 0 }}>
          Privacy Policy
        </a>
        <div>
          <button className="da-add-link" style={{ paddingLeft: 0 }} onClick={() => setShowWaiverModal(true)}>
            View Terms of Use &amp; Waiver
          </button>
        </div>
      </div>

      <SectionLabel text="Share Daily Anchor" />
      <div className="da-card">
        <p className="da-muted" style={{ marginBottom: 10 }}>Know someone who might find this helpful?</p>
        <p style={{ fontSize: 14, background: "var(--bg)", padding: 10, borderRadius: 10 }}>{REFERRAL_MESSAGE}</p>
        <button className="da-btn da-btn-primary" style={{ marginTop: 10, width: "100%" }} onClick={copyReferral}>
          <Share2 size={15} /> {copied ? "Copied!" : "Copy message"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Shared bits                                                             */
/* ---------------------------------------------------------------------- */

function NavBtn({ active, onClick, icon, label }) {
  return (
    <button className={"da-nav-btn" + (active ? " da-nav-btn-active" : "")} onClick={onClick}>
      {icon}<span>{label}</span>
    </button>
  );
}

function TimeSelect({ value, onChange, disabled }) {
  const parts = timeToParts(value);
  const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  return (
    <div className="da-time-select">
      <select
        className="da-select" disabled={disabled} value={parts.h12}
        onChange={(e) => onChange(partsToTime(Number(e.target.value), parts.m, parts.period))}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (<option key={h} value={h}>{h}</option>))}
      </select>
      <span className="da-time-colon">:</span>
      <select
        className="da-select" disabled={disabled} value={parts.m}
        onChange={(e) => onChange(partsToTime(parts.h12, Number(e.target.value), parts.period))}
      >
        {minuteOptions.map((m) => (<option key={m} value={m}>{String(m).padStart(2, "0")}</option>))}
      </select>
      <select
        className="da-select" disabled={disabled} value={parts.period}
        onChange={(e) => onChange(partsToTime(parts.h12, parts.m, e.target.value))}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

const CONFETTI_CONFIG = [
  { dx: -60, dy: -70, color: "var(--peach)", delay: 0 },
  { dx: 10, dy: -90, color: "var(--sage-dark)", delay: 0.05 },
  { dx: 70, dy: -60, color: "var(--lavender)", delay: 0.1 },
  { dx: -80, dy: -20, color: "var(--sky)", delay: 0.02 },
  { dx: 80, dy: -10, color: "var(--peach)", delay: 0.12 },
  { dx: -40, dy: -100, color: "var(--sky)", delay: 0.08 },
  { dx: 45, dy: -95, color: "var(--sage-dark)", delay: 0.15 },
  { dx: -20, dy: -50, color: "var(--lavender)", delay: 0.18 },
];

function Confetti() {
  return (
    <div className="da-confetti" aria-hidden="true">
      {CONFETTI_CONFIG.map((c, i) => (
        <span
          key={i}
          style={{
            "--dx": `${c.dx}px`,
            "--dy": `${c.dy}px`,
            background: c.color,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function BadgeChip({ badge, earned }) {
  const Icon = BADGE_ICONS[badge.icon] || Award;
  return (
    <div className={"da-badge-chip" + (earned ? " da-badge-earned" : "")}>
      <span className="da-badge-icon"><Icon size={20} /></span>
      <span className="da-badge-name">{badge.name}</span>
      {!earned && <span className="da-badge-desc">{badge.desc}</span>}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="da-modal-backdrop" onClick={onClose}>
      <div className="da-modal" onClick={(e) => e.stopPropagation()}>
        <button className="da-modal-close" onClick={onClose}><X size={16} /></button>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Styles                                                                  */
/* ---------------------------------------------------------------------- */

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Atkinson+Hyperlegible:wght@400;700&display=swap');

.da-app {
  --bg: #F4F6F1; --surface: #FFFFFF; --ink: #33363A; --muted-ink: #6E736C;
  --sage: #8FA888; --sage-dark: #6E8768; --lavender: #ABA0D9; --sand: #F0E9DC;
  --peach: #E8A868; --sky: #8FB6C2; --ring-bg: #E3E8DE; --danger: #B5544A;
  background: var(--bg); color: var(--ink);
  font-family: 'Atkinson Hyperlegible', system-ui, -apple-system, sans-serif;
  min-height: 100%; border-radius: 16px; padding: 0;
  transition: background 0.2s ease, color 0.2s ease;
}
.da-app.da-dark {
  --bg: #1E211D; --surface: #262A24; --ink: #EDEDE6; --muted-ink: #A9AFA3;
  --sage: #8FB088; --sage-dark: #93C08A; --lavender: #C3B7EA; --sand: #33362E;
  --peach: #EFB47A; --sky: #9BC8D4; --ring-bg: #3A3E35; --danger: #E08278;
}
.da-app.da-font-large { zoom: 1.15; }
.da-app.da-font-small { zoom: 0.9; }
.da-center { display: flex; align-items: center; justify-content: center; padding: 24px; }
.da-shell { max-width: 480px; margin: 0 auto; padding: 20px 16px 90px; position: relative; }
.da-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.da-eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted-ink); margin: 0; }
.da-h1 { font-family: 'Fraunces', Georgia, serif; font-size: 24px; margin: 2px 0 0; font-weight: 600; }
.da-h2 { font-family: 'Fraunces', Georgia, serif; font-size: 19px; margin: 0 0 4px; font-weight: 600; }
.da-header-icon { color: var(--sage-dark); padding-top: 4px; }
.da-muted { color: var(--muted-ink); font-size: 14px; line-height: 1.5; margin: 0; }
.da-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted-ink); margin: 0 0 6px; }
.da-section-label { font-size: 13px; font-weight: 700; color: var(--sage-dark); margin: 18px 4px 8px; }
.da-scroll { display: flex; flex-direction: column; }
.da-card { background: var(--surface); border-radius: 18px; padding: 18px; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(60,60,50,0.06); }
.da-day-card { display: block; width: 100%; text-align: left; border: none; cursor: pointer; font-family: inherit; color: var(--ink); transition: transform 0.1s ease; }
.da-day-card:active { transform: scale(0.98); }
.da-input { width: 100%; padding: 11px 14px; border-radius: 12px; border: 1.5px solid var(--ring-bg); font-size: 15px; font-family: inherit; margin-top: 10px; background: var(--bg); color: var(--ink); box-sizing: border-box; }
.da-input:focus { outline: none; border-color: var(--sage-dark); }
.da-btn { border: none; border-radius: 12px; padding: 12px 18px; font-size: 15px; font-weight: 700; font-family: inherit; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: transform 0.1s ease, opacity 0.15s ease; }
.da-btn:active { transform: scale(0.98); }
.da-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.da-btn-primary { background: var(--sage-dark); color: #fff; }
.da-btn-ghost { background: transparent; color: var(--sage-dark); border: 1.5px solid var(--ring-bg); }
.da-progress-dots { display: flex; gap: 6px; margin-bottom: 14px; }
.da-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ring-bg); }
.da-dot-active { background: var(--sage-dark); }
.da-chip-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.da-chip { padding: 8px 14px; border-radius: 999px; border: 1.5px solid var(--ring-bg); background: var(--surface); font-size: 13px; font-family: inherit; cursor: pointer; color: var(--ink); }
.da-chip-active { background: var(--sage-dark); border-color: var(--sage-dark); color: #fff; }
.da-toggle-row { display: flex; justify-content: space-between; align-items: center; font-size: 15px; }
.da-toggle-row input { width: 20px; height: 20px; accent-color: var(--sage-dark); }
.da-task-wrap { border-bottom: 1px solid var(--bg); }
.da-task-wrap:last-child { border-bottom: none; }
.da-task-row { width: 100%; display: flex; align-items: center; gap: 8px; padding: 10px 4px; }
.da-task-clickable { flex: 1; display: flex; align-items: center; gap: 12px; background: none; border: none; cursor: pointer; text-align: left; font-family: inherit; padding: 0; min-width: 0; }
.da-task-disabled { cursor: default; opacity: 0.75; }
.da-checkbox { width: 22px; height: 22px; min-width: 22px; border-radius: 7px; border: 2px solid var(--ring-bg); display: flex; align-items: center; justify-content: center; }
.da-checkbox-checked { background: var(--sage-dark); border-color: var(--sage-dark); }
.da-task-name { flex: 1; font-size: 15px; color: var(--ink); }
.da-task-done { text-decoration: line-through; color: var(--muted-ink); }
.da-points-pill { font-size: 12px; font-weight: 700; background: var(--sand); color: var(--sage-dark); padding: 3px 9px; border-radius: 999px; white-space: nowrap; }
.da-points-bonus { background: #EDE9F7; color: var(--lavender); }
.da-points-muted { background: var(--ring-bg); color: var(--muted-ink); }
.da-add-link { display: flex; align-items: center; gap: 6px; background: none; border: none; color: var(--sage-dark); font-family: inherit; font-size: 14px; font-weight: 700; padding: 10px 4px; cursor: pointer; }
.da-inline-form { padding-top: 10px; }
.da-mood-btn { font-size: 24px; background: none; border: none; cursor: pointer; padding: 6px; border-radius: 10px; opacity: 0.5; }
.da-mood-active { opacity: 1; background: var(--sand); }
.da-locked-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; background: var(--sand); color: var(--sage-dark); padding: 4px 10px; border-radius: 999px; margin-top: 10px; }
.da-manage-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 2px; font-size: 14px; border-bottom: 1px solid var(--bg); gap: 8px; }
.da-icon-btn { background: none; border: none; color: var(--danger); cursor: pointer; padding: 4px; flex-shrink: 0; }
.da-icon-neutral { color: var(--muted-ink); }
.da-icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.da-reorder-btns { display: flex; flex-direction: column; gap: 0; }
.da-reorder-btns .da-icon-btn { padding: 0; height: 12px; display: flex; align-items: center; }
.da-info-btn { background: none; border: none; color: var(--muted-ink); cursor: pointer; padding: 3px; flex-shrink: 0; }
.da-tip-inline { font-size: 12.5px; color: var(--muted-ink); background: var(--bg); border-radius: 10px; padding: 8px 10px; margin: 0 0 8px; line-height: 1.5; }
.da-stepper { display: flex; align-items: center; gap: 6px; }
.da-stepper-btn { width: 24px; height: 24px; border-radius: 7px; border: 1.5px solid var(--ring-bg); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--sage-dark); }
.da-stepper-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.da-stepper-count { font-size: 13px; font-weight: 700; min-width: 34px; text-align: center; }
.da-streak-banner { display: flex; align-items: center; gap: 6px; background: linear-gradient(90deg, var(--sand), #fff); color: var(--sage-dark); font-weight: 700; font-size: 13px; padding: 9px 14px; border-radius: 12px; margin-bottom: 14px; }
.da-nutri-row { display: flex; gap: 14px; }
.da-nutri-bar-wrap { flex: 1; }
.da-nutri-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted-ink); margin-bottom: 4px; }
.da-bar-track { width: 100%; height: 8px; border-radius: 999px; background: var(--ring-bg); overflow: hidden; }
.da-bar-fill { height: 100%; border-radius: 999px; transition: width 0.3s ease; }
.da-nav { position: fixed; bottom: 0; left: 0; right: 0; max-width: 480px; margin: 0 auto; display: flex; background: var(--surface); border-top: 1px solid var(--ring-bg); padding: 8px 0; border-radius: 16px 16px 0 0; }
.da-nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; border: none; color: var(--muted-ink); font-family: inherit; font-size: 11px; cursor: pointer; padding: 4px; }
.da-nav-btn-active { color: var(--sage-dark); font-weight: 700; }
.da-modal-backdrop { position: fixed; inset: 0; background: rgba(50,50,45,0.4); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 50; }
.da-modal { background: var(--surface); border-radius: 18px; padding: 22px; max-width: 380px; width: 100%; position: relative; font-family: 'Atkinson Hyperlegible', sans-serif; }
.da-modal-close { position: absolute; top: 14px; right: 14px; background: var(--bg); border: none; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted-ink); }
.da-tip-list { padding-left: 18px; margin: 8px 0 0; font-size: 13px; color: var(--muted-ink); line-height: 1.6; }
.da-limits-list { background: var(--bg); border-radius: 12px; padding: 12px 12px 12px 30px; margin-top: 8px; }
.da-time-select { display: flex; align-items: center; gap: 4px; }
.da-select { padding: 9px 8px; border-radius: 10px; border: 1.5px solid var(--ring-bg); background: var(--bg); font-family: inherit; font-size: 14px; color: var(--ink); }
.da-time-colon { font-weight: 700; color: var(--muted-ink); }
.da-waiver-box { max-height: 220px; overflow-y: auto; background: var(--bg); border-radius: 12px; padding: 12px; font-size: 13px; line-height: 1.6; color: var(--muted-ink); margin-top: 10px; }
.da-link { display: inline-block; margin-top: 10px; font-size: 13px; font-weight: 700; color: var(--sage-dark); text-decoration: underline; }
.da-confetti { position: absolute; top: 30%; left: 50%; width: 0; height: 0; pointer-events: none; }
.da-confetti span { position: absolute; top: 0; left: 0; width: 7px; height: 7px; border-radius: 2px; opacity: 0; transform: translate(-50%, -50%) scale(0.4) rotate(0deg); animation: da-confetti-pop 0.9s ease-out forwards; }
@keyframes da-confetti-pop {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(0.4) rotate(0deg); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1) rotate(200deg); }
}
.da-award-pop { animation: da-award-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes da-award-bounce {
  0% { transform: scale(0.3); opacity: 0; }
  60% { transform: scale(1.25); opacity: 1; }
  100% { transform: scale(1); }
}
.da-badge-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
.da-badge-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
.da-badge-chip { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; padding: 12px 6px; border-radius: 14px; background: var(--bg); opacity: 0.5; }
.da-badge-earned { opacity: 1; background: var(--sand); animation: da-award-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.da-badge-icon { width: 36px; height: 36px; border-radius: 50%; background: var(--ring-bg); display: flex; align-items: center; justify-content: center; color: var(--muted-ink); }
.da-badge-earned .da-badge-icon { background: var(--peach); color: #fff; }
.da-badge-name { font-size: 11px; font-weight: 700; color: var(--ink); line-height: 1.3; }
.da-badge-desc { font-size: 10px; color: var(--muted-ink); line-height: 1.3; }
`;
