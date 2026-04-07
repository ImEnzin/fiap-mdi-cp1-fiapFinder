# 📱 FIAP Finder - Aplicativo Mobile

Um aplicativo completo desenvolvido com **React Native** e **Expo** para ajudar estudantes da FIAP a encontrar livros disponíveis na biblioteca e reportar itens perdidos no campus.

## 🎯 Sobre o Projeto

O **FIAP Finder** é um aplicativo multiplataforma (iOS, Android e Web) que funciona como um intermediário entre estudantes, permitindo:

- 📚 **Buscar livros** disponíveis na biblioteca
- 🔍 **Visualizar detalhes** de cada livro (autor, descrição, capa)
- 📍 **Reportar itens perdidos** no campus
- 🏷️ **Pesquisar itens encontrados** no app
- 👤 **Gerenciar perfil** do usuário
- 📋 **Acompanhar reservas** de livros

---

## 🚀 Como Instalar e Rodar

### Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 16+) - [Download aqui](https://nodejs.org/)
- **npm** (geralmente vem com Node.js)
- **Expo CLI** (instale globalmente)

### Instalação Rápida

⚠️ **PASSO 0: ENTRE NA PASTA DO PROJETO PRIMEIRO!**

```bash
cd "c:\wamp64\www\cp01 mobile\fiap-finder"
```

**Depois, execute os passos abaixo dentro dessa pasta:**

```bash
# 1. Instale todas as dependências
npm install

# 2. Instale o Expo CLI globalmente (se não tiver)
npm install -g expo-cli
```

✅ Pronto! Agora você está dentro da pasta e pode rodar os comandos abaixo.

### Rodando o Aplicativo

Escolha a plataforma desejada:

#### 🌐 Rodar na Web
```bash
npm run web
```
Abre o navegador automaticamente em `http://localhost:19006`

#### 📱 Rodar no Android (Emulador ou Device)
```bash
npm run android
```
Você precisa ter um emulador Android aberto ou um dispositivo conectado

#### 🍎 Rodar no iOS (Emulador ou Device)
```bash
npm run ios
```
Requer macOS e Xcode instalado

#### ▶️ Modo Desenvolvimento
```bash
npm start
```
Abre o Expo Metro Bundle. Use as teclas:
- `a` - Abrir no Android
- `i` - Abrir no iOS
- `w` - Abrir na Web
- `q` - Sair

---

## 📂 Estrutura de Pastas

```
fiap-finder/
├── app/                          # Rotas e telas do aplicativo
│   ├── _layout.jsx              # Layout raiz
│   ├── login.jsx                # Tela de login
│   ├── (tabs)/                  # Abas principais (navegação por abas)
│   │   ├── _layout.jsx          # Layout do sistema de abas
│   │   ├── index.jsx            # Tela inicial (Home)
│   │   ├── biblioteca.jsx       # Tela de livros/biblioteca
│   │   ├── achados.jsx          # Tela de itens encontrados
│   │   ├── reservas.jsx         # Tela de reservas do usuário
│   │   └── perfil.jsx           # Tela de perfil do usuário
│   ├── item/[id].jsx            # Detalhes de um item perdido
│   └── livro/[id].jsx           # Detalhes de um livro
│
├── components/                   # Componentes React reutilizáveis
│   ├── BookCard.jsx             # Card para exibir livros
│   ├── LostItemCard.jsx         # Card para itens perdidos
│   ├── Header.jsx               # Cabeçalho do app
│   ├── SearchBar.jsx            # Barra de pesquisa
│   ├── PrimaryButton.jsx        # Botão principal (CTA)
│   ├── SecondaryButton.jsx      # Botão secundário
│   ├── StatusBadge.jsx          # Badge de status
│   ├── LoadingState.jsx         # Estado de carregamento
│   └── EmptyState.jsx           # Estado vazio (sem resultados)
│
├── context/                      # Context API para estado global
│   ├── AuthContext.jsx          # Contexto de autenticação
│   ├── LivrosContext.jsx        # Contexto de livros
│   └── ItensContext.jsx         # Contexto de itens perdidos
│
├── constants/                    # Constantes da aplicação
│   └── colors.js                # Paleta de cores do app
│
├── data/                         # Dados mockados/simulados
│   ├── livros.js                # Lista de livros de exemplo
│   └── itens.js                 # Lista de itens perdidos de exemplo
│
├── utils/                        # Funções utilitárias
│   └── dateUtils.js             # Funções de manipulação de datas
│
├── assets/                       # Imagens, ícones e mídia
│   ├── icon.png                 # Ícone do aplicativo
│   ├── splash-icon.png          # Splash screen
│   ├── android-icon-*.png       # Ícones Android
│   └── favicon.png              # Favicon para web
│
├── app.json                      # Configuração do Expo
├── package.json                  # Dependências do projeto
├── package-lock.json            # Lock das versões
└── README.md                     # Este arquivo
```

---

## 🛠️ Dependências Principais

| Dependência | Versão | Propósito |
|---|---|---|
| **expo** | ~54.0.33 | Framework para desenvolver apps React Native |
| **react** | 19.1.0 | Biblioteca de UI (componentes) |
| **react-native** | 0.81.5 | Framework mobile JavaScript |
| **expo-router** | ~6.0.23 | Sistema de roteamento (navegação) |
| **react-native-screens** | ~4.16.0 | Otimiza performance das telas |
| **react-native-gesture-handler** | ~2.28.0 | Detecta gestos na tela (swipe, etc) |
| **expo-vector-icons** | ~15.0.3 | Biblioteca de ícones |
| **expo-font** | ~14.0.11 | Carregar fontes customizadas |
| **react-native-safe-area-context** | ~5.6.0 | Respeita áreas seguras do device |

