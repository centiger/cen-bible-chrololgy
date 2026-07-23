const CEN_BIBLE20_HOME_URL = "https://centiger.github.io/CEN-Bible2.0/";

function normalizeCenBibleRef(ref){
  let cleanRef = (ref || "").toString().trim();
  if(!cleanRef) return "";

  // 장만 있는 표기는 첫 절로 보정합니다.
  // 예: "창세기 12장" → "창세기 12:1"
  cleanRef = cleanRef.replace(
    /^(.+?)\s*(\d+)장\s*$/,
    (_, book, chapter) => `${book.trim()} ${chapter}:1`
  );

  // 장 범위는 첫 장의 첫 절로 이동합니다.
  // 예: "창세기 6~9장" → "창세기 6:1"
  cleanRef = cleanRef.replace(
    /^(.+?)\s*(\d+)\s*[~～\-–—]\s*\d+장\s*$/,
    (_, book, chapter) => `${book.trim()} ${chapter}:1`
  );

  // "창세기 12"처럼 '장'이 생략된 경우도 보정합니다.
  cleanRef = cleanRef.replace(
    /^(.+?)\s+(\d+)\s*$/,
    (_, book, chapter) => `${book.trim()} ${chapter}:1`
  );

  return cleanRef;
}

function getCenBibleRefUrl(ref){
  const cleanRef = normalizeCenBibleRef(ref);
  return cleanRef
    ? `${CEN_BIBLE20_HOME_URL}?ref=${encodeURIComponent(cleanRef)}`
    : CEN_BIBLE20_HOME_URL;
}

function renderBibleRef(ref, className = ""){
  const cleanRef = normalizeCenBibleRef(ref);
  if(!cleanRef) return "";
  return `<button type="button" class="bible-ref-link ${className}" data-bible-ref="${cleanRef}">${cleanRef}</button>`;
}


let currentPage = "home";
let currentEraId = "era-origin";
let currentEventId = "creation";
let currentTab = "summary";
let viewerScale = 1;

const $ = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));

function getEventTitle(id){
  if(EVENTS[id]) return EVENTS[id].title;
  return ALL_EVENT_TITLES[id] || id;
}
function getEventSummary(id){
  if(EVENTS[id]) return EVENTS[id].summary;
  const title = getEventTitle(id);
  return EVENT_SUMMARIES[title] || `${title} 핵심사건 상세 탭카드는 인포그래픽 확보 후 추가할 수 있습니다.`;
}
function setHeader(title, sub){
  $("#headerTitle").textContent = title;
  $("#headerSub").textContent = sub || "CEN Bible 2.0 통합용 독립 PWA";
}
function go(page){
  currentPage = page;
  $$(".page").forEach(p=>p.classList.remove("active"));
  $("#" + page).classList.add("active");
  $$(".navbtn").forEach(b=>b.classList.toggle("active", b.dataset.page === page));
  if(page==="home") setHeader("주제탐험", "성경을 시간순이 아니라 주제별로 탐험합니다.");
  if(page==="eras") setHeader("성경연표", "시대 → 사건칩 → 탭카드");
  if(page==="detail") setHeader("핵심사건 상세", "탭카드와 원본 인포그래픽");
  if(page==="settings") setHeader("화면설정", "독립 PWA · 통합 대비 구조");
  window.scrollTo({top:0,behavior:"instant"});
}

function removeConfigStatusCard(){
  const cards = Array.from(document.querySelectorAll("#home > section.card"));
  const target = cards.find(card => {
    const h2 = card.querySelector("h2");
    return h2 && h2.textContent.trim() === "구성 현황";
  });
  if(target) target.remove();
}

function renderHome(){
  const home = $("#home");

  home.innerHTML = `
<section class="hub-home-section axis-section axis-bone">
      <div class="hub-home-head axis-head">
        <div class="axis-kicker">AXIS 01</div>
        <div class="hub-home-title">📜 성경의 뼈대</div>
        <div class="hub-home-desc">성경 전체를 관통하는 핵심 구조</div>
      </div>

      <div class="hub-home-grid">
        ${renderHomeHubCard("covenant")}
        ${renderHomeHubCard("kingdom")}
        ${renderHomeHubCard("newcreation")}
        ${renderHomeHubCard("holyspirit")}
        ${renderHomeHubCard("presence")}
        ${renderHomeHubCard("life")}
        ${renderHomeHubCard("nations")}
      </div>
    </section>

    <section class="hub-home-section axis-section axis-redemption">
      <div class="hub-home-head axis-head">
        <div class="axis-kicker">AXIS 02</div>
        <div class="hub-home-title">🩸 구속의 흐름</div>
        <div class="hub-home-desc">구원과 희생, 중보의 이야기</div>
      </div>

      <div class="hub-home-grid">
        ${renderHomeHubCard("lamb")}
        ${renderHomeHubCard("cross")}
        ${renderHomeHubCard("exodus")}
        ${renderHomeHubCard("priesthood")}
        ${renderHomeHubCard("blood")}
      </div>
    </section>

    <section class="hub-home-section axis-section axis-king">
      <div class="hub-home-head axis-head">
        <div class="axis-kicker">AXIS 03</div>
        <div class="hub-home-title">👑 왕과 메시야</div>
        <div class="hub-home-desc">약속된 왕과 메시아의 흐름</div>
      </div>

      <div class="hub-home-grid">
        ${renderHomeHubCard("messiah")}
        ${renderHomeHubCard("kingship")}
        ${renderHomeHubCard("zion")}
        ${renderHomeHubCard("davidic")}
      </div>
    </section>

    <section class="hub-home-section axis-section axis-presence">
      <div class="hub-home-head axis-head">
        <div class="axis-kicker">AXIS 04</div>
        <div class="hub-home-title">🏛️ 임재와 연단</div>
        <div class="hub-home-desc">하나님과 동행하며 다듬어지는 흐름</div>
      </div>

      <div class="hub-home-grid">
        ${renderHomeHubCard("temple")}
        ${renderHomeHubCard("wilderness")}
        ${renderHomeHubCard("faith")}
        ${renderHomeHubCard("church")}
        ${renderHomeHubCard("resurrection")}
        </div>
    </section>

    <section class="card chronology-entry-card">
      <div class="chronology-entry-title">⌛ 성경연표 탐색</div>
      <div class="chronology-entry-desc">
        창조부터 새예루살렘까지 시간의 흐름으로 탐험합니다.
      </div>

      <button class="cen-btn chronology-entry-btn" data-page="eras">
        시대별 연표 보기
      </button>
    </section>
  `;
}

