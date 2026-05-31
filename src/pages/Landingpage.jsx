import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import {
  Zap, Trophy, Users, BarChart2, Bell, Moon,
  ArrowRight, Flame, Star, Shield, ChevronDown,
  Check, Plus, Minus, Apple, Play, IceCream,
  Lamp, Table, Factory, Sunrise, Brain,
  Timer, BookOpen, Droplets, Dumbbell
} from 'lucide-react'
import { FaSquareXTwitter, FaInstagram } from "react-icons/fa6";
import { PiStudent } from "react-icons/pi";

import { MdFamilyRestroom } from "react-icons/md";
import { IoIosLaptop } from "react-icons/io";
import { IoBriefcaseOutline } from "react-icons/io5";
import Phonebg from "../asserts/withtaskr-dashboard.PNG"
  import xpdark from "../asserts/xp-dark.PNG"
  import fullUIdark from "../asserts/fullUI-dark.PNG"
  import fullUI from "../asserts/fullUI-white.PNG"
  import code from "../asserts/code-dark.PNG"
  import dailyDark from "../asserts/daily-dark.PNG"
  import pathner from "../asserts/pathner-dark.PNG"
  import daily from "../asserts/daily.PNG"
  import rank from "../asserts/rank.PNG"
  import heatmap from "../asserts/heatmap.PNG"
  import Leaderboard from "../asserts/leaderboard.PNG"
  import streak from "../asserts/streak-dark.PNG"
  import act from "../asserts/act-dark.PNG"
  import checkin from "../asserts/checkin-dark.PNG"
  import pro from "../asserts/pro.jpg"
  import remote from "../asserts/remote.jpg"
  import parent from "../asserts/parent.jpg"
  import student from "../asserts/student.jpg"
import { img } from 'framer-motion/client';
  
/* ─── DATA ─── */
const FEATURES = [
  {
    id: 'xp',
    eyebrow: 'XP & Levels',
    title: 'Flexible streak rules',
    desc: 'Traditional trackers punish one missed day. Taskr keeps your streak alive through travel days, rest days, and life happening.',
    tags: ['Travel Mode Active', 'Rest Day Credit', 'Sick Day Pass', 'Weekend Flex', 'Pause Option'],
    accent: '#22c55e',
  },
  {
    id: 'planner',
    eyebrow: 'Smart Planner',
    title: 'Smart daily planner',
    desc: 'A focused view that shows only the tasks matching your current time of day — no overwhelm, just clarity.',
    accent: '#22c55e',
  },
  {
    id: 'analytics',
    eyebrow: 'Analytics',
    title: 'Weekly reflection',
    desc: 'A clear summary of your week that highlights what improved and what needs adjusting next time.',
    accent: '#22c55e',
  },
  {
    id: 'alerts',
    eyebrow: 'Smart Alerts',
    title: 'Gentle reminders',
    desc: 'Short, calm nudges that help you stay consistent without pushing too hard — timed when you can actually act.',
    accent: '#22c55e',
  },
]
const IconLinks = [
  {
    icon: <FaSquareXTwitter />,
    href: 'https://twitter.com/withtaskr'
  },
  {
    icon: <FaInstagram />,
    href: 'https://instagram.com/withtaskr'
  }
]
const TASKS = [
  { time: '07:30 AM', label: 'Morning walk', dur: '15 minutes', done: true },
  { time: '09:00 AM', label: 'Drink 3 glasses of water', dur: 'Before 11:00 AM', done: true },
  { time: '10:00 AM', label: 'Deep work session', dur: '60 minutes', done: false },
  { time: '11:30 AM', label: 'Read 10 pages', dur: '30 minutes', done: false },
  { time: '05:00 PM', label: 'Stretch routine', dur: '10 minutes', done: false },
  { time: '10:00 PM', label: 'Plan tomorrow', dur: '5 minutes', done: false },
]

