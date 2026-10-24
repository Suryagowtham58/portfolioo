/* =========================================================
   Surya Gowtham R. — Animated Portfolio JavaScript
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  // Mobile navigation
  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");
  menuToggle?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });
  $$(".nav-links a").forEach(a => a.addEventListener("click", () => {
    navLinks?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }));

  // Dark mode
  const themeToggle = $("#themeToggle");
  const themeIcon = $("#themeIcon");
  const savedTheme = localStorage.getItem("surya-theme");
  if (savedTheme === "dark") document.body.classList.add("dark-theme");
  function syncThemeIcon() {
    const dark = document.body.classList.contains("dark-theme");
    if (themeIcon) themeIcon.textContent = dark ? "☀" : "☾";
    themeToggle?.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }
  syncThemeIcon();
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    localStorage.setItem("surya-theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
    syncThemeIcon();
  });

  // Scroll reveal
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(el => observer.observe(el));
  } else revealItems.forEach(el => el.classList.add("visible"));

  // Stagger cards for a smoother entrance.
  $$(".skill-card, .project-card").forEach((card, i) => {
    card.style.setProperty("--delay", `${(i % 3) * 90}ms`);
  });

  // Contact form: prepare a mailto message.
  $("#contactForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#senderName")?.value.trim();
    const email = $("#senderEmail")?.value.trim();
    const message = $("#senderMessage")?.value.trim();
    if (!name || !email || !message) return;
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:25bcs058@kgcas.com?subject=${subject}&body=${body}`;
    const note = $("#formNote");
    if (note) note.textContent = "Your email app should open with the message ready to review.";
  });

  // Current year
  const year = $("#currentYear");
  if (year) year.textContent = new Date().getFullYear();

  // =========================================================
  // Fun live reactions
  // =========================================================
  const layer = $("#emojiLayer");
  const totalEl = $("#reactionTotal");
  const countsEl = $("#reactionCounts");
  const buttons = $$(".reaction-btn");
  const counts = {};
  let total = 0;
  const random = (a,b) => Math.random()*(b-a)+a;

  function floatingEmoji(emoji, x, y, opts={}) {
    if (!layer) return;
    const item=document.createElement("span");
    item.className="floating-emoji";
    item.textContent=emoji;
    item.style.setProperty("--x",`${x}px`);
    item.style.setProperty("--y",`${y}px`);
    item.style.setProperty("--size",`${opts.size||random(20,34)}px`);
    item.style.setProperty("--drift",`${opts.drift??random(-100,100)}px`);
    item.style.setProperty("--rise",`${opts.rise||random(100,230)}px`);
    item.style.setProperty("--rotate",`${opts.rotate??random(-35,35)}deg`);
    item.style.animationDuration=`${opts.duration||random(1.15,1.7)}s`;
    layer.appendChild(item);
    item.addEventListener("animationend",()=>item.remove(),{once:true});
  }
  function ripple(x,y){
    if(!layer)return;
    const r=document.createElement("span"); r.className="click-ripple";
    r.style.setProperty("--x",`${x}px`); r.style.setProperty("--y",`${y}px`);
    layer.appendChild(r); r.addEventListener("animationend",()=>r.remove(),{once:true});
  }
  function updateCounts(){
    if(totalEl) totalEl.textContent=total;
    if(countsEl) countsEl.innerHTML=Object.entries(counts).filter(([,n])=>n>0).map(([e,n])=>`<span class="reaction-count">${e} ${n}</span>`).join("");
  }
  function toast(emoji){
    $(".reaction-toast")?.remove();
    const t=document.createElement("div"); t.className="reaction-toast"; t.textContent=`${emoji} reaction sent!`;
    document.body.appendChild(t); setTimeout(()=>t.remove(),950);
  }
  function react(emoji,x=innerWidth/2,y=innerHeight-100){
    counts[emoji]=(counts[emoji]||0)+1; total++; updateCounts();
    floatingEmoji(emoji,x,y,{size:random(27,40),rise:random(130,240)});
    for(let i=0;i<4;i++) floatingEmoji(emoji,x+random(-20,20),y+random(-10,10),{size:random(14,25),drift:random(-125,125),rise:random(70,180),duration:random(1,1.5)});
    ripple(x,y); toast(emoji);
  }
  buttons.forEach(btn=>btn.addEventListener("click",e=>react(btn.dataset.reaction,e.clientX,e.clientY)));

  // Double-click/tap = heart burst.
  let lastTap=0;
  document.addEventListener("pointerup",e=>{
    const now=Date.now();
    if(now-lastTap<320 && !e.target.closest("button,a,input,textarea")) react("❤️",e.clientX,e.clientY);
    lastTap=now;
  });

  // Profile photo click = random reaction.
  $("#profilePhoto")?.addEventListener("click",e=>{
    const set=["✨","🔥","🚀","🤩","👏"];
    react(set[Math.floor(Math.random()*set.length)],e.clientX,e.clientY);
  });

  // Card hover tilt — subtle and disabled for touch/reduced motion.
  const canHover=matchMedia("(hover:hover) and (pointer:fine)").matches;
  if(canHover && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    $$(".skill-card, .project-card").forEach(card=>{
      card.addEventListener("pointermove",e=>{
        const r=card.getBoundingClientRect();
        const rx=((e.clientY-r.top)/r.height-.5)*-4;
        const ry=((e.clientX-r.left)/r.width-.5)*4;
        card.style.transform=`translateY(-4px) perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener("pointerleave",()=>card.style.transform="");
    });
  }

  // Subtle ambient sparkles.
  const ambient=["✨","⭐","💫"];
  setInterval(()=>{
    if(document.hidden)return;
    floatingEmoji(ambient[Math.floor(Math.random()*ambient.length)],random(10,innerWidth-10),innerHeight+15,{size:random(12,21),drift:random(-70,70),rise:random(45,105),duration:random(2.5,4)});
  },5500);

  // Welcome burst.
  setTimeout(()=>react("👋",Math.min(innerWidth-45,innerWidth*.82),innerHeight-120),900);
});
