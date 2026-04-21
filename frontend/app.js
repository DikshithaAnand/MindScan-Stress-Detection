/* =========================================================
MindScan app.js
FINAL PRODUCTION VERSION
Clean + Stable + Full Output Working
========================================================= */

const API = "http://localhost:8000";

let token = localStorage.getItem("ms_token") || "";
let user = JSON.parse(localStorage.getItem("ms_user") || "null");

let moodVal = 3;
let trendChart = null;
let distChart = null;
let pendingSignup = null;

/* =========================================================
HELPERS
========================================================= */

function $(id){
  return document.getElementById(id);
}

function toast(msg,type="success"){

  const wrap = $("toasts");
  if(!wrap) return;

  const el = document.createElement("div");
  el.className = "toast " + type;
  el.textContent = msg;

  wrap.appendChild(el);

  setTimeout(()=>{
    el.remove();
  },3000);
}

function updLbl(el,id){
  $(id).textContent = el.value;
}

function goHome(){
  showPage("land");
}

function scrollToHow(){
  $("how-it-works")?.scrollIntoView({
    behavior:"smooth"
  });
}

/* =========================================================
PAGE CONTROL
========================================================= */

function showPage(name){

  document.querySelectorAll(".page").forEach(p=>{
    p.classList.remove("active");
  });

  $("page-" + name)?.classList.add("active");

  if(name === "dash"){
    initDash();
  }

  window.scrollTo(0,0);
}

function showPane(name){

  document.querySelectorAll(".dash-pane").forEach(p=>{
    p.classList.remove("active");
  });

  document.querySelectorAll(".sidebar a").forEach(a=>{
    a.classList.remove("active");
  });

  $("pane-" + name)?.classList.add("active");
  $("tab-" + name)?.classList.add("active");

  clearInterval(window.behTimer);

  if(name === "overview"){
    loadDashStats();
  }

  if(name === "predict"){
    tryFillExtension();
  }

  if(name === "behavior"){
    loadBehavior();

    window.behTimer = setInterval(()=>{
      loadBehavior();
    },5000);
  }

  if(name === "history"){
    loadHistory();
  }
}

/* =========================================================
MOOD
========================================================= */

function selectMood(v){

  moodVal = v;

  document.querySelectorAll(".mood-btn").forEach(btn=>{
    btn.classList.remove("selected");

    if(Number(btn.dataset.v) === v){
      btn.classList.add("selected");
    }
  });
}

/* =========================================================
AUTH
========================================================= */

function setAuthState(ok){

  $("nav-links").style.display =
    ok ? "none" : "flex";

  $("nav-links-auth").style.display =
    ok ? "flex" : "none";

  if(ok && user){
    $("nav-username").textContent = user.name;
  }
}

async function doLogin(){

  const email = $("login-email").value.trim();
  const password = $("login-pass").value;

  try{

    const res = await fetch(`${API}/login`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({email,password})
    });

    const d = await res.json();

    if(!res.ok){
      throw new Error(d.detail || "Login failed");
    }

    token = d.access_token;

    user = {
      name:d.name,
      email:d.email
    };

    localStorage.setItem("ms_token",token);
    localStorage.setItem("ms_user",JSON.stringify(user));

    setAuthState(true);
    showPage("dash");

    toast("Login successful");

  }catch(err){

    $("login-err").textContent = err.message;
    $("login-err").classList.add("show");
  }
}

async function doSignup(){

  const name = $("signup-name").value.trim();
  const email = $("signup-email").value.trim();
  const password = $("signup-pass").value;

  if(!localStorage.getItem("ms_consent")){
    pendingSignup = {name,email,password};
    $("consent-modal").style.display = "flex";
    return;
  }

  await _doSignup(name,email,password);
}

async function _doSignup(name,email,password){

  try{

    const res = await fetch(`${API}/signup`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({name,email,password})
    });

    const d = await res.json();

    if(!res.ok){
      throw new Error(d.detail || "Signup failed");
    }

    toast("Account created");
    showPage("login");

  }catch(err){

    $("signup-err").textContent = err.message;
    $("signup-err").classList.add("show");
  }
}

