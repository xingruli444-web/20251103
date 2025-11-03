function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}

// p5.js 程式：產生 CSV 題庫、隨機抽 5 題、答題、成績與回饋、互動效果

let questionBank = [
  // 範例題庫：id, 題目, A, B, C, D, 正確選項(字母), 回饋
  {id:1, q:"太陽系中體積最大的是哪一顆行星？", A:"地球", B:"土星", C:"木星", D:"火星", ans:"C", fb:"木星是太陽系中體積和質量最大的行星。"},
  {id:2, q:"水的沸點在標準大氣壓下約為多少？", A:"50°C", B:"100°C", C:"150°C", D:"0°C", ans:"B", fb:"水在1大氣壓下約於100°C沸騰。"},
  {id:3, q:"下列哪一種動物是哺乳類？", A:"蝦", B:"青蛙", C:"鯨魚", D:"鳥", ans:"C", fb:"鯨魚是海洋中的大型哺乳類動物。"},
  {id:4, q:"光速在真空中的近似數值為：", A:"3×10^8 m/s", B:"3×10^6 m/s", C:"3×10^5 m/s", D:"3×10^4 m/s", ans:"A", fb:"光速約為3×10^8公尺每秒。"},
  {id:5, q:"中文拼音「ㄅㄆㄇㄈ」屬於哪一種文字系統的元素？", A:"注音符號", B:"漢語拼音", C:"日語假名", D:"韓文", ans:"A", fb:"ㄅㄆㄇㄈ是注音符號（ㄅㄆㄇㄈ）。"},
  {id:6, q:"植物進行光合作用時主要吸收哪兩樣原料？", A:"氧氣與水", B:"二氧化碳與水", C:"氮氣與氧氣", D:"二氧化碳與氧氣", ans:"B", fb:"光合作用需要二氧化碳和水並利用光能合成有機物。"},
  {id:7, q:"下列哪一個是質量保留定律的敘述？", A:"總能量不變", B:"反應物與生成物總質量相等", C:"速度與距離成正比", D:"溫度會影響溶解度", ans:"B", fb:"化學反應中，反應物與生成物的總質量守恆。"},
  {id:8, q:"哪一個城市是法國的首都？", A:"倫敦", B:"柏林", C:"巴黎", D:"羅馬", ans:"C", fb:"巴黎是法國的首都。"},
  {id:9, q:"二進位 1010 換算成十進位是多少？", A:"10", B:"12", C:"8", D:"6", ans:"A", fb:"1010₂ = 1*8 +0*4 +1*2 +0*1 = 10。"},
  {id:10, q:"人體血液中的紅血球主要功能是？", A:"免疫防禦", B:"運輸氧氣", C:"製造胰島素", D:"消化食物", ans:"B", fb:"紅血球含血紅素，用於運輸氧氣。"}
];

let quiz = []; // 抽出的 5 題
let current = 0;
let score = 0;
let state = "start"; // start, quiz, result
let optionButtons = [];
let infoP, exportBtn, startBtn, nextBtn, resetBtn;
let particles = [];

function setup(){
  createCanvas(windowWidth, windowHeight);
  textFont('Noto Sans TC, sans-serif');
  // DOM 元件
  infoP = createP("按「匯出題庫 CSV」可下載目前題庫文字檔；按「開始測驗」開始隨機抽題（5題）。");
  infoP.style('width','780px');
  infoP.position(10,10);
  exportBtn = createButton("匯出題庫 CSV");
  exportBtn.position(10,80);
  exportBtn.mousePressed(exportCSV);
  startBtn = createButton("開始測驗（抽 5 題）");
  startBtn.position(140,80);
  startBtn.mousePressed(startQuiz);

  nextBtn = createButton("下一題");
  nextBtn.position(260,80);
  nextBtn.hide();
  nextBtn.mousePressed(nextQuestion);

  resetBtn = createButton("重設並回到開始");
  resetBtn.position(340,80);
  resetBtn.hide();
  resetBtn.mousePressed(resetAll);

  // 使用畫布區顯示題目與互動
  textSize(20);
}

