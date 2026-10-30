// Configuração pública do aplicativo Web Firebase.
// As chaves de configuração Web identificam o projeto; a segurança real é feita pelas regras do Firestore.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAtUJT7LhQH7OQGuBj4Gy8paOiygMcCLaA",
  authDomain: "future-stars-manager.firebaseapp.com",
  projectId: "future-stars-manager",
  storageBucket: "future-stars-manager.firebasestorage.app",
  messagingSenderId: "1091974260776",
  appId: "1:1091974260776:web:1c38bd02af39956fe1ed1d",
  measurementId: "G-8VYJ3B0BL0"
};

// Contas permitidas na interface. O mesmo controle também é aplicado nas regras do Firestore.
window.FST_ALLOWED_EMAILS = [
  "hernandesfifa15ps4@gmail.com",
  "lucasmitoo4514@gmail.com"
];