function acceptConsent(){

  localStorage.setItem("ms_consent","true");
  $("consent-modal").style.display = "none";

  if(pendingSignup){
    _doSignup(
      pendingSignup.name,
      pendingSignup.email,
      pendingSignup.password
    );
  }
}

function denyConsent(){
  $("consent-modal").style.display = "none";
}

function logout(){

  token = "";
  user = null;

  localStorage.removeItem("ms_token");
  localStorage.removeItem("ms_user");

  setAuthState(false);
  showPage("land");
}

/* =========================================================
DASHBOARD
========================================================= */

function initDash(){

  if(user){

    $("dash-name").textContent =
      user.name.split(" ")[0];

    $("sidebar-name").textContent =
      user.name;

    $("sidebar-email").textContent =
      user.email;
  }

  const h = new Date().getHours();

  $("time-of-day").textContent =
    h < 12 ? "morning" :
    h < 17 ? "afternoon" :
    "evening";

  loadDashStats();
}

async function loadDashStats(){

  if(!token) return;

  try{

    const res = await fetch(`${API}/dashboard-stats`,{
      headers:{
        Authorization:"Bearer " + token
      }
    });

    const d = await res.json();

    $("focus-score").textContent =
      d.focus_score ?? 0;

    $("tabs-today").textContent =
      d.tab_switches_today ?? 0;

    $("screen-mins").textContent =
      d.active_minutes_today ?? 0;

    $("pred-count").textContent =
      d.prediction_count ?? 0;

    $("last-check-label").textContent =
      "Live stress based on behaviour signals";

    showGauge(
            d.stress_score ?? 0,
            d.live_stress ?? "Low Stress"
);

    if(d.trend){
      drawTrendChart(d.trend);
      drawDistChart(d.trend);
    }

  }catch(err){
    console.log(err);
  }
}

function showGauge(score,level){

  $("gauge-area").style.display = "flex";

  $("gauge-level").textContent = level;

  $("gauge-sub").textContent =
    `Stress score: ${Math.round(score)}/100`;

  const total = 172;
  const fill = total - ((score/100)*total);

  const el = $("gauge-fill");

  el.style.strokeDashoffset = fill;

  el.style.stroke =
    score > 66 ? "#f87171" :
    score > 33 ? "#fbbf24" :
    "#34d399";
}

/* =========================================================
CHARTS
========================================================= */

function drawTrendChart(trend){

  const ctx = $("chart-trend").getContext("2d");

  if(trendChart) trendChart.destroy();

  trendChart = new Chart(ctx,{
    type:"line",
    data:{
      labels: trend.map(x=>x.date),
      datasets:[{
        data: trend.map(x=>x.gauge),
        borderColor:"#2dd4bf",
        backgroundColor:"rgba(45,212,191,.12)",
        fill:true,
        tension:.35
      }]
    },
    options:{
      plugins:{legend:{display:false}},
      responsive:true
    }
  });
}

function drawDistChart(trend){

  let low=0,mod=0,high=0;

  trend.forEach(x=>{
    if(x.gauge <= 33) low++;
    else if(x.gauge <= 66) mod++;
    else high++;
  });

  const ctx = $("chart-dist").getContext("2d");

  if(distChart) distChart.destroy();

  distChart = new Chart(ctx,{
    type:"doughnut",
    data:{
      labels:["Low","Moderate","High"],
      datasets:[{
        data:[low,mod,high],
        backgroundColor:[
          "#34d399",
          "#fbbf24",
          "#f87171"
        ]
      }]
    },
    options:{
      responsive:true
    }
  });
}

/* =========================================================
CHECK STRESS
========================================================= */

async function doPrediction(){

  const btn = $("btn-pred");

  btn.disabled = true;
  btn.innerHTML = "Analysing...";

  try{

    const body = {
      sleep_hours:Number($("r-sleep").value),
      study_hours:Number($("r-study").value),
      social_media_hours:Number($("r-social").value),
      screen_time:Number($("r-screen").value),
      mood_level:Number(moodVal),
      tab_switches:Number($("r-tabs").value),
      active_minutes:Number($("r-mins").value)
    };

    const res = await fetch(`${API}/predict`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:"Bearer " + token
      },
      body: JSON.stringify(body)
    });

    const d = await res.json();

    if(!res.ok){
      throw new Error(d.detail || "Prediction failed");
    }

    renderResult(d);
    loadDashStats();

  }catch(err){

    toast(err.message,"error");

  }finally{

    btn.disabled = false;
    btn.innerHTML = "Analyse My Stress →";
  }
}