const HABIT_TAGS = [
  { icon: <Sunrise size={14} />, label: 'Morning walk' },
  { icon: <Brain size={14} />, label: 'Focus session' },
  { icon: <Timer size={14} />, label: 'Phone off by 10:30' },
  { icon: <BookOpen size={14} />, label: 'Read 10 pages' },
  { icon: <Droplets size={14} />, label: 'Track water' },
  { icon: <Dumbbell size={14} />, label: 'Stretch routine' },
]

const USE_CASES = [
  {
    id: 1,
    label: 'Professionals',
    icon: <IoBriefcaseOutline />,
    image: pro,
    description:
      'For anyone handling long workdays, shifting priorities, and tight deadlines. Taskr keeps you on top without the overwhelm.',
    stat: '87%',
    statLabel: 'Weekly consistency',
  },
  {
    id: 2,
    label: 'Students',
    icon: <PiStudent />,
    image: student,
    description:
      'Track study sessions, build reading streaks, and stay on top of assignments with calm daily routines.',
    stat: '92%',
    statLabel: 'Assignment completion',
  },
  {
    id: 3,
    label: 'Remote workers',
    icon: <IoIosLaptop />,
    image: remote,
    description:
      'Manage your day across time zones and home distractions. Routine stacks keep remote work focused.',
    stat: '84%',
    statLabel: 'Focus retention',
  },
  {
    id: 4,
    label: 'Busy parents',
    icon: <MdFamilyRestroom />,
    image: parent,
    description:
      'Fit healthy habits around school runs, meal prep, and packed schedules. Short tasks, big wins.',
    stat: '79%',
    statLabel: 'Habit consistency',
  },
]

const TESTIMONIALS = [
  { name: 'Marcus R.', role: 'Fitness Instructor', quote: 'WithTaskr made my mornings feel manageable again. The XP system is addictive in the best way.', init: 'M', stat: null },
  { name: 'Aisha K.', role: 'Digital Marketer', quote: 'The leaderboard keeps me honest. I finally stopped procrastinating on deep-work blocks.', init: 'A', stat: '87%\nImproved weekly focus' },
  { name: 'Ryan C.', role: 'Software Developer', quote: `First productivity app I've stuck with for more than a week. The analytics are a game changer.`, init: 'R', stat: null },
  { name: 'Priya S.', role: 'Busy Parent', quote: 'Logged 40 focus sessions this month with Routine Stacks. Never felt more in control.', init: 'P', stat: '40\nSessions this month' },
  { name: 'Leo M.', role: 'Creative Professional', quote: 'Finally keeps my day organized. The XP makes boring tasks feel worth doing.', init: 'L', stat: '21 Days\nStreak completed' },
  { name: 'Dana W.', role: 'Remote Engineer', quote: `Stopped breaking streaks on weekends after switching to WithTaskr's flex mode.`, init: 'D', stat: null },
]

const TESTIMONIALS_ROW2 = [
  { name: 'Maya Z.', role: 'Student', quote: `The weekly insights show exactly where I fall off. No guilt, just adjustment.`, init: 'M' },
  { name: 'Daniel P.', role: 'Software Eng.', quote: `This is the first habit app that doesn't overwhelm me. Everything feels calm and intentional.`, init: 'D' },
  { name: 'Ethan M.', role: 'Gym Trainer', quote: `I used to ignore reminders from other apps. These feel well-timed and actually helpful.`, init: 'E' },
  { name: 'Laura K.', role: 'Product Designer', quote: `Focus blocks changed the way I work. More done in two hours than used to take half a day.`, init: 'L' },
  { name: 'Priya S.', role: 'Marketing', quote: `The simple visuals and progress cues make it easy to stay consistent every day.`, init: 'P' },
  { name: 'Sofia M.', role: 'UX Researcher', quote: `Feels tailored to my day and keeps me motivated without the pressure.`, init: 'S' },
]

const STATS = [
  { num: '62,000+', label: 'Check-ins logged last month' },
  { num: '87%', label: 'Faster habit completion' },
  { num: '14', label: 'Sessions completed on avg/week' },
  { num: '120+', label: 'Countries with active WithTaskr users' },
]