Para ver todas as dependências, abra o arquivo [package.json](package.json).

---

## 🎨 Arquitetura do App

### Estado Global (Context API)

O app usa **React Context** para gerenciar estado global:

- **AuthContext**: Armazena dados do usuário logado
- **LivrosContext**: Gerencia lista de livros da biblioteca
- **ItensContext**: Gerencia itens perdidos/encontrados

### Navegação

O app usa **Expo Router** para:
- **Navegação em abas** (Home, Biblioteca, Achados, Reservas, Perfil)
- **Stack navigation** para detalhes de livros e itens
- **Deep linking** (links profundos para compartilhar)

### Componentes Principais

1. **BookCard** - Exibe um livro em formato de card
2. **LostItemCard** - Exibe um item perdido
3. **SearchBar** - Busca e filtro
4. **PrimaryButton/SecondaryButton** - Ações principais

---

## 💡 Como Usar o App

### 1️⃣ Tela de Login
- Faça login com suas credenciais
- Primeiro acesso? Use dados de teste (se disponíveis)

### 2️⃣ Home (Inicial)
- Visualize destaques e últimas atualizações
- Acesso rápido às principais funcionalidades

### 3️⃣ Biblioteca
- Busque livros por título, autor ou categoria
- Clique em um livro para ver detalhes
- Faça reserva de livros disponíveis

### 4️⃣ Achados
- Visualize itens perdidos reportados por outros usuários
- Pesquise por tipo de item ou data
- Se encontrou algo, contate o dono

### 5️⃣ Reservas
- Veja seus livros reservados
- Acompanhe o status de cada reserva
- Cancele reservas se necessário

### 6️⃣ Perfil
- Edite suas informações pessoais
- Configure preferências do app
- Logout

---

## 🐛 Desenvolvimento e Debugging

### Usando o Expo DevTools

Quando o app está rodando, aperte:
- `Ctrl + Shift + D` (Windows/Linux)
- `Cmd + Shift + D` (Mac)

Para abrir outras funcionalidades.

### Verificando Erros

Abra o console do navegador (F12) ou o terminal onde rodou `npm start` para ver mensagens de erro.

### Hot Reload

O app recarrega automaticamente quando você salva alterações nos arquivos JavaScript.

---

## 📦 Scripts Disponíveis

Na raiz do projeto, você pode executar:

```bash
npm start          # Inicia o Expo em modo de desenvolvimento
npm run web        # Roda na web (navegador)
npm run android    # Roda no Android
npm run ios        # Roda no iOS
npm install        # Instala todas as dependências
```

---

## 🔧 Variáveis de Ambiente (Futura Implementação)

Para conectar a APIs reais, crie um arquivo `.env` na raiz:

```
REACT_APP_API_BASE_URL=https://api.seu-servidor.com
REACT_APP_AUTH_TOKEN=seu-token
```

**Nota**: Este projeto atualmente usa dados mockados em `/data`.

---

## 📝 Padrões de Código

### Nomes de Componentes
- Componentes sempre com **PascalCase** (ex: `BookCard.jsx`)
- Páginas/Telas também com **PascalCase**

### Nomes de Arquivos
- Contextos: `*Context.jsx`
- Utilitários: `*Utils.js`
- Componentes: `*.jsx`

### Estrutura de Componentes
```javascript
import React from 'react';
import { View, Text } from 'react-native';

export default function MeuComponente({ prop1, prop2 }) {
  return (
    <View>
      <Text>{prop1}</Text>
    </View>
  );
}
```

---

## 🆘 Troubleshooting

### Erro: "npm not found"
- Node.js não está instalado ou não está no PATH
- [Baixe Node.js aqui](https://nodejs.org/)

### Erro: "Expo CLI not found"
```bash
npm install -g expo-cli
```

### App não recarrega depois de salvar
- Pressione `r` no terminal (hard refresh)
- Ou reinicie com `npm start`

### Erro de dependências
```bash
# Limpe o cache
npm cache clean --force

# Reinstale tudo
rm -r node_modules package-lock.json
npm install
```

### Porta já está em uso
Se receber erro de porta (ex: 19006 está ocupada):
```bash
npm start -- --port 19007
```

---

## 👨‍💻 Contribuindo

Se você vai mexer no código:

1. **Crie uma branch** para sua feature (`git checkout -b feature/NovaFunc`)
2. **Commit suas mudanças** (`git commit -m 'Adiciona nova função'`)
3. **Push para a branch** (`git push origin feature/NovaFunc`)
4. **Abra um Pull Request**

---

## 📚 Recursos Úteis

- [Documentação Expo](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Router Navigation](https://expo.github.io/router)
- [React Context API](https://react.dev/reference/react/useContext)

---

## 📄 Licença

Este projeto é parte do curso FIAP.

---

## ✅ Checklist para Começar

- [ ] Node.js instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Escolha a plataforma (web, Android ou iOS)
- [ ] Execute `npm run <plataforma>`
- [ ] App aberto? Sucesso! 🎉

---

## 💬 Dúvidas?

Se tiver dúvidas sobre o projeto, verifique:
1. Este README
2. Os comentários no código
3. A documentação oficial do Expo
4. Os exemplos em `/data` para entender a estrutura

**Bom desenvolvimento! 🚀**
