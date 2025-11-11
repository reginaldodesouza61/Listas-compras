# Configuração do Firebase

## ⚠️ IMPORTANTE: Configure as regras de segurança primeiro!

O erro "Missing or insufficient permissions" significa que o Firestore está bloqueando o acesso porque as regras de segurança não foram configuradas. Siga os passos abaixo para resolver.

## Passos para configurar o Firebase no projeto

### 1. Criar Projeto no Firebase
1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Siga as instruções para criar seu projeto

### 2. Configurar Autenticação
1. No menu lateral, vá em "Authentication" (Autenticação)
2. Clique em "Começar"
3. Ative os seguintes métodos:
   - **Email/Senha**: Clique em "Email/senha" e ative
   - **Google**: Clique em "Google" e ative, adicionando um email de suporte
4. **IMPORTANTE para v0 Preview**: Adicione domínios autorizados
   - Na aba "Authentication", vá em "Settings" (Configurações)
   - Role até "Authorized domains" (Domínios autorizados)
   - Clique em "Add domain" (Adicionar domínio)
   - Adicione o domínio do seu preview do v0 (ex: `seu-projeto.v0.app`)
   - Se estiver testando localmente, também adicione `localhost`

### 3. Configurar Firestore Database
1. No menu lateral, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha o modo de produção
4. Selecione uma localização (ex: southamerica-east1 para São Paulo)

### 4. 🔒 Adicionar Regras de Segurança do Firestore (OBRIGATÓRIO)

**Este passo é essencial para resolver o erro de permissões!**

1. No Firestore, vá em "Regras" (Rules)
2. Copie o conteúdo do arquivo `firestore.rules` deste projeto
3. Cole no editor de regras do Firebase
4. Clique em "Publicar" (Publish)

As regras garantem que:
- Apenas usuários autenticados podem acessar dados
- Usuários só podem ver listas das quais são membros
- Usuários só podem modificar itens de suas próprias listas

### 5. Criar Índices no Firestore (OPCIONAL)

**Boa notícia:** O app foi otimizado para funcionar sem índices compostos! A ordenação das listas agora é feita no cliente, eliminando a necessidade de criar índices manualmente.

Se você ainda encontrar um erro pedindo índices (especialmente para os itens da lista):

**Opção 1 - Automática (Recomendada):**
- Quando o erro aparecer, clique no link fornecido na mensagem de erro no console do navegador
- O Firebase abrirá uma página para criar o índice automaticamente
- Aguarde alguns minutos para o índice ficar ativo

**Opção 2 - Manual:**
1. Vá em "Firestore Database" > "Índices" 
2. Clique em "Criar índice"

**Índice para Itens (se necessário):**
- Coleção: `items`
- Campos:
  - `listId` - Ascending (Crescente)
  - `completed` - Ascending (Crescente)
  - `createdAt` - Descending (Decrescente)

**Nota:** Após criar um índice, pode levar 2-5 minutos para ficar completamente ativo.

### 6. Obter Credenciais do Projeto
1. Vá em "Configurações do projeto" (ícone de engrenagem no menu lateral)
2. Na aba "Geral", role até "Seus apps"
3. Se não tiver um app web, clique em "Adicionar app" > ícone Web (</>)
4. Registre o app com um apelido (ex: "Lista de Compras Web")
5. Copie o objeto `firebaseConfig` que aparece

### 7. Adicionar Variáveis de Ambiente no v0

No v0, abra a barra lateral esquerda e vá em **"Vars"**. Adicione as seguintes variáveis **OBRIGATÓRIAS**:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
\`\`\`

### 8. (OPCIONAL) Configurar Notificações Push

Se você deseja notificações push, siga estes passos adicionais:

1. No Firebase Console, vá em "Cloud Messaging"
2. Clique em "Configurar o Cloud Messaging da Web"
3. Em "Certificados de push da Web", clique em "Gerar par de chaves"
4. Copie a chave pública VAPID gerada
5. Adicione esta variável no v0 (seção "Vars"):

\`\`\`
NEXT_PUBLIC_FIREBASE_VAPID_KEY=sua_chave_vapid_publica
\`\`\`

**Nota:** Se você não configurar a chave VAPID, o app funcionará perfeitamente, mas sem notificações push. Os participantes ainda verão atualizações em tempo real quando estiverem com o app aberto.

## Funcionalidades sem VAPID Key

Mesmo sem configurar notificações push, você terá:
- ✅ Sincronização em tempo real quando o app está aberto
- ✅ Suporte offline completo
- ✅ Compartilhamento de listas
- ✅ Todas as funcionalidades principais

Com VAPID Key configurada, você ganha:
- ✅ Notificações quando o app está fechado
- ✅ Botão "Notificar Participantes"

## Troubleshooting

### ❌ Erro: "Missing or insufficient permissions"
**Causa:** As regras de segurança do Firestore não foram configuradas.

**Solução:**
1. Vá no Firebase Console > Firestore Database > Regras
2. Copie o conteúdo do arquivo `firestore.rules` deste projeto
3. Cole no editor e clique em "Publicar"
4. Aguarde alguns segundos e recarregue o app

### ❌ Erro: "The query requires an index"
**Causa:** Um índice composto necessário não existe.

**Solução:**
- O próprio erro mostrará um link no console do navegador
- Clique no link para criar o índice automaticamente
- Ou crie manualmente seguindo o passo 5 acima

### ⚠️ Erro: "Failed to get document because the client is offline"
**Causa:** Normal em primeira execução - Firestore está configurando cache offline.

**Solução:**
- Aguarde alguns segundos e recarregue
- Uma vez que houver dados, o cache offline funcionará perfeitamente

### ❌ Notificações não aparecem
**Verificações:**
- A chave VAPID foi adicionada nas variáveis de ambiente?
- O navegador tem permissão para notificações?
- Você está em HTTPS ou localhost? (HTTP não funciona)

### ❌ Erro: "auth/unauthorized-domain"
**Causa:** O domínio onde o app está rodando não está autorizado no Firebase para autenticação OAuth (Google Sign-In).

**Solução:**
1. Vá no Firebase Console > Authentication > Settings
2. Role até "Authorized domains"
3. Clique em "Add domain"
4. Adicione o domínio completo do seu preview v0 (ex: `seu-projeto.v0.app`)
5. Clique em "Add" e aguarde alguns segundos
6. Recarregue o app e tente novamente

**Como encontrar seu domínio:**
- Copie a URL que aparece na barra de endereço do preview do v0
- Use apenas a parte do domínio, sem `https://` e sem caminhos
- Exemplo: de `https://meu-app.v0.app/list/123` use apenas `meu-app.v0.app`

## Recursos Adicionais
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/js/client)