function renderHomeHubCard(id){
  if(typeof EXPLORE_HUBS === "undefined") return "";

  const hub = EXPLORE_HUBS[id];
  if(!hub) return "";

  return `
    <button class="hub-home-card" data-bottom-hub="${id}">
      <div class="hub-home-icon">${hub.icon || "🧭"}</div>
      <div class="hub-home-card-title">${hub.title}</div>
      <div class="hub-home-card-desc">
        ${hub.subtitle || ""}
      </div>
    </button>
  `;
}
function renderEras(){
  const box = $("#timeline");
  box.innerHTML = ERAS.map(era=>`
    <article class="era-card" id="${era.id}">
      <div class="era-head">
        <div class="era-title">${era.title}</div>
        <div class="era-year">${era.year}</div>
        <div class="era-scripture">${renderBibleRef(era.scripture, "era-scripture-link")}</div>
      </div>
      <div class="era-summary">${era.summary}</div>
      <div class="event-chip-wrap">
        ${era.eventIds.map(id=>`<button class="event-chip" data-event="${id}">${getEventTitle(id)}</button>`).join("")}
      </div>
      <div class="preview" id="preview-${era.id}">
        <div class="preview-title">핵심사건</div>
        <div class="preview-text small">사건칩을 눌러 요약을 확인하세요.</div>
      </div>
    </article>
  `).join("");
}
function scrollToEra(id){
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
}

function scrollToPreviewBox(eraId){
  const box = document.getElementById("preview-" + eraId);
  if(!box) return;
  setTimeout(()=>{
    const fixedOffset = 96;
    const y = box.getBoundingClientRect().top + window.pageYOffset - fixedOffset;
    window.scrollTo({top: Math.max(0, y), behavior:"smooth"});
  }, 80);
}

function getValidHubIds(eventId){
  if(typeof EVENT_HUB_LINKS === "undefined" || typeof EXPLORE_HUBS === "undefined") return [];
  return (EVENT_HUB_LINKS[eventId] || []).filter(id => EXPLORE_HUBS[id]);
}