function renderResult(d){

  $("result-card").style.display = "block";

  const level = d.level || "Moderate Stress";
  const gauge = Number(d.gauge ?? 50);

  $("result-level").textContent = level;

  $("result-level").style.color =
    gauge > 66 ? "#f87171" :
    gauge > 33 ? "#fbbf24" :
    "#34d399";

  let probs = d.probabilities;

  if(!probs){

    probs = {low:0,moderate:0,high:0};

    if(level.toLowerCase().includes("low")) probs.low=100;
    else if(level.toLowerCase().includes("high")) probs.high=100;
    else probs.moderate=100;
  }

  $("result-conf").textContent =
    `Confidence: ${Math.max(probs.low,probs.moderate,probs.high)}%`;

  const bars = $("prob-bars");
  bars.innerHTML = "";

  [
    ["Low",probs.low,"#34d399"],
    ["Moderate",probs.moderate,"#fbbf24"],
    ["High",probs.high,"#f87171"]
  ].forEach(x=>{

    bars.innerHTML += `
      <div class="prob-bar-wrap">
        <label>${x[0]}</label>
        <div class="prob-bar-track">
          <div class="prob-bar-fill"
          style="width:${x[1]}%;background:${x[2]}"></div>
        </div>
        <div class="prob-val"
        style="color:${x[2]}">${x[1]}%</div>
      </div>
    `;
  });

  $("result-tips").innerHTML =
  (d.tips || [
    "Stay hydrated",
    "Reduce distractions",
    "Take breaks"
  ]).map(t=>`
    <div class="tip-item">
      <div class="tip-dot"></div>
      <div class="tip-text">${t}</div>
    </div>
  `).join("");
}

/* =========================================================
BEHAVIOUR
========================================================= */

async function loadBehavior(){

  if(!token) return;

  try{

    const res = await fetch(`${API}/dashboard-stats`,{
      headers:{
        Authorization:"Bearer " + token
      }
    });

    const d = await res.json();

    $("beh-tabs").textContent =
      d.tab_switches_today ?? 0;

    $("beh-mins").textContent =
      d.active_minutes_today ?? 0;

  }catch(err){

    $("beh-tabs").textContent = 0;
    $("beh-mins").textContent = 0;
  }
}

/* =========================================================
HISTORY
========================================================= */

async function loadHistory(){

  if(!token) return;

  try{

    const res = await fetch(`${API}/history`,{
      headers:{
        Authorization:"Bearer " + token
      }
    });

    const d = await res.json();

    const list = $("history-list");

    if(!d.history?.length){
      list.innerHTML = "No history found";
      return;
    }

    list.innerHTML = d.history.reverse().map(x=>`
      <div class="hist-item">
        <div>
          <div>${x.level}</div>
          <div class="hist-date">
            ${new Date(x.timestamp).toLocaleString()}
          </div>
        </div>
        <span class="hist-badge">
          ${x.gauge}/100
        </span>
      </div>
    `).join("");

  }catch(err){}
}

/* =========================================================
AUTO FILL
========================================================= */

async function tryFillExtension(){

  if(!token) return;

  try{

    const res = await fetch(`${API}/dashboard-stats`,{
      headers:{
        Authorization:"Bearer " + token
      }
    });

    const d = await res.json();

    $("r-tabs").value = d.tab_switches_today ?? 0;
    $("lbl-tabs").textContent = d.tab_switches_today ?? 0;

    $("r-mins").value = d.active_minutes_today ?? 0;
    $("lbl-mins").textContent = d.active_minutes_today ?? 0;

  }catch(err){}
}

/* =========================================================
START
========================================================= */

(function(){

  if(token && user){
    setAuthState(true);
    showPage("dash");
  }else{
    showPage("land");
  }

})();