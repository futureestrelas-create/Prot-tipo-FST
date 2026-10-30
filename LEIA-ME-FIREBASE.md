# Configuração da sincronização do FUTURE STARS MANAGER

O site usa Firebase Authentication (Google) e Cloud Firestore para compartilhar o documento `shared/fst-manager` entre as duas contas autorizadas.

## 1. Verifique as contas autorizadas

Confira `firebase-config.js` e `firestore.rules`. As duas contas precisam coincidir nos dois arquivos. A configuração atual inclui a conta administradora usada no projeto e `lucasmitoo4514@gmail.com`.

## 2. Domínio autorizado

No Firebase Console → Authentication → Configurações → Domínios autorizados, confirme que existe:

`futureestrelas-create.github.io`

## 3. Login Google

No Firebase Console → Authentication → Método de login, confirme que o provedor Google está ativado e que existe um e-mail de suporte do projeto.

## 4. Publique as regras do Firestore

No Firebase Console → Firestore Database → Regras, substitua as regras atuais pelo conteúdo de `firestore.rules` e clique em **Publicar**.

As regras permitem ler/escrever somente para usuários autenticados, com e-mail verificado, cujo e-mail esteja na lista. Não use regras abertas como `allow read, write: if true`.

## 5. Publique no GitHub Pages

Envie para a branch `main` os arquivos atualizados, incluindo `index.html`, `firebase-config.js` e `firebase-sync.js`. O arquivo `firestore.rules` é para copiar para o Console Firebase; o GitHub Pages não publica essas regras automaticamente.

## 6. Primeiro acesso e dados

No primeiro login autorizado, o aplicativo usa os dados locais desse navegador para inicializar o documento compartilhado, caso ele ainda não exista. Depois disso, o Firestore é a fonte compartilhada. Antes do primeiro login, exporte um backup se houver dados importantes.

## Observação de segurança

As credenciais de configuração do Firebase para aplicativos Web não são senhas secretas. A proteção dos dados depende das regras de segurança do Firestore e da lista de contas autorizadas. Se a conta administradora do projeto for diferente da listada, atualize ambos os arquivos antes de publicar.