function openHubSelector(eventId){
  const hubIds = getValidHubIds(eventId);
  if(!hubIds.length) return;

  if(hubIds.length === 1){
    renderHubOverlay(hubIds[0]);
    return;
  }

  const modal = document.createElement("div");
  modal.className = "hub-selector-overlay";

  modal.innerHTML = `
    <div class="hub-selector-modal">
      <div class="hub-selector-title">주제탐험 선택</div>
      <div class="hub-selector-sub">이 사건에는 ${hubIds.length}개의 흐름이 연결되어 있습니다.</div>

      <div class="hub-selector-list">
        ${hubIds.map(id=>{
          const hub = EXPLORE_HUBS[id];
          return `
            <button class="hub-selector-item" data-hub-select="${id}">
              <span class="hub-selector-icon">${hub.icon || "🧭"}</span>
              <span class="hub-selector-text">${hub.title}</span>
            </button>
          `;
        }).join("")}
      </div>

      <button class="hub-selector-close">닫기</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", e=>{
    const item = e.target.closest("[data-hub-select]");
    if(item){
      const hubId = item.dataset.hubSelect;
      modal.remove();
      renderHubOverlay(hubId);
      return;
    }

    if(
      e.target.classList.contains("hub-selector-overlay") ||
      e.target.classList.contains("hub-selector-close") ||
      e.target.classList.contains("hub-selector-x")
    ){
      modal.remove();
    }
  });
}

function selectEvent(eventId){
  currentEventId = eventId;
  const era = ERAS.find(e=>e.eventIds.includes(eventId));
  $$(".event-chip").forEach(c=>c.classList.toggle("active", c.dataset.event === eventId));
  if(era){
    const box = $("#preview-" + era.id);
    box.classList.add("show");
    const title = getEventTitle(eventId);
    const summary = getEventSummary(eventId);
    const ready = EVENTS[eventId] ? "상세보기" : "상세 준비중";
    box.innerHTML = `
      <div class="preview-title">${title}</div>
      <div class="preview-text">${summary}</div>
      <div class="small" style="margin-top:6px">시대: ${era.title} · ${era.year}</div>
      <div class="btn-row">
        <button class="cen-btn green" data-detail="${eventId}">${ready}</button>
        ${(()=>{
          const validHubIds = getValidHubIds(eventId);
          if(!validHubIds.length) return ``;

          const label = validHubIds.length === 1
            ? `주제탐험`
            : `주제탐험 ${validHubIds.length}개`;

          return `<button class="cen-btn secondary" data-hub-selector="${eventId}">${label}</button>`;
        })()}
      </div>
    `;
    scrollToPreviewBox(era.id);
  }
}


function renderDetail(eventId){
  const data = EVENTS[eventId];
  if(!data){
    const title = getEventTitle(eventId);
    $("#detailRoot").innerHTML = `
      <section class="detail-hero">
        <h2>${title}</h2>
        <div class="detail-meta"><span class="pill light">상세 준비중</span></div>
      </section>
      <section class="scroll-section">
        <div class="section-title">사건 요약</div>
        <div class="section-card">${getEventSummary(eventId)}</div>
      </section>
    
    <section class="scroll-section">
      <div class="section-title">원본 인포그래픽</div>
</section>
  `;
  go("detail");
    return;
  }

  const enrich = EVENT_ENRICH[eventId] || {};
  let flow = enrich.flow || data.core.map((x,i)=>[String(i+1), x, ""]);
  if(eventId === "seven-seals"){
    flow = [
    ["첫째 인: 흰 말", "정복하는 자가 나아가 활과 면류관을 받음", "계 6:1-2"],
    ["둘째 인: 붉은 말", "큰 전쟁이 일어나 평화가 사라짐", "계 6:3-4"],
    ["셋째 인: 검은 말", "기근이 있어 한 데나리온에 보리 한 되나 밀 한 되가 됨", "계 6:5-6"],
    ["넷째 인: 청황색 말", "사망과 음부가 권세를 받음", "계 6:7-8"],
    ["다섯째 인: 순교자의 호소", "제단 아래 순교한 영혼들이 하나님의 공의로운 심판을 부르짖고 흰 옷을 받음", "계 6:9-11"],
    ["여섯째 인: 우주적 재앙", "해가 검어지고 달이 피같이 되며 별들이 떨어지고 땅과 하늘이 크게 흔들림", "계 6:12-17"],
    ["일곱째 인: 하늘의 침묵", "일곱째 인이 열리자 하늘에 약 반 시간 동안 침묵이 있고 일곱 나팔 심판으로 이어짐", "계 8:1"]
  ];
  }
  const scriptureRefs = enrich.scriptureRefs || [[data.scripture, data.summary]];
  const visualItems = enrich.visualItems || [data.visual];

  $("#detailRoot").innerHTML = `
    <section class="detail-hero detail-scroll-hero">
      <div class="hero-mini">${data.era}</div>
      <h2>${data.title}</h2>
      <div class="detail-meta">
        <span class="pill">${data.year}</span>
        <span class="pill light scripture-pill">${renderBibleRef(data.scripture, "pill-bible-ref")}</span>
      </div>
    </section>

    <section class="scroll-section">
      <div class="section-title">1. 사건 요약</div>
      <div class="section-card">
        ${data.summary}
      </div>
    </section>

    <section class="scroll-section">
      <div class="section-title">2. 핵심 의미</div>
      <div class="section-card">
        <ul class="info-list">
          ${data.meaning.map(x=>`<li>${x}</li>`).join("")}
        </ul>
      </div>
    </section>

    <section class="scroll-section">
      <div class="section-title">3. 시대 / 연대</div>
      <div class="section-card">
        <div class="timeline-year">${data.year}</div>
        <div class="timeline-era">${data.era}</div>
        <div class="timeline-scripture">${renderBibleRef(data.scripture, "timeline-scripture-link")}</div>
      </div>
    </section>

    <section class="scroll-section">
      <div class="section-title">4. 장소</div>
      <div class="section-card">
        <div class="map-title">${data.place}</div>
        <div class="map-note">${data.visual}</div>
      </div>
    </section>

    <section class="scroll-section">
      <div class="section-title">5. 핵심 인물</div>
      <div class="keyword-grid">
        ${data.people.map(x=>`<div class="keyword">${x}</div>`).join("")}
      </div>
    </section>

    <section class="scroll-section">
      <div class="section-title">6. 핵심사건</div>
      <div class="flow-list">
        ${flow.map((x,i)=>{
          const item = normalizeFlowItem(x, i);
          return `
          <div class="flow-item core-flow-row">
            <div class="flow-badge flow-badge-text core-flow-title">${item.title}</div>
            <div class="flow-body core-flow-body">
              <div class="flow-text core-flow-desc">${item.desc}</div>
              ${item.ref ? `<div class="flow-ref core-flow-ref">${renderBibleRef(item.ref, "flow-bible-ref")}</div>` : ``}
            </div>
          </div>
        `;
        }).join("")}
      </div>
    </section>

    <section class="scroll-section">
      <div class="section-title">7. 관련성경</div>
      <div class="scripture-list">
        ${scriptureRefs.map(x=>`
          <div class="scripture-card">
            <div class="scripture-ref">${renderBibleRef(x[0], "related-bible-ref")}</div>
            <div class="scripture-text">${x[1]}</div>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="scroll-section">
      <div class="section-title">8. 주제탐험</div>
      ${renderExploreRows(eventId)}
    </section>

    <section class="scroll-section">
      <div class="section-title">9. 지도 / 시각자료</div>
      ${getMapImageSrc(eventId) ? `
        <div class="crop-map-card clean-map-only">
          <img class="crop-map-img" src="${getMapImageSrc(eventId)}" alt="${data.title} 지도/시각자료" onerror="this.closest('.crop-map-card').innerHTML='<div class=\'section-card\'>지도/시각자료 이미지 경로를 확인해 주세요.</div>'">
          <div class="btn-row">
            <button class="cen-btn secondary" data-open-crop="${eventId}">지도 크게 보기</button>
          </div>
        </div>
      ` : `
        <div class="section-card">지도 이미지 준비중</div>
      `}
    </section>

    

    <section class="scroll-section">
      <div class="section-title">원본 인포그래픽</div>
      <div class="original-infographic-wrap">
        <button class="original-infographic-btn" data-open-original="${eventId}">
          원본 인포그래픽 보기
        </button>
      </div>
    </section>

  `;
  go("detail");
}

function chunkExploreItems(items){
  if(!items || !items.length) return [];
  if(items.length <= 4) return [items];
  if(items.length === 5) return [items.slice(0,3), items.slice(3)];
  if(items.length === 6) return [items.slice(0,3), items.slice(3)];
  const rows = [];
  for(let i=0; i<items.length; i+=3) rows.push(items.slice(i,i+3));
  return rows;
}

function renderExploreRows(eventId){
  const legacy = EVENT_EXPLORE[eventId];
  const hubHtml = renderHubEntryRows(eventId);

  const legacyHtml = legacy ? (() => {
    const rows = chunkExploreItems(legacy.items || []);
    return `
      <div class="two-row-explore-box">
        ${rows.map(row=>`
          <div class="metro-row row-${row.length}">
            ${row.map(x=>`
              <div class="metro-station">
                <button class="compact-pill metro-pill" data-explore="${x.title}">
                  ${x.title}
                </button>
                ${x.desc ? `<div class="outside-pill-desc metro-desc">(${x.desc})</div>` : ``}
              </div>
            `).join("")}
          </div>
        `).join("")}
      </div>
    `;
  })() : "";

  if(hubHtml || legacyHtml){
    return `
      ${hubHtml}
      ${legacyHtml}
    `;
  }

  return `<div class="section-card">주제탐험 데이터 준비중</div>`;
}






function isStepLabelOnly(v){
  const s = (v || "").toString().trim();
  return /^(\d+|\d+\s*일째|\d+\.\s*|[①②③④⑤⑥⑦⑧⑨⑩])$/.test(s);
}
function isBibleRefText(s){
  const text = (s || "").toString().trim();
  if(!text) return false;
  return /^(창|출|레|민|신|수|삿|룻|삼상|삼하|왕상|왕하|대상|대하|스|느|에|욥|시|잠|전|아|사|렘|애|겔|단|호|욜|암|옵|욘|미|나|합|습|학|슥|말|마|막|눅|요|행|롬|고전|고후|갈|엡|빌|골|살전|살후|딤전|딤후|딛|몬|히|약|벧전|벧후|요일|요이|요삼|유|계|창세기|출애굽기|레위기|민수기|신명기|여호수아|사사기|룻기|사무엘상|사무엘하|열왕기상|열왕기하|역대상|역대하|에스라|느헤미야|에스더|욥기|시편|잠언|전도서|아가|이사야|예레미야|예레미야애가|에스겔|다니엘|호세아|요엘|아모스|오바댜|요나|미가|나훔|하박국|스바냐|학개|스가랴|말라기|마태복음|마가복음|누가복음|요한복음|사도행전|로마서|고린도전서|고린도후서|갈라디아서|에베소서|빌립보서|골로새서|데살로니가전서|데살로니가후서|디모데전서|디모데후서|디도서|빌레몬서|히브리서|야고보서|베드로전서|베드로후서|요한일서|요한이서|요한삼서|유다서|요한계시록)\s*\d+[:장]\s*\d*/.test(text);
}

function splitBibleRefFromText(text){
  const source = (text || "").toString().trim();
  if(!source) return {text:"", ref:""};

  // 괄호 끝에 붙은 성경구절: "... 하심 (창 3:15)" 또는 "... (요한복음 3:16)"
  const paren = source.match(/^(.*?)[\s　]*[\\(（]((?:창|출|레|민|신|수|삿|룻|삼상|삼하|왕상|왕하|대상|대하|스|느|에|욥|시|잠|전|아|사|렘|애|겔|단|호|욜|암|옵|욘|미|나|합|습|학|슥|말|마|막|눅|요|행|롬|고전|고후|갈|엡|빌|골|살전|살후|딤전|딤후|딛|몬|히|약|벧전|벧후|요일|요이|요삼|유|계|창세기|출애굽기|레위기|민수기|신명기|여호수아|사사기|룻기|사무엘상|사무엘하|열왕기상|열왕기하|역대상|역대하|에스라|느헤미야|에스더|욥기|시편|잠언|전도서|아가|이사야|예레미야|예레미야애가|에스겔|다니엘|호세아|요엘|아모스|오바댜|요나|미가|나훔|하박국|스바냐|학개|스가랴|말라기|마태복음|마가복음|누가복음|요한복음|사도행전|로마서|고린도전서|고린도후서|갈라디아서|에베소서|빌립보서|골로새서|데살로니가전서|데살로니가후서|디모데전서|디모데후서|디도서|빌레몬서|히브리서|야고보서|베드로전서|베드로후서|요한일서|요한이서|요한삼서|유다서|요한계시록)\s*\d+[:장][^)）]*)[\\)）]\s*$/);
  if(paren) return {text:paren[1].trim(), ref:paren[2].trim()};

  // 문장 끝에 바로 붙은 짧은 장절: "... 하심 창 3:15"
  const tail = source.match(/^(.*?)[\s　]+((?:창|출|레|민|신|수|삿|룻|삼상|삼하|왕상|왕하|대상|대하|스|느|에|욥|시|잠|전|아|사|렘|애|겔|단|호|욜|암|옵|욘|미|나|합|습|학|슥|말|마|막|눅|요|행|롬|고전|고후|갈|엡|빌|골|살전|살후|딤전|딤후|딛|몬|히|약|벧전|벧후|요일|요이|요삼|유|계)\s*\d+[:장][\d\s:,\-~절]*)$/);
  if(tail && tail[1].trim().length > 0) return {text:tail[1].trim(), ref:tail[2].trim()};

  return {text:source, ref:""};
}

function normalizeFlowItem(x, i){
  if(Array.isArray(x)){
    const a = (x[0] || "").toString().trim();
    const b = (x[1] || "").toString().trim();
    const c = (x[2] || "").toString().trim();

    let title = "";
    let desc = "";
    let ref = "";

    if(a && b && c){
      title = a;
      desc = b;
      ref = c;
    } else if(isStepLabelOnly(a) && b){
      const splitB = splitBibleRefFromText(b);
      title = splitB.text || b;
      desc = splitB.text || b;
      ref = c || splitB.ref;
    } else if(a && b){
      title = a;
      desc = b;
    } else {
      title = a || b || c || `핵심 ${i+1}`;
      desc = b || a || c || `핵심 ${i+1}`;
    }

    const splitDesc = splitBibleRefFromText(desc);
    desc = splitDesc.text || desc;
    ref = ref || splitDesc.ref;

    // 제목 자체가 장절이면 제목 대신 설명을 제목으로 올리고, 장절은 참조로 내린다.
    if(isBibleRefText(title) && desc && !isBibleRefText(desc)){
      ref = ref || title;
      title = desc;
    }

    return {title, desc, ref};
  }

  if(x && typeof x === "object"){
    let title = (x.title || x.label || x.step || x.text || `핵심 ${i+1}`).toString().trim();
    let desc = (x.desc || x.summary || x.text || title).toString().trim();
    let ref = (x.ref || x.scripture || "").toString().trim();

    const splitDesc = splitBibleRefFromText(desc);
    desc = splitDesc.text || desc;
    ref = ref || splitDesc.ref;

    if(isBibleRefText(title) && desc && !isBibleRefText(desc)){
      ref = ref || title;
      title = desc;
    }

    return {title, desc, ref};
  }

  const split = splitBibleRefFromText((x || `핵심 ${i+1}`).toString());
  const s = split.text || (x || `핵심 ${i+1}`).toString();
  return {title:s, desc:s, ref:split.ref || ""};
}


function getOriginalImageSrc(eventId){
  const data = EVENTS[eventId] || {};
  return (
    (typeof ORIGINAL_INFOGRAPHICS !== "undefined" && ORIGINAL_INFOGRAPHICS[eventId]) ||
    data.image ||
    data.originalImage ||
    ""
  );
}
function getMapImageSrc(eventId){
  const original = getOriginalImageSrc(eventId);
  return (
    (typeof EVENT_MAP_CROPS !== "undefined" && EVENT_MAP_CROPS[eventId]) ||
    original ||
    ""
  );
}


function getHubCardsForEvent(eventId){
  if(typeof EXPLORE_HUBS === "undefined") return [];
  let ids = [];
  if(typeof EVENT_HUB_LINKS !== "undefined") ids = EVENT_HUB_LINKS[eventId] || [];

  // v77: 노아의 방주 언약 허브 표시 안전장치
  if(eventId === "noah-ark" && EXPLORE_HUBS["covenant"] && !ids.includes("covenant")){
    ids = [...ids, "covenant"];
  }

  return ids.map(id=>EXPLORE_HUBS[id]).filter(Boolean);
}

function renderHubEntryRows(eventId){
  const hubs = getHubCardsForEvent(eventId);
  if(!hubs.length) return "";
  return `
    <div class="hub-entry-list">
      ${hubs.map(hub=>`
        <button class="hub-entry-card" data-hub="${hub.id}">
          <div class="hub-entry-icon">${hub.icon || "🔎"}</div>
          <div class="hub-entry-body">
            <div class="hub-entry-title">${hub.title}</div>
            <div class="hub-entry-desc">${hub.subtitle || hub.description || ""}</div>
          </div>
          <div class="hub-entry-arrow">›</div>
        </button>
      `).join("")}
    </div>
    <div class="explore-sub-divider">기존 연결 키워드</div>
  `;
}

function renderHubOverlay(hubId){
  const hub = (typeof EXPLORE_HUBS !== "undefined") ? EXPLORE_HUBS[hubId] : null;
  if(!hub) return;

  // 주제 흐름의 모든 단계를 표시합니다.
  // 연표 사건과 연결되지 않은 개념·예언 단계도 숨기지 않습니다.
  const linkedSteps = (hub.steps || []);

  let overlay = document.getElementById("hubOverlay");
  if(!overlay){
    overlay = document.createElement("div");
    overlay.id = "hubOverlay";
    overlay.className = "hub-overlay";
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="hub-panel">
      <div class="hub-panel-head">
        <div>
          <div class="hub-kicker">주제탐험 허브</div>
          <h2>${hub.icon || "🔎"} ${hub.title}</h2>
          <p>${hub.description || ""}</p>
        </div>
        <button class="hub-close" data-hub-close>×</button>
      </div>
      <div class="hub-flow">
        ${linkedSteps.map((step, idx)=>`
          <div class="hub-step ${step.type || "event"}">
            <div class="hub-step-marker">${step.label || idx+1}</div>
            <div class="hub-step-card">
              <div class="hub-step-top">
                <div class="hub-step-title">${step.title}</div>
                ${step.ref ? `<div class="hub-step-ref">${renderBibleRef(step.ref, "hub-bible-ref")}</div>` : ``}
              </div>
              <div class="hub-step-desc">${step.desc || ""}</div>
              ${step.eventId && EVENTS[step.eventId]
                ? `<button class="hub-event-btn" data-hub-event="${step.eventId}">해당 사건 상세보기</button>`
                : ``}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  overlay.classList.add("show");
}

function closeHubOverlay(){
  const overlay = document.getElementById("hubOverlay");
  if(overlay) overlay.classList.remove("show");
}

function openViewer(eventId){
  const data = EVENTS[eventId];
  if(!data){
    alert("사건 데이터를 찾을 수 없습니다.");
    return;
  }
  const src = getOriginalImageSrc(eventId);
  if(!src){
    alert("원본 인포그래픽 연결 경로가 없습니다.");
    return;
  }
  openImageViewer(data.title + " 원본 인포그래픽", src);
}

function openImageViewer(title, src){
  if(!src) return;
  viewerScale = 1;
  const viewerTitle = $("#viewerTitle");
  if(viewerTitle) viewerTitle.textContent = title || "원본 인포그래픽";
  const img = $("#viewerImg");
  if(!img) return;
  img.removeAttribute("src");
  img.alt = title || "원본 인포그래픽";
  img.style.width = "100%";
  img.style.transform = "scale(1)";
  const version = (typeof CHRONOLOGY_VERSION !== "undefined" ? CHRONOLOGY_VERSION : "v64");
  const finalSrc = src.includes("?") ? src : `${src}?v=${encodeURIComponent(version)}`;
  img.onerror = () => {
    img.onerror = null;
    alert("원본 인포그래픽 파일을 찾지 못했습니다. GitHub에 해당 이미지 파일이 업로드되어 있는지 확인해 주세요: " + src);
  };
  img.src = finalSrc;
  $("#viewer").classList.add("show");
}

function openCropViewer(eventId){
  const data = EVENTS[eventId];
  const crop = getMapImageSrc(eventId);
  if(!data || !crop) return;
  openImageViewer(data.title + " 지도/시각자료", crop);
}

function closeViewer(){
  $("#viewer").classList.remove("show");
}
function zoom(delta){
  viewerScale = Math.min(3.2, Math.max(.7, viewerScale + delta));
  $("#viewerImg").style.width = (viewerScale * 100) + "%";
}
function searchEvents(q){
  q = q.trim();
  if(!q){
    renderEras();
    return;
  }
  const matchedEraIds = new Set();
  ERAS.forEach(era=>{
    const text = [era.title, era.year, era.scripture, era.summary, era.people, ...era.eventIds.map(getEventTitle)].join(" ");
    if(text.includes(q)) matchedEraIds.add(era.id);
  });
  const box = $("#timeline");
  box.innerHTML = ERAS.filter(e=>matchedEraIds.has(e.id)).map(era=>`
    <article class="era-card" id="${era.id}">
      <div class="era-head">
        <div class="era-title">${era.title}</div>
        <div class="era-year">${era.year}</div>
        <div class="era-scripture">${renderBibleRef(era.scripture, "era-scripture-link")}</div>
      </div>
      <div class="era-summary">${era.summary}</div>
      <div class="event-chip-wrap">
        ${era.eventIds.map(id=>`<button class="event-chip" data-event="${id}">${getEventTitle(id)}</button>`).join("")}
      </div>
      <div class="preview" id="preview-${era.id}">
        <div class="preview-title">핵심사건</div>
        <div class="preview-text small">사건칩을 눌러 요약을 확인하세요.</div>
      </div>
    </article>
  `).join("") || `<div class="empty">검색 결과가 없습니다.</div>`;
}

function openHubMenu(){
  if(typeof EXPLORE_HUBS === "undefined") return;

  const hubGroups = [
    {
      title: "AXIS 01 · 성경의 뼈대",
      desc: "성경 전체를 관통하는 큰 구조",
      ids: ["covenant", "kingdom", "newcreation"]
    },
    {
      title: "AXIS 02 · 구속의 흐름",
      desc: "구원, 대속, 중보의 핵심 흐름",
      ids: ["lamb", "cross", "exodus", "priesthood", "blood"]
    },
    {
      title: "AXIS 03 · 왕과 메시야",
      desc: "약속된 왕과 메시아의 성취",
      ids: ["messiah", "kingship", "zion", "davidic"]
    },
    {
      title: "AXIS 04 · 임재와 연단",
      desc: "하나님과 동행하며 다듬어지는 흐름",
      ids: ["temple", "wilderness", "faith", "church", "resurrection"]
    }
  ];

  const renderHubButton = (id) => {
    const hub = EXPLORE_HUBS[id];
    if(!hub) return "";
    return `
      <button class="hub-selector-item hub-group-item" data-bottom-hub="${id}">
        <span class="hub-selector-icon">${hub.icon || "🧭"}</span>
        <span class="hub-selector-body">
          <span class="hub-selector-text">${hub.title}</span>
          <span class="hub-selector-desc">${hub.subtitle || hub.description || ""}</span>
        </span>
      </button>
    `;
  };

  const renderedKnown = new Set(hubGroups.flatMap(g=>g.ids));
  const extraIds = Object.keys(EXPLORE_HUBS).filter(id => !renderedKnown.has(id));

  const modal = document.createElement("div");
  modal.className = "hub-selector-overlay";

  modal.innerHTML = `
    <div class="hub-selector-modal hub-menu-modal">
      <button class="hub-selector-x" type="button" aria-label="닫기">×</button>
      <div class="hub-selector-title">주제탐험</div>
      <div class="hub-selector-sub">성경을 관통하는 흐름을 구조별로 탐험합니다.</div>

      <div class="hub-group-list">
        ${hubGroups.map(group=>`
          <section class="hub-group-section">
            <div class="hub-group-head">
              <div class="hub-group-title">${group.title}</div>
              <div class="hub-group-desc">${group.desc}</div>
            </div>
            <div class="hub-selector-list">
              ${group.ids.map(renderHubButton).join("")}
            </div>
          </section>
        `).join("")}

        ${extraIds.length ? `
          <section class="hub-group-section">
            <div class="hub-group-head">
              <div class="hub-group-title">기타 흐름</div>
              <div class="hub-group-desc">추가 탐험 허브</div>
            </div>
            <div class="hub-selector-list">
              ${extraIds.map(renderHubButton).join("")}
            </div>
          </section>
        ` : ``}
      </div>

      <button class="hub-selector-close">닫기</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", e=>{
    const item = e.target.closest("[data-bottom-hub]");
    if(item){
      const hubId = item.dataset.bottomHub;
      modal.remove();
      renderHubOverlay(hubId);
      return;
    }

    if(
      e.target.classList.contains("hub-selector-overlay") ||
      e.target.classList.contains("hub-selector-close") ||
      e.target.classList.contains("hub-selector-x")
    ){
      modal.remove();
    }
  });
}
function installBibleRefStyles(){
  if(document.getElementById("bibleRefLinkStyles")) return;

  const style = document.createElement("style");
  style.id = "bibleRefLinkStyles";
  style.textContent = `
    .bible-ref-link{
      appearance:none;
      border:0;
      background:transparent;
      color:inherit;
      font:inherit;
      font-weight:inherit;
      line-height:inherit;
      padding:0;
      margin:0;
      cursor:pointer;
      text-decoration:underline;
      text-decoration-thickness:1.5px;
      text-underline-offset:3px;
    }
    .bible-ref-link:active{opacity:.65}
    .scripture-pill{display:inline-flex;align-items:center}
    .scripture-pill .bible-ref-link{text-decoration:none}
    .era-scripture .bible-ref-link,
    .timeline-scripture .bible-ref-link,
    .scripture-ref .bible-ref-link,
    .flow-ref .bible-ref-link,
    .hub-step-ref .bible-ref-link{
      width:auto;
      max-width:100%;
      text-align:left;
    }
  `;
  document.head.appendChild(style);
}

function init(){
  installBibleRefStyles();
  renderHome();
  renderEras();

  const bottomHubBtn = document.getElementById("bottomHubBtn");
  if(bottomHubBtn){
    bottomHubBtn.addEventListener("click", ()=>{
      openHubMenu();
    });
  }

  document.addEventListener("click", e=>{
    if(e.target.closest("#cenBibleHomeBtn")){
      window.location.href = CEN_BIBLE20_HOME_URL;
      return;
    }
    const bibleRef = e.target.closest("[data-bible-ref]");
    if(bibleRef){
      window.location.href = getCenBibleRefUrl(bibleRef.dataset.bibleRef);
      return;
    }

    const hubSelector = e.target.closest("[data-hub-selector]");
    if(hubSelector){
      openHubSelector(hubSelector.dataset.hubSelector);
      return;
    }

    const nav = e.target.closest("[data-page]");
    if(nav) go(nav.dataset.page);

    const era = e.target.closest("[data-era]");
    if(era){
      currentEraId = era.dataset.era;
      go("eras");
      setTimeout(()=>scrollToEra(currentEraId),30);
    }

    const chip = e.target.closest("[data-event]");
    if(chip) selectEvent(chip.dataset.event);

    const detail = e.target.closest("[data-detail]");
    if(detail) renderDetail(detail.dataset.detail);

    const homeHub = e.target.closest(".hub-home-card[data-bottom-hub]");
    if(homeHub){
      renderHubOverlay(homeHub.dataset.bottomHub);
    }

    const tab = e.target.closest("[data-tab]");
    if(tab){
      $$(".tabbtn").forEach(b=>b.classList.remove("active"));
      tab.classList.add("active");
      $$(".panel").forEach(p=>p.classList.remove("active"));
      $("#panel-" + tab.dataset.tab).classList.add("active");
    }

    const original = e.target.closest("[data-open-original]");
    if(original){
      openViewer(original.dataset.openOriginal);
      return;
    }

    const originalSrc = e.target.closest("[data-open-original-src]");
    if(originalSrc){
      openImageViewer((originalSrc.dataset.openOriginalTitle || "") + " 원본 인포그래픽", originalSrc.dataset.openOriginalSrc);
      return;
    }

    const crop = e.target.closest("[data-open-crop]");
    if(crop) openCropViewer(crop.dataset.openCrop);

    const hub = e.target.closest("[data-hub]");
    if(hub){
      renderHubOverlay(hub.dataset.hub);
      return;
    }

    const hubClose = e.target.closest("[data-hub-close]");
    if(hubClose){
      closeHubOverlay();
      return;
    }

    const hubEvent = e.target.closest("[data-hub-event]");
    if(hubEvent){
      closeHubOverlay();
      renderDetail(hubEvent.dataset.hubEvent);
      return;
    }

    if(e.target.id === "hubOverlay"){
      closeHubOverlay();
      return;
    }

    const explore = e.target.closest("[data-explore]");
    if(explore) alert(`'${explore.dataset.explore}' 주제탐험은 이후 허브형 흐름으로 단계적으로 전환됩니다.`);

    const toast = e.target.closest("[data-toast]");
    if(toast) alert("이 기능은 다음 단계에서 CEN Bible 본문·지도·성막 메뉴와 연결됩니다.");

    if(e.target.id === "viewerClose") closeViewer();
    if(e.target.id === "zoomIn") zoom(.25);
    if(e.target.id === "zoomOut") zoom(-.25);
    if(e.target.id === "viewer") closeViewer();
    if(e.target.id === "backBtn"){
      if(currentPage === "detail") go("eras");
      else if(currentPage === "eras" || currentPage === "settings") go("home");
      else alert("주제탐험를 종료하려면 브라우저 뒤로가기를 한 번 더 누르세요.");
    }
  });

  $("#searchInput").addEventListener("input", e=>searchEvents(e.target.value));
  function getCurrentFontSize(){
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--font").trim();
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 16;
  }

  function applyFontSize(v){
    const size = Math.max(13, Math.min(22, v));
    document.documentElement.style.setProperty("--font", size + "px");
    document.documentElement.style.setProperty("--font-sm", Math.max(11, size - 2) + "px");
    document.documentElement.style.setProperty("--font-lg", Math.min(28, size + 4) + "px");
    localStorage.setItem("chronologyFont", size);
    const notice = document.querySelector("#fontSizeNotice");
    if(notice) notice.textContent = "현재 글자 크기: " + size + "px";
  }

  $("#fontUp").addEventListener("click", ()=>{
    applyFontSize(getCurrentFontSize() + 1);
  });
  $("#fontDown").addEventListener("click", ()=>{
    applyFontSize(getCurrentFontSize() - 1);
  });
  $("#cacheReset").addEventListener("click", async ()=>{
    if("caches" in window){
      const keys = await caches.keys();
      await Promise.all(keys.map(k=>caches.delete(k)));
    }
    alert("캐시를 정리했습니다. 새로고침하세요.");
  });

  const savedFont = localStorage.getItem("chronologyFont");
  applyFontSize(savedFont ? parseInt(savedFont, 10) : getCurrentFontSize());

  if("serviceWorker" in navigator){
    window.addEventListener("load", ()=>navigator.serviceWorker.register("./sw.js"));
  }
}
init();

// 성경연표 직접 진입
// 기본 주소는 주제탐험/주제탐험 메인으로 유지하고,
// ?view=timeline 으로 들어온 경우만 하단 두 번째 '연대기' 화면으로 이동합니다.
(function () {
  const params = new URLSearchParams(window.location.search);

  if (params.get("view") === "timeline") {
    setTimeout(() => {
      if (typeof go === "function") {
        go("eras");
      }
    }, 200);
  }
})();




window.__forceCyrusDetailFix = true;


// v74 고레스 상세보기 버튼 연결 보강
document.addEventListener("click", function(e){
  const el = e.target.closest("[data-event], [data-open-event], [data-detail], [data-event-id]");
  if(!el) return;
  const id = el.dataset.event || el.dataset.openEvent || el.dataset.detail || el.dataset.eventId;
  if(!id) return;
  if(id === "cyrus-decree"){
    e.preventDefault();
    if(typeof showDetail === "function") return showDetail(id);
    if(typeof openDetail === "function") return openDetail(id);
    if(typeof renderDetail === "function") return renderDetail(id);
    if(typeof renderEventDetail === "function") return renderEventDetail(id);
  }
}, true);