const AI_FEATURES = [
  { icon: <Zap size={18} />, title: 'Morning walk', desc: 'Suggests the best time to remind you.' },
  { icon: <BarChart2 size={18} />, title: 'Habit Priorities', desc: 'Reorders tasks on busy days.' },
  { icon: <Bell size={18} />, title: 'Routine Insights', desc: 'Highlights what\'s working and what\'s slipping.' },
  { icon: <Flame size={18} />, title: 'Recovery Suggestion', desc: 'Helps you bounce back when you miss a day.' },
]

const FAQS = [
  { q: 'How many tasks can I track?', a: 'As many as you want, but most users keep 5–8 active tasks for better consistency and focus.' },
  { q: 'Do reminders work across all devices?', a: 'Yes — WithTaskr syncs across iOS, Android, and web. Reminders are device-native so they always arrive on time.' },
  { q: 'What happens if I miss a day?', a: 'With Flex Mode active, one missed day won\'t break your streak. You can also bank rest days in advance.' },
  { q: 'Can I create routines for different times of day?', a: 'Absolutely. You can set up Morning, Afternoon, Evening, and Night blocks — each with their own tasks and reminders.' },
  { q: 'Is WithTaskr free to use?', a: 'Yes! The core features are completely free. A Pro plan unlocks advanced analytics, unlimited partners, and AI suggestions.' },
]

const MARQUEE_ITEMS = [
  '#founders', '#students', '#busy-parents', '#remote-teams',
  '#fitness-enthusiasts', '#creatives', '#entrepreneurs', '#freelancers',
  '#deep-work-lovers', '#new-habit-builders',
]

/* ─── HELPERS ─── */
function useInViewRef(opts = {}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px', ...opts })
  return [ref, inView]
}

