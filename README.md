# Lista de Compras Compartilhada - PWA

Um aplicativo Progressive Web App (PWA) para gerenciar listas de compras compartilhadas com sincronização em tempo real usando Firebase.

## 🚀 Características

- ✅ **Autenticação completa** - Login com email/senha ou Google
- ✅ **Sincronização em tempo real** - Veja mudanças instantaneamente em todos os dispositivos
- ✅ **Listas compartilhadas** - Compartilhe com família e amigos via código ou email
- ✅ **Suporte offline** - Funciona sem internet, sincroniza quando voltar online
- ✅ **PWA instalável** - Instale na tela inicial como um app nativo
- ✅ **Notificações push (opcional)** - Receba alertas de atualizações
- ✅ **Interface em Português** - 100% traduzido

## ⚠️ Configuração Necessária

**O app não funcionará sem configurar o Firebase primeiro!**

Antes de usar, você DEVE:
1. Criar um projeto no Firebase Console
2. Configurar Firestore Database
3. **Adicionar as regras de segurança** (arquivo `firestore.rules`)
4. Adicionar as variáveis de ambiente no v0

Siga o guia completo em: **FIREBASE_SETUP.md**

## 🔧 Variáveis de Ambiente Obrigatórias

Adicione estas variáveis na seção "Vars" do v0:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
\`\`\`

## 📱 Como Usar

### Criar uma Lista
1. Faça login com sua conta
2. Clique em "Nova Lista"
3. Digite o nome e clique em "Criar"

### Adicionar Itens
1. Abra uma lista
2. Digite o nome do item
3. Opcionalmente adicione quantidade e notas
4. Clique em "Adicionar"

### Compartilhar uma Lista
1. Abra a lista que deseja compartilhar
2. Clique no botão "Compartilhar"
3. Escolha uma das opções:
   - **Por Código**: Compartilhe o código de 6 letras
   - **Por Email**: Digite o email do participante

### Entrar em uma Lista Compartilhada
1. Na página inicial, clique em "Entrar em Lista"
2. Digite o código de 6 letras que você recebeu
3. A lista aparecerá em "Minhas Listas"

## 🛠️ Tecnologias

- **Next.js 16** - Framework React
- **Firebase Authentication** - Login seguro
- **Firestore** - Banco de dados em tempo real
- **Firebase Cloud Messaging** - Notificações push
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de UI

## 📦 Instalação como PWA

### No celular (Android/iOS):
1. Abra o app no navegador
2. Toque no menu do navegador
3. Selecione "Adicionar à tela inicial"
4. O ícone do app aparecerá na tela inicial

### No desktop (Chrome/Edge):
1. Abra o app no navegador
2. Clique no ícone de instalação na barra de endereço
3. Clique em "Instalar"

## 🔒 Segurança

- Todas as operações exigem autenticação
- Usuários só podem acessar listas das quais são membros
- Regras de segurança do Firestore protegem os dados
- Senhas nunca são armazenadas em texto plano

## 🐛 Problemas Comuns

### "Missing or insufficient permissions"
→ Você não configurou as regras do Firestore. Veja FIREBASE_SETUP.md, passo 4.

### "The query requires an index"
→ Clique no link que aparece no console do navegador para criar o índice.

### Notificações não funcionam
→ A chave VAPID é opcional. Veja FIREBASE_SETUP.md, passo 8.

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.
