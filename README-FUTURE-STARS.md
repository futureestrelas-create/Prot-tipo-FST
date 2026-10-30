# FUTURE STARS MANAGER — versão inicial personalizada

Esta pasta contém uma cópia de trabalho do FIFA FAR PLAY com a identidade visual inicial do FUTURE STARS MANAGER.

## O que foi adaptado
- Nome e título do aplicativo.
- Paleta escura com vermelho, preto, branco e prata.
- Manifesto PWA com o nome FUTURE STARS.
- Ícone SVG inicial próprio.
- Removida a referência fixa ao e-mail do administrador original; agora o e-mail administrador é configurável em `firebase-config.js`.

## O que ainda NÃO está pronto
- A configuração do Firebase não está incluída, por segurança.
- Login, Firestore e Storage não funcionarão até configurar seu próprio projeto Firebase.
- As cartas do Ultimate Team e as estatísticas por versão de carta ainda precisam ser desenvolvidas.
- É necessário revisar e publicar regras de segurança do Firestore e Storage antes de usar com dados reais.
- Esta versão não foi publicada na internet.

## Configurar seu Firebase
1. Crie um projeto no Firebase Console: https://console.firebase.google.com/
2. Adicione um aplicativo Web e copie a configuração.
3. Copie `firebase-config.example.js` para `firebase-config.js`.
4. Preencha `FIREBASE_CONFIG` com os dados do seu projeto e `FSFC_ADMIN_EMAIL` com o e-mail Google que será administrador inicial.
5. No Firebase Authentication, habilite o provedor Google. O código original também oferece Apple, que exige configuração própria.
6. Crie o banco Cloud Firestore e configure regras de segurança antes de publicar.
7. Habilite Firebase Storage se quiser armazenar imagens.

## Teste local
O projeto usa módulos ES e precisa ser servido por HTTP/HTTPS; abrir `index.html` diretamente como `file://` pode falhar.
Com Node.js instalado, rode `npx serve .` dentro desta pasta ou use um servidor estático equivalente.

## Publicação
Pode ser publicado no GitHub Pages ou Firebase Hosting. Configure o domínio autorizado no Firebase Authentication.
Para instalação como PWA no iPhone, o site deve estar publicado em HTTPS; no Safari, use Compartilhar → Adicionar à Tela de Início.

## Próxima etapa do FUTURE STARS
1. Configurar o Firebase próprio.
2. Preparar e validar regras de segurança.
3. Testar login de administrador e segundo participante.
4. Implementar cadastro de cards (imagem, nome, versão, overall e posição).
5. Implementar estatísticas separadas por carta e consolidadas por atleta.
6. Validar campeonatos, temporadas e rankings antes da publicação final.