function FadeUp({ children, delay = 0, className, style, as: Tag = 'div' }) {
  const [ref, inView] = useInViewRef()
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

const ROW_ONE = [
  pathner,
  act,
  checkin,
  code,
  xpdark,
  daily
];

const ROW_TWO = [
  heatmap,
  "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=300&h=200&fit=crop", // reading
  rank,
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=200&fit=crop", // working
  streak,
  "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300&h=200&fit=crop", // waking up
  Leaderboard,
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=200&fit=crop", // focused work
];

function ImageMarquee({ images, reverse = false, speed = 35 }) {
  return (
    <div className="overflow-hidden select-none">
      <motion.div
        className="flex gap-3 whitespace-nowrap"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
        style={{ width: "max-content" }}
      >
        {[...images, ...images].map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-2xl overflow-hidden shadow-md"
            style={{ width: 160, height: 110 }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}function TestimonialCard({ name, role, quote, init, stat }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-stone-200 bg-white flex flex-col min-w-[280px] max-w-[320px]">
      <div className="h-32 bg-gradient-to-br from-stone-100 to-stone-200 relative flex items-end p-4">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
          {init}
        </div>
        {stat && (
          <div className="absolute top-4 right-4 bg-white rounded-xl p-2.5 text-center shadow-sm">
            <div className="text-green-600 font-bold text-lg leading-none">{stat.split('\n')[0]}</div>
            <div className="text-stone-400 text-[10px] mt-0.5">{stat.split('\n')[1]}</div>
          </div>
        )}
      </div>
      <div className="p-5 flex-1">
        <p className="text-stone-600 text-sm leading-relaxed italic mb-4">"{quote}"</p>
        <div>
          <div className="font-semibold text-stone-900 text-sm">{name}</div>
          <div className="text-stone-400 text-xs">{role}</div>
        </div>
      </div>
    </div>
  )
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-stone-200 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-stone-900 text-base">{q}</span>
        <span className="flex-shrink-0 w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400">
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-stone-500 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── MAIN ─── */
export function LandingPage({ onGetStarted, onPrivacy }) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroOpa = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const [activeCase, setActiveCase] = useState(0)
  const currentUseCase = USE_CASES[activeCase]
  const [navScrolled, setNavScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="font-sans bg-[#faf9f7] text-stone-900 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400;1,9..144,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        .font-body { font-family: 'DM Sans', system-ui, sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.5)} }
        .float { animation: float 3.5s ease-in-out infinite; }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
      `}</style>

      {/* ── NAV ── */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 transition-all duration-300 font-body ${
          navScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-stone-100 shadow-sm' : 'bg-transparent'
        }`}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="font-display text-2xl font-medium text-stone-900">
          WithTaskr<span className="text-green-500">.</span>
        </div>
        <div className="hidden md:flex items-center gap-7">
          {[['#features', 'Features'], ['#use-case', 'Use case'], ['#metrics', 'Metrics'], ['#ai', 'Smart Assist']].map(([href, label]) => (
            <a key={href} href={href} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">{label}</a>
          ))}
          <button onClick={onPrivacy} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">Privacy</button>
        </div>
        <div className="flex items-center gap-3">
          {/* <button
            className="hidden md:flex items-center gap-2 text-sm text-stone-900 hover:text-green-600 transition-colors"
            onClick={onGetStarted}
          >
            <Apple size={15} /> App Store
          </button> */}
          <button
            className="flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-green-600 transition-colors"
            onClick={onGetStarted}
          >
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        {/* background */}
        <div className="absolute inset-0 bg-[#faf9f7]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(34,197,94,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-stone-200" />

        <motion.div
          style={{ y: heroY, opacity: heroOpa }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 border border-stone-200 bg-white text-stone-500 text-xs font-medium px-4 py-2 rounded-full mb-8 font-body shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
            Launching June 7, 2026
          </motion.div>

          <motion.h1
            className="font-display text-[clamp(52px,11vw,120px)] font-medium leading-[0.9] tracking-tight text-stone-900 mb-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Turn Productivity<br />
            Into a<br />
            <span className="italic text-green-500">Game</span>
          </motion.h1>

          <motion.p
            className="font-body text-stone-500 text-lg max-w-md mx-auto leading-relaxed mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            You see the right tasks at the right time so your day never feels crowded. Earn XP, level up, compete.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mb-16"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 bg-stone-900 text-white font-body font-medium text-sm px-7 py-3.5 rounded-full hover:bg-green-600 transition-all hover:-translate-y-0.5 shadow-lg shadow-stone-900/10"
            >
              Start tracking for free <ArrowRight size={15} />
            </button>
          </motion.div>

          {/* floating XP cards */}
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {[
              { val: '+50 XP', label: 'Task completed', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
              { val: '#1', label: 'Leaderboard', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
              { val: '7-Day', label: 'Streak active 🔥', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
            ].map(({ val, label, color, bg }, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white shadow-sm font-body ${bg}`}
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                <div className={`font-display text-xl font-medium ${color}`}>{val}</div>
                <div className="text-stone-400 text-xs">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-stone-300 text-[10px] font-body font-medium tracking-widest uppercase"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          <ChevronDown size={15} />
          scroll
        </motion.div>
      </section>

    <div className="border-y border-stone-200 bg-white overflow-hidden relative h-[500px]">

  {/* Left & right fade masks */}
  <div
    className="absolute inset-y-0 left-0 w-32 z-20 pointer-events-none"
    style={{
      background: "linear-gradient(to right, white 0%, transparent 100%)",
    }}
  />
  <div
    className="absolute inset-y-0 right-0 w-32 z-20 pointer-events-none"
    style={{
      background: "linear-gradient(to left, white 0%, transparent 100%)",
    }}
  />

  {/* Marquee rows — vertically centered */}
  <div className="absolute inset-0 flex flex-col justify-center gap-3 py-5">
    <ImageMarquee images={ROW_ONE} speed={38} />
    <ImageMarquee images={ROW_TWO} reverse speed={45} />
  </div>

  {/* Phone mockup */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
    <div
      className="rounded-[1.8rem] overflow-hidden shadow-2xl border-4 border-black"
      style={{ width: 220, height: 450 }}
    >
      <img src={Phonebg} alt="phone" className="w-full h-full object-contain" />
    </div>
  </div>

</div>

      {/* ── BENTO ABOUT ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <FadeUp>
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">Used by people to improve routines</p>
          <h2 className="font-display text-[clamp(40px,6vw,72px)] font-medium leading-tight tracking-tight text-stone-900 max-w-2xl">
            Build <span className="italic">steady</span> daily habits with a layout that keeps your mornings, evenings, and focus <span className="italic text-green-500">simple.</span>
          </h2>
        </FadeUp>

        {/* habit tag pills + phone mockup */}
        <div className="mt-16 grid md:grid-cols-2 gap-6 items-center">
          <FadeUp>
            <div className="space-y-3">
              {HABIT_TAGS.map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl px-5 py-3.5 hover:border-green-200 hover:bg-green-50/40 transition-all group">
                  <span className="w-8 h-8 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">{icon}</span>
                  <span className="font-body text-stone-700 font-medium text-sm">{label}</span>
                  <Check size={14} className="ml-auto text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-body text-stone-400 text-xs">Good Morning!</p>
                  <p className="font-display text-stone-900 text-lg font-medium">Tuesday, 25 Nov</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-green-500 text-2xl font-medium">15%</p>
                  <p className="font-body text-stone-400 text-xs">Completion</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {TASKS.map(({ time, label, dur, done }) => (
                  <div key={label} className={`flex items-center gap-3 rounded-xl p-3 ${done ? 'bg-green-50 border border-green-100' : 'border border-stone-100'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500 border-green-500' : 'border-stone-200'}`}>
                      {done && <Check size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-body text-sm font-medium truncate ${done ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{label}</p>
                      <p className="font-body text-xs text-stone-400">{time} · {dur}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>

        {/* rating strip */}
        <FadeUp className="mt-8 flex items-center gap-3 font-body text-sm text-stone-500">
          <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={13} fill={i < 4 ? '#22c55e' : '#d1d5db'} color={i < 4 ? '#22c55e' : '#d1d5db'} />)}</div>
          <span>4.7 rating (based on 125 reviews)</span>
        </FadeUp>
      </section>

      {/* ── FEATURES DEEP-DIVE ── */}
      <section id="features" className="bg-white border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-24 space-y-32">

          {/* F1 — Flex Streaks */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-green-500 mb-3">XP & Levels</p>
              <h3 className="font-display text-[clamp(32px,4vw,48px)] font-medium leading-tight text-stone-900 mb-4">Flexible streak rules</h3>
              <p className="font-body text-stone-500 leading-relaxed mb-6">Traditional habit trackers are too rigid. Miss one day and your 50-day streak is gone. Taskr keeps it real.</p>
              <button onClick={onGetStarted} className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm font-body font-medium px-6 py-3 rounded-full hover:bg-green-600 transition-colors">
                Start your routine <ArrowRight size={14} />
              </button>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div className="space-y-2.5">
                {['Travel Mode Active', 'Sick Day Allowance', 'Weekend Flexibility', 'Rest Day Credit', 'Pause Streak Option'].map((tag) => (
                  <div key={tag} className="flex items-center gap-3 bg-[#faf9f7] border border-stone-200 rounded-xl px-4 py-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={11} className="text-green-600" />
                    </div>
                    <span className="font-body text-stone-700 text-sm">{tag}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* F2 — Weekly Reflection */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeUp delay={0.1} className="order-2 md:order-1">
              <div className="bg-[#faf9f7] border border-stone-200 rounded-3xl p-6">
                <p className="font-body text-xs text-stone-400 mb-5 font-medium">Your week at a glance</p>
                {[{ label: 'Workout', pct: 72 }, { label: 'Meditation', pct: 55 }, { label: 'Reading', pct: 88 }].map(({ label, pct }) => (
                  <div key={label} className="mb-4">
                    <div className="flex justify-between font-body text-sm text-stone-600 mb-1.5">
                      <span>{label}</span><span className="text-green-600 font-medium">{pct}%</span>
                    </div>
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
                    <p className="font-display text-3xl font-medium text-stone-900">12</p>
                    <p className="font-body text-xs text-stone-400 mt-1">Streaks completed</p>
                    <p className="font-body text-xs text-green-500 mt-0.5">↑ 3 improved</p>
                  </div>
                  <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
                    <p className="font-display text-3xl font-medium text-stone-900">07</p>
                    <p className="font-body text-xs text-stone-400 mt-1">Focused sessions</p>
                    <p className="font-body text-xs text-green-500 mt-0.5">4h 20m total</p>
                  </div>
                </div>
              </div>
            </FadeUp>
            <FadeUp className="order-1 md:order-2">
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-green-500 mb-3">Analytics</p>
              <h3 className="font-display text-[clamp(32px,4vw,48px)] font-medium leading-tight text-stone-900 mb-4">Weekly reflection</h3>
              <p className="font-body text-stone-500 leading-relaxed">A clear summary of your week that highlights what improved and what needs adjusting. Deep insight into your productivity patterns — know exactly when you're in the zone.</p>
            </FadeUp>
          </div>

          {/* F3 — Gentle Reminders */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-green-500 mb-3">Smart Alerts</p>
              <h3 className="font-display text-[clamp(32px,4vw,48px)] font-medium leading-tight text-stone-900 mb-4">Gentle reminders</h3>
              <p className="font-body text-stone-500 leading-relaxed mb-6">Short, calm nudges that help you stay consistent without pushing too hard. Real-time notifications for XP milestones, partner check-ins, and level-up moments.</p>
              <p className="font-body text-xs text-stone-400 italic">*Timed when you're actually able to act on them.</p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div className="space-y-3">
                {/* notification card */}
                <div className="bg-stone-900 text-white rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center gap-2 text-stone-400 text-xs font-body mb-3">
                    <Bell size={12} /><span>8:30 PM · Evening Wind-Down</span>
                  </div>
                  <p className="font-display text-lg font-medium mb-1">Take a 5-minute break</p>
                  <p className="font-body text-stone-400 text-sm mb-4">Time to stretch and refresh before your next task.</p>
                  <div className="flex gap-2">
                    <button className="bg-green-500 text-white text-xs font-body font-medium px-4 py-2 rounded-full">I'm on it</button>
                    <button className="bg-white/10 text-white text-xs font-body px-4 py-2 rounded-full">Later</button>
                  </div>
                </div>
                {[
                  { label: 'Stretch for 2 minutes', sub: 'A quick reset helps reduce stiffness.' },
                  { label: 'Review your next task', sub: 'Stay on track for the next hour.' },
                  { label: 'Drink a glass of water', sub: 'You\'re behind today\'s hydration goal.' },
                ].map(({ label, sub }) => (
                  <div key={label} className="flex items-center gap-3 bg-[#faf9f7] border border-stone-200 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                      <Bell size={13} />
                    </div>
                    <div>
                      <p className="font-body text-stone-800 text-sm font-medium">{label}</p>
                      <p className="font-body text-stone-400 text-xs">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>

        </div>
      </section>

      {/* ── USE CASES ── */}
      <section id="use-case" className="max-w-6xl mx-auto px-6 py-24">
  <FadeUp>
    <p className="font-body text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">
      Fits every lifestyle
    </p>

    <h2 className="font-display text-[clamp(36px,5vw,60px)] font-medium leading-tight tracking-tight text-stone-900 mb-10">
      Adapted for the way
      <br />
      you <span className="italic text-green-500">live and work</span>
    </h2>
  </FadeUp>

  {/* Category Buttons */}
  <div className="flex flex-wrap gap-2 mb-8">
    {USE_CASES.map((item, index) => (
      <button
        key={item.id}
        onClick={() => setActiveCase(index)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body font-medium border transition-all duration-300 ${
          activeCase === index
            ? 'bg-stone-900 text-white border-stone-900'
            : 'border-stone-200 text-stone-600 hover:border-stone-400 bg-white'
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </button>
    ))}
  </div>

  {/* Main Card */}
  <FadeUp>
    <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden">
      <div className="grid md:grid-cols-2">
        
        {/* Content */}
        <div className="p-8 md:p-12 flex flex-col justify-between">
          <div>
            <p className="font-body text-stone-400 text-sm mb-2">
              For {currentUseCase.label}
            </p>

            <p className="font-body text-stone-600 leading-relaxed">
              {currentUseCase.description}
            </p>
          </div>

          <div className="mt-8">
            <p className="font-display text-5xl font-medium text-green-500">
              {currentUseCase.stat}
            </p>

            <p className="font-body text-stone-400 text-sm mt-1">
              {currentUseCase.statLabel}
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="bg-gradient-to-br from-stone-100 to-stone-200 min-h-[260px] flex items-center justify-center overflow-hidden">
          <img
            src={currentUseCase.image}
            alt={currentUseCase.label}
            className="w-full h-[300px] object-cover object-center"
          />
        </div>
      </div>
    </div>
  </FadeUp>

  {/* Tags */}
  <div className="mt-8 flex flex-wrap gap-2">
    {[
      '#fitness enthusiasts',
      '#creatives',
      '#entrepreneurs',
      '#freelancers',
      '#new habit builders',
      '#deep-work lovers',
    ].map((tag) => (
      <span
        key={tag}
        className="font-body text-sm text-stone-400 border border-stone-200 bg-white px-4 py-1.5 rounded-full"
      >
        {tag}
      </span>
    ))}
  </div>
</section>


      {/* ── TESTIMONIALS MARQUEE ── */}
      {/* <section className="border-y border-stone-200 py-16 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-10">
          <FadeUp>
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-green-500 mb-3">Social proof</p>
            <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-medium leading-tight tracking-tight text-stone-900">
              What users are <span className="italic text-green-500">achieving</span>
            </h2>
          </FadeUp>
        </div> */}

        {/* scrolling row 1 */}
        {/* <div className="overflow-hidden">
          <motion.div
            className="flex gap-4 pb-4"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
            style={{ width: 'max-content' }}
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </motion.div>
        </div> */}

        {/* scrolling row 2 */}
        {/* <div className="overflow-hidden mt-4">
          <motion.div
            className="flex gap-4 pt-4"
            animate={{ x: ['-50%', '0%'] }}
            transition={{ duration: 70, ease: 'linear', repeat: Infinity }}
            style={{ width: 'max-content' }}
          >
            {[...TESTIMONIALS_ROW2, ...TESTIMONIALS_ROW2].map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* ── STATS ── */}
      {/* <section id="metrics" className="max-w-6xl mx-auto px-6 py-24">
        <FadeUp>
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">Real habits, real numbers</p>
          <h2 className="font-display text-[clamp(36px,5vw,60px)] font-medium leading-tight tracking-tight text-stone-900 mb-2">
            How people stay <span className="italic">consistent</span> over time
          </h2>
          <p className="font-body text-stone-400 text-lg mb-14">62,000+ check-ins logged last month</p>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ num, label }, i) => (
            <FadeUp key={label} delay={i * 0.08}>
              <div className="bg-white border border-stone-200 rounded-3xl p-6 text-center hover:border-green-200 hover:shadow-md transition-all">
                <p className="font-display text-[clamp(28px,4vw,44px)] font-medium text-stone-900 mb-2">{num}</p>
                <p className="font-body text-stone-400 text-sm">{label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section> */}

      {/* ── AI / SMART ASSIST ── */}
      <section id="ai" className="bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-green-400 mb-4">Smarter habits, less thinking</p>
              <h2 className="font-display text-[clamp(36px,5vw,60px)] font-medium leading-tight tracking-tight text-white mb-6">
                AI suggestions that <span className="italic text-green-400">adjust to your day</span>
              </h2>
              <p className="font-body text-stone-400 leading-relaxed mb-8">
                WithTaskr learns your patterns and offers small, useful suggestions that help you stay consistent without guessing what to do next.
              </p>
              <button onClick={onGetStarted} className="inline-flex items-center gap-2 border border-white/20 text-white text-sm font-body font-medium px-6 py-3 rounded-full hover:bg-white hover:text-stone-900 transition-all">
                See how suggestions work <ArrowRight size={14} />
              </button>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div className="space-y-3">
                {AI_FEATURES.map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-green-500/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                      {icon}
                    </div>
                    <div>
                      <p className="font-display text-white text-lg font-medium mb-1">{title}</p>
                      <p className="font-body text-stone-400 text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── VIDEO TESTIMONIALS STRIP ── */}
      {/* <section className="max-w-6xl mx-auto px-6 py-24">
        <FadeUp>
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-green-500 mb-3">A closer look</p>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-medium leading-tight tracking-tight text-stone-900">
              How people use <span className="italic text-green-500">WithTaskr</span> every day
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#22c55e" color="#22c55e" />)}</div>
              <span className="font-body text-stone-500 text-sm">4.5/5 (Trusted by 1,582+ users)</span>
            </div>
          </div>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Marcus Reed', role: 'Fitness Instructor', quote: 'Taskr made my mornings feel manageable again.' },
            { name: 'Aisha Khan', role: 'Digital Marketer', quote: 'The leaderboard keeps me honest. I finally stopped procrastinating.' },
            { name: 'Olivia Park', role: 'Project Manager', quote: 'First habit tracker that fits into my actually busy life.' },
            { name: 'Ryan Cooper', role: 'Software Developer', quote: 'Analytics are a game changer for understanding my own patterns.' },
          ].map(({ name, role, quote }, i) => (
            <FadeUp key={name} delay={i * 0.08}>
              <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="h-40 bg-gradient-to-br from-stone-100 to-green-50 flex items-center justify-center text-4xl">
                  {['💪', '📊', '📋', '💻'][i]}
                </div>
                <div className="p-4">
                  <p className="font-body text-stone-600 text-xs italic mb-3">"{quote}"</p>
                  <p className="font-body text-stone-900 font-semibold text-sm">{name}</p>
                  <p className="font-body text-stone-400 text-xs">{role}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section> */}

      {/* ── FAQ ── */}
      <section className="border-t border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16">
            <FadeUp>
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-green-500 mb-3">Common questions</p>
              <h2 className="font-display text-[clamp(28px,3.5vw,44px)] font-medium leading-tight tracking-tight text-stone-900 mb-6">
                Frequently asked <span className="italic">questions</span>
              </h2>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
                <p className="font-body text-stone-500 text-sm mb-3">Can't find your answer?</p>
                <button onClick={onGetStarted} className="flex items-center gap-2 bg-stone-900 text-white text-sm font-body font-medium px-5 py-2.5 rounded-full hover:bg-green-600 transition-colors">
                  Contact us <ArrowRight size={13} />
                </button>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="divide-y divide-stone-200 border-t border-stone-200">
                {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2">
              <div className="font-display text-2xl font-medium text-stone-900 mb-3">
                WithTaskr<span className="text-green-500">.</span>
              </div>
              <p className="font-body text-stone-400 text-sm leading-relaxed mb-5 max-w-xs">
                Stay on top of your habits. No spam — just simple advice for staying consistent.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="font-body text-sm border border-stone-200 rounded-full px-4 py-2.5 bg-stone-50 text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-green-400 flex-1 min-w-0"
                />
                <button onClick={onGetStarted} className="bg-stone-900 text-white text-sm font-body font-medium px-5 py-2.5 rounded-full hover:bg-green-600 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>

            {[
              { title: 'Quick links', links: [['#features', 'Features'], ['#use-case', 'Use Cases'], ['#metrics', 'Social proof'], ['#ai', 'AI Suggestions']] },
              { title: 'Pages', links: [['#', 'About'], ['#', 'Waitlist'], ['#', 'Changelog']] },
              { title: 'Support', links: [['#', 'FAQs'], ['#', 'Contact'], ['#', 'Privacy Policy'], ['#', 'Terms']] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="font-body font-semibold text-stone-900 text-sm mb-4">{title}</p>
                <ul className="space-y-2.5">
                  {links.map(([href, label]) => (
                    <li key={label}>
                      <a href={href} className="font-body text-stone-400 text-sm hover:text-stone-900 transition-colors">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 pt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="font-body text-stone-400 text-xs">© 2026 WithTaskr. All rights reserved.</p>
            <div className="flex items-center gap-3">
              {IconLinks.map(({ icon, href }, i) => (
                <a key={i} href={href} className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-400 transition-all" target="_blank" rel="noopener noreferrer">
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}