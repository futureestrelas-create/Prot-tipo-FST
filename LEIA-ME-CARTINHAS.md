# Cadastro de jogadores com cartinhas JPG

## O que mudou
- Cadastro de jogador com nome, posição, overall e upload de imagem JPG/JPEG.
- Grade de cartas com a imagem original.
- Busca por nome, filtro por posição e ordenação por overall/nome.
- Edição e exclusão de jogadores.
- As imagens são enviadas ao Firebase Storage; o Firestore guarda apenas a URL e o caminho do arquivo.
- Os jogadores antigos continuam compatíveis e aparecem com carta provisória até que uma imagem seja adicionada.

## Antes de publicar: ativar o Firebase Storage
Este recurso requer o Firebase Storage ativado no projeto `future-stars-manager`. Dependendo da configuração/idade do bucket e do plano do projeto, o Firebase pode solicitar habilitar cobrança (Blaze). Confira os termos e custos no Console Firebase antes de ativar; não confirme upgrade sem revisar.

1. Abra https://console.firebase.google.com/ e selecione `future-stars-manager`.
2. Abra **Storage** e inicie a configuração do bucket, se ainda não existir.
3. Escolha a localização apropriada. A localização do bucket não poderá ser alterada depois.
4. No Storage → **Rules**, publique o conteúdo do arquivo `storage.rules`.
5. As regras permitem leitura apenas às duas contas autorizadas e uploads JPEG até 2 MB. Não use regras públicas.
6. Confira se `firebase-config.js` contém o `storageBucket` correto do bucket criado. O valor atualmente configurado é `future-stars-manager.firebasestorage.app`; confirme no Console se corresponde ao bucket real.

## Publicar no GitHub Pages
Envie para a branch publicada (`main`) os arquivos:
- `index.html`
- `firebase-sync.js`

O arquivo `storage.rules` deve ser copiado para Firebase Console → Storage → Rules e publicado lá; GitHub Pages não publica regras do Firebase.

## Teste obrigatório
1. Entre com uma das contas autorizadas.
2. Abra Elenco → Adicionar jogador.
3. Cadastre um jogador com JPG/JPEG de até 2 MB.
4. Atualize a página e confira se a carta continua.
5. Entre com a outra conta autorizada e confirme que a imagem aparece.
6. Teste editar, trocar imagem, buscar, filtrar e excluir.

## Preservação dos dados
Não limpe `localStorage`, não apague o documento `shared/fst-manager` e não restaure os dados de exemplo durante a atualização.