function draw(){
  background(30,35,40);
  fill(255);
  noStroke();
  textSize(28);
  textAlign(LEFT, TOP);
  if(state === "start"){
    text("歡迎！請按「開始測驗」以抽題。", 10, 120);
    drawInstructions();
  } else if(state === "quiz"){
    drawQuestion();
  } else if(state === "result"){
    drawResult();
  }

  // 更新與繪製粒子系統（互動效果）
  for(let i = particles.length-1; i>=0; i--){
    particles[i].update();
    particles[i].show();
    if(particles[i].isDead()) particles.splice(i,1);
  }
}

function drawInstructions(){
  textSize(16);
  fill(200);
  text("說明：\n- 題庫為程式內建範例，可按匯出取得 CSV 檔（可用 Excel 開啟）。\n- 開始測驗會隨機抽 5 題，作答後顯示成績與回饋，並伴隨互動動畫。", 10, 160);
}

function startQuiz(){
  // 隨機抽 5 題（不重複）
  quiz = shuffleArray(questionBank).slice(0,5);
  current = 0;
  score = 0;
  state = "quiz";
  nextBtn.show();
  resetBtn.show();
  // 建立選項按鈕
  createOptionButtons();
  spawnConfetti(20, color(255,200,0)); // 小驚喜
}

function createOptionButtons(){
  // 刪除舊按鈕
  for(let b of optionButtons) b.remove();
  optionButtons = [];
  let opts = ['A','B','C','D'];
  for(let i=0;i<4;i++){
    let b = createButton("");
    b.position(30,220 + i*50);
    b.size(560,40);
    b.style('text-align','left');
    b.style('font-size','18px');
    b.mousePressed(()=>{ selectOption(opts[i]); });
    optionButtons.push(b);
  }
  updateOptionButtons();
}

function updateOptionButtons(){
  if(state !== "quiz") return;
  let q = quiz[current];
  optionButtons[0].html("A. " + q.A);
  optionButtons[1].html("B. " + q.B);
  optionButtons[2].html("C. " + q.C);
  optionButtons[3].html("D. " + q.D);
  // 解除按鈕樣式
  for(let b of optionButtons){
    b.removeAttribute('disabled');
    b.style('background-color','#eee');
  }
}

function drawQuestion(){
  let q = quiz[current];
  fill(255);
  textSize(22);
  text("第 " + (current+1) + " / " + quiz.length + " 題", 10, 120);
  textSize(20);
  text(q.q, 10, 150, 760, 100);
}

function selectOption(letter){
  if(state !== "quiz") return;
  // 禁止重複點選
  for(let b of optionButtons) b.attribute('disabled','');
  let q = quiz[current];
  if(letter === q.ans){
    score++;
    // 正確：綠色並出現綠色粒子
    for(let b of optionButtons){
      if(b.html().startsWith(letter + ".")) b.style('background-color','#b7e4c7');
    }
    spawnConfetti(25, color(80,200,120));
  } else {
    // 錯誤：標示正確與錯誤
    for(let b of optionButtons){
      if(b.html().startsWith(letter + ".")) b.style('background-color','#f8c2c2');
      if(b.html().startsWith(q.ans + ".")) b.style('background-color','#b7e4c7');
    }
    spawnConfetti(18, color(240,120,120));
  }
  // 顯示簡短回饋
  let fbP = createP("回饋：" + q.fb);
  fbP.position(width - 200, 200);
  fbP.style('width','170px');
  fbP.style('background','#fff8');
  fbP.style('padding','6px');
  fbP.style('border-radius','4px');
  fbP.style('font-size','14px');
}

