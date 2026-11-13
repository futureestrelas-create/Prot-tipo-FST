// FUTURE STARS FC — leitor de partidas com Firebase AI Logic / Gemini Developer API.
// Usa o FirebaseApp já inicializado pelo firebase-sync.js; não expõe chave de API no frontend.
import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-ai.js";

const MODEL_NAME = "gemini-3.8-flash";
let modelPromise = null;

function getModel() {
  if (!window.FST_FIREBASE_APP) {
    throw new Error("Firebase ainda não terminou de inicializar. Atualize a página e tente novamente.");
  }
  if (!modelPromise) {
    const ai = getAI(window.FST_FIREBASE_APP, { backend: new GoogleAIBackend() });
    const model = getGenerativeModel(ai, {
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 1800
      }
    });
    modelPromise = Promise.resolve(model);
  }
  return modelPromise;
}

function fileToPart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.split(",")[1];
      if (!base64) return reject(new Error("Não foi possível ler uma das imagens."));
      resolve({ inlineData: { data: base64, mimeType: file.type } });
    };
    reader.onerror = () => reject(new Error("Falha ao carregar uma das imagens."));
    reader.readAsDataURL(file);
  });
}

function cleanNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 10) / 10 : null;
}
function setStatus(message, error=false) {
  const el = document.getElementById("fstGeminiStatus");
  if (el) {
    el.textContent = message;
    el.style.color = error ? "#ff8791" : "#aeb3bd";
  }
}
function fillIfReadable(form, name, value) {
  if (value === null || value === undefined || value === "") return false;
  const input = form.elements.namedItem(name);
  if (!input) return false;
  input.value = String(value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}
function setRosterRows(kind, entries) {
  if (!Array.isArray(entries) || !entries.length) return;
  const rows = [...document.querySelectorAll(kind === "scorers" ? ".scorer-row" : ".assist-row")];
  entries.slice(0, rows.length).forEach((entry, i) => {
    const row = rows[i];
    const select = row.querySelector(".roster-player");
    const count = row.querySelector(".stat-count");
    if (!select || !entry?.name) return;
    const wanted = String(entry.name).trim().toLocaleLowerCase("pt-BR");
    const option = [...select.options].find(o => o.value.toLocaleLowerCase("pt-BR") === wanted);
    if (option) {
      select.value = option.value;
      if (count && cleanNumber(kind === "scorers" ? entry.goals : entry.assists) !== null) {
        count.value = cleanNumber(kind === "scorers" ? entry.goals : entry.assists);
      }
    }
  });
}
function normalizeResult(raw) {
  const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
  return {
    opponent: typeof obj.opponent === "string" ? obj.opponent.trim() : "",
    our_goals: cleanNumber(obj.our_goals),
    opponent_goals: cleanNumber(obj.opponent_goals),
    match_date: typeof obj.match_date === "string" ? obj.match_date : "",
    scorers: Array.isArray(obj.scorers) ? obj.scorers : [],
    assists: Array.isArray(obj.assists) ? obj.assists : [],
    statistics: obj.statistics && typeof obj.statistics === "object" ? obj.statistics : {},
    unreadable: Array.isArray(obj.unreadable) ? obj.unreadable : [],
    confidence: obj.confidence && typeof obj.confidence === "object" ? obj.confidence : {}
  };
}

document.addEventListener("change", event => {
  if (event.target?.id !== "fstMatchImages") return;
  const files = [...event.target.files || []];
  const label = document.getElementById("fstGeminiFiles");
  if (label) label.textContent = files.length
    ? files.slice(0,3).map(f => `${f.name} (${(f.size/1024/1024).toFixed(1)} MB)`).join(" · ") + (files.length > 3 ? " · Apenas as 3 primeiras serão usadas." : "")
    : "Nenhuma imagem selecionada.";
});

document.addEventListener("click", async event => {
  const button = event.target?.closest?.("#fstGeminiAnalyze");
  if (!button) return;
  const form = document.getElementById("dataForm");
  const input = document.getElementById("fstMatchImages");
  const files = [...(input?.files || [])].slice(0,3);
  if (!form || !form.elements.namedItem("opponent")) return;
  if (!window.FST_CURRENT_USER?.email) {
    setStatus("Entre com uma conta autorizada antes de usar a IA.", true);
    return;
  }
  if (!files.length) {
    setStatus("Selecione pelo menos uma captura do EA FC.", true);
    return;
  }
  if (files.some(f => !["image/jpeg","image/png","image/webp"].includes(f.type))) {
    setStatus("Use imagens JPG, PNG ou WEBP.", true);
    return;
  }
  if (files.some(f => f.size > 10 * 1024 * 1024)) {
    setStatus("Cada imagem deve ter no máximo 10 MB.", true);
    return;
  }
  button.disabled = true;
  button.textContent = "ANALISANDO…";
  setStatus("Gemini está lendo as capturas. Isso pode levar alguns segundos.");
  try {
    const parts = await Promise.all(files.map(fileToPart));
    const prompt = `Você é um leitor especializado de telas do EA SPORTS FC / Ultimate Team.
Analise TODAS as imagens anexadas em conjunto. Extraia somente informações realmente visíveis. Não invente, não complete por suposição e não confunda estatísticas do FUTURE STARS (jogador/time do lado esquerdo ou identificado como usuário) com as do adversário. Use null quando não conseguir ler.
Retorne APENAS JSON válido, sem markdown, neste formato:
{
 "opponent": "nome do adversário ou null",
 "our_goals": número inteiro ou null,
 "opponent_goals": número inteiro ou null,
 "match_date": "YYYY-MM-DD ou null",
 "scorers": [{"name":"nome legível","goals":1}],
 "assists": [{"name":"nome legível","assists":1}],
 "statistics": {
   "possession_us": número ou null, "possession_opponent": número ou null,
   "shots_us": número ou null, "shots_opponent": número ou null,
   "shots_on_target_us": número ou null, "shots_on_target_opponent": número ou null,
   "passes_us": número ou null, "passes_opponent": número ou null,
   "pass_accuracy_us": número ou null, "pass_accuracy_opponent": número ou null,
   "expected_goals_us": número ou null, "expected_goals_opponent": número ou null
 },
 "confidence": {"score":"alta|média|baixa","opponent":"alta|média|baixa"},
 "unreadable": ["lista de campos que não puderam ser lidos"]
}
Se houver telas de resumo e estatísticas, use o resumo para placar e as telas detalhadas para estatísticas. Se os prints se contradisserem, não escolha por conta própria: use null no campo conflitante e explique em unreadable. Nomes de jogadores só devem ser incluídos se estiverem legíveis. Não deduza o nome do adversário pelo nome do clube do usuário.`;
    const model = await getModel();
    const result = await model.generateContent([prompt, ...parts]);
    const responseText = result.response.text();
    const parsed = normalizeResult(responseText);
    let filled = [];
    if (fillIfReadable(form, "opponent", parsed.opponent)) filled.push("adversário");
    if (fillIfReadable(form, "our", parsed.our_goals)) filled.push("gols do FUTURE STARS");
    if (fillIfReadable(form, "their", parsed.opponent_goals)) filled.push("gols do adversário");
    if (parsed.match_date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.match_date)) {
      if (fillIfReadable(form, "date", parsed.match_date)) filled.push("data");
    }
    setRosterRows("scorers", parsed.scorers);
    setRosterRows("assists", parsed.assists);
    window.FST_LAST_MATCH_AI_STATS = parsed.statistics;
    const unreadable = parsed.unreadable.length ? ` Não foi possível confirmar: ${parsed.unreadable.join(", ")}.` : "";
    const statCount = Object.values(parsed.statistics).filter(v => v !== null && v !== undefined).length;
    setStatus(`Leitura concluída. Campos preenchidos: ${filled.length ? filled.join(", ") : "nenhum campo principal"}. ${statCount} estatísticas extras foram lidas e ficarão anexadas ao registro. Confira tudo antes de salvar.${unreadable}`);
  } catch (error) {
    console.error("FST Gemini Vision:", error);
    const msg = String(error?.message || error);
    if (/app.?check|403|permission|unauthenticated/i.test(msg)) {
      setStatus("O Firebase recusou a chamada. Confira a configuração de App Check e se a API Gemini Developer está ativa. Detalhe: " + msg.slice(0,180), true);
    } else if (/quota|429|resource_exhausted/i.test(msg)) {
      setStatus("A cota gratuita do Gemini foi atingida ou está temporariamente indisponível. Tente novamente mais tarde.", true);
    } else {
      setStatus("Não foi possível analisar as imagens: " + msg.slice(0,220), true);
    }
  } finally {
    button.disabled = false;
    button.textContent = "✦ ANALISAR CAPTURAS E PREENCHER";
  }
});
