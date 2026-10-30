import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const gate = document.getElementById("authGate");
const appRoot = document.getElementById("mainApp");
const loginButton = document.getElementById("googleLogin");
const logoutButton = document.getElementById("logoutBtn");
const statusEl = document.getElementById("authStatus");
const cloudStatus = document.getElementById("cloudStatus");
const emailEl = document.getElementById("signedInEmail");
const allowed = (window.FST_ALLOWED_EMAILS || []).map(x => x.toLowerCase());
let currentUser = null;
let stopListening = null;
let writeTimer = null;
let applyingCloudData = false;

function status(message) { if (statusEl) statusEl.textContent = message; }
function cloud(message, isError = false) {
  if (!cloudStatus) return;
  cloudStatus.textContent = message;
  cloudStatus.style.color = isError ? "#ff6975" : "#48d597";
  cloudStatus.style.borderColor = isError ? "#75232c" : "#205740";
}
function showApp(user) {
  gate.style.display = "none";
  appRoot.style.visibility = "visible";
  if (emailEl) emailEl.textContent = user.email || "Conta autorizada";
}
function showGate(message) {
  gate.style.display = "grid";
  appRoot.style.visibility = "hidden";
  status(message);
}

let app, auth, db, sharedDoc;
try {
  if (!window.FIREBASE_CONFIG) throw new Error("firebase-config.js não carregou.");
  app = initializeApp(window.FIREBASE_CONFIG);
  auth = getAuth(app);
  db = getFirestore(app);
  sharedDoc = doc(db, "shared", "fst-manager");
} catch (err) {
  showGate("Erro na configuração do Firebase. Confira firebase-config.js.");
  console.error(err);
}

loginButton?.addEventListener("click", async () => {
  if (!auth) return;
  loginButton.disabled = true;
  status("Abrindo o login do Google…");
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error(err);
    status(err.code === "auth/unauthorized-domain"
      ? "Domínio não autorizado. Adicione futureestrelas-create.github.io no Firebase Authentication."
      : "Não foi possível entrar. Confira se o login Google está ativado e tente novamente.");
  } finally {
    loginButton.disabled = false;
  }
});

logoutButton?.addEventListener("click", async () => {
  if (auth) await signOut(auth);
});

if (auth && db && sharedDoc) {
  onAuthStateChanged(auth, async user => {
    if (stopListening) { stopListening(); stopListening = null; }
    currentUser = user;
    if (!user) {
      if (emailEl) emailEl.textContent = "";
      cloud("☁ DESCONECTADO", true);
      showGate("Entre com sua conta Google autorizada para continuar.");
      return;
    }
    if (!user.email || !allowed.includes(user.email.toLowerCase())) {
      await signOut(auth);
      showGate("Essa conta não está autorizada. Use a conta cadastrada para você ou para o Lucas.");
      return;
    }

    showApp(user);
    cloud("☁ CARREGANDO");
    status("");
    try {
      const snap = await getDoc(sharedDoc);
      if (!snap.exists()) {
        // Primeira entrada: preserva os dados locais existentes e cria o documento compartilhado.
        const local = JSON.parse(localStorage.getItem("fst-manager-v1") || "null") || window.FST_GET_LOCAL_DATA?.();
        if (!local || !local.players || !local.matches || !local.competitions) {
          throw new Error("Não foi possível encontrar os dados iniciais do aplicativo.");
        }
        await setDoc(sharedDoc, { data: local, updatedAt: serverTimestamp(), updatedBy: user.email });
      } else if (snap.data()?.data) {
        window.FST_APPLY_CLOUD_DATA?.(snap.data().data);
      }
      stopListening = onSnapshot(sharedDoc, snapshot => {
        if (!snapshot.exists()) return;
        const cloudData = snapshot.data()?.data;
        if (!cloudData) return;
        applyingCloudData = true;
        window.FST_APPLY_CLOUD_DATA?.(cloudData);
        applyingCloudData = false;
        cloud("☁ SINCRONIZADO");
      }, err => {
        console.error(err);
        cloud("☁ ERRO DE SINCRONIZAÇÃO", true);
        if (err.code === "permission-denied") status("Acesso negado pelo Firestore. Confira as regras de segurança fornecidas no arquivo firestore.rules.");
      });
    } catch (err) {
      console.error(err);
      cloud("☁ FALHA NA CONEXÃO", true);
      status(err.code === "permission-denied"
        ? "O Firestore bloqueou o acesso. Publique as regras do arquivo firestore.rules no Console Firebase."
        : "Não foi possível carregar os dados. Confira o banco Firestore e tente novamente.");
    }
  });
}

window.FST_CLOUD_SAVE = function (data) {
  if (!currentUser || !sharedDoc || applyingCloudData) return;
  cloud("☁ SALVANDO…");
  clearTimeout(writeTimer);
  const payload = JSON.parse(JSON.stringify(data));
  writeTimer = setTimeout(async () => {
    try {
      await setDoc(sharedDoc, { data: payload, updatedAt: serverTimestamp(), updatedBy: currentUser.email });
      cloud("☁ SINCRONIZADO");
    } catch (err) {
      console.error(err);
      cloud("☁ ERRO AO SALVAR", true);
      if (err.code === "permission-denied") status("Sem permissão de escrita. Confira as regras do Firestore.");
    }
  }, 250);
};