function nextQuestion(){
  current++;
  if(current >= quiz.length){
    state = "result";
    nextBtn.hide();
    // 移除選項按鈕
    for(let b of optionButtons) b.remove();
    optionButtons = [];
    // 衝擊粒子：根據分數顏色
    if(score >= 4) spawnConfetti(100, color(60,180,80));
    else if(score >= 2) spawnConfetti(60, color(200,200,80));
    else spawnConfetti(60, color(200,80,80));
  } else {
    updateOptionButtons();
  }
}

function drawResult(){
  textSize(32);
  fill(255);
  textAlign(CENTER, TOP);
  text("測驗結果", width/2, 120);
  textSize(48);
  text(score + " / " + quiz.length, width/2, 180);

  // 回饋用語
  textSize(20);
  let msg = feedbackMessage(score);
  text(msg, width/2, 260);

  // 顯示一段更詳細建議
  textSize(16);
  textAlign(LEFT);
  text("建議：\n- 若分數偏低，建議複習題庫中的相關主題並再做一次測驗。\n- 若分數很高，可嘗試增加題庫難度或新增題目。", 10, 320);
  textAlign(LEFT);
}

function feedbackMessage(s){
  let n = quiz.length;
  let rate = s / n;
  if(rate === 1) return "完美！你掌握得非常好，繼續保持。";
  if(rate >= 0.8) return "優秀，表現很好！再多練習可達更穩定。";
  if(rate >= 0.5) return "尚可，有進步空間，建議針對錯題練習。";
  return "需要加強，建議重新複習並練習基礎題目。";
}

function resetAll(){
  state = "start";
  for(let b of optionButtons) b.remove();
  optionButtons = [];
  nextBtn.hide();
  resetBtn.hide();
  // 清除可能殘留的 DOM 回饋段落
  let ps = selectAll('p');
  for(let p of ps){
    // 保留首段 infoP
    if(p.elt === infoP.elt) continue;
    if(p.html().startsWith("回饋：")) p.remove();
    // 由於其他 p 也會被列出，僅移除有可能是我們建立的多餘回饋段
  }
  particles = [];
}

// 匯出題庫為 CSV 檔
function exportCSV(){
  // CSV 欄位：id,question,A,B,C,D,answer,feedback
  let header = ["id","question","A","B","C","D","answer","feedback"];
  let rows = [header.join(",")];
  for(let item of questionBank){
    // 轉譯逗號與雙引號
    function esc(s){
      if(s === undefined || s === null) return "";
      s = String(s).replace(/"/g,'""');
      if(s.indexOf(",")!==-1 || s.indexOf("\n")!==-1) return '"' + s + '"';
      return s;
    }
    let r = [item.id, esc(item.q), esc(item.A), esc(item.B), esc(item.C), esc(item.D), item.ans, esc(item.fb)];
    rows.push(r.join(","));
  }
  let csvContent = rows.join("\n");
  // 建立下載連結
  let blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
  let url = URL.createObjectURL(blob);
  let a = createA(url, 'download');
  a.elt.download = 'question_bank.csv';
  a.elt.click();
  // 釋放資源
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 1500);
}

// 小工具：亂序陣列
function shuffleArray(arr){
  let a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    let j = Math.floor(Math.random()* (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ============== 粒子系統（互動視覺效果） ============== */
class Particle {
  constructor(x,y,clr){
    this.pos = createVector(x,y);
    this.vel = p5.Vector.random2D().mult(random(1,5));
    this.acc = createVector(0,0.05);
    this.l = random(6,14);
    this.life = 255;
    this.c = clr;
  }
  update(){
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.life -= 3;
  }
  show(){
    noStroke();
    fill(red(this.c), green(this.c), blue(this.c), this.life);
    ellipse(this.pos.x, this.pos.y, this.l);
  }
  isDead(){ return this.life <= 0; }
}

function spawnConfetti(n, clr){
  for(let i=0;i<n;i++){
    let x = random(100, width-100);
    let y = random(130, 180);
    particles.push(new Particle(x,y, clr));
  }
}

// 按鍵快捷：按 R 重設
function keyPressed(){
  if(key === 'r' || key === 'R') resetAll();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
