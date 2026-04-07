# 🤝 Guia de Contribuição - FIAP Finder

## Como Contribuir

Obrigado por querer ajudar no projeto FIAP Finder! 🎉

### 1. Antes de Começar

- Leia o [README.md](README.md) para entender o projeto
- Siga o [Guia de Setup](SETUP.md)
- Verifique se a feature/bug já não existe

### 2. Criar uma Nova Feature

```bash
# 1. Crie uma branch com nome descritivo
git checkout -b feature/adiciona-notificacoes

# 2. Modifique os arquivos
# Adicione sua lógica em app/, components/, etc

# 3. Teste suas mudanças
npm run web

# 4. Adicione os arquivos
git add .

# 5. Commit com mensagem clara
git commit -m "Adiciona sistema de notificações"

# 6. Push para seu repositório
git push origin feature/adiciona-notificacoes

# 7. Abra um Pull Request
```

### 3. Reportar um Bug

Se encontrou um bug, abra uma **Issue** com:
- Descrição clara do problema
- Como reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Environment (Web/Android/iOS)

### 4. Padrões de Código

#### Nomenclatura
```javascript
// ✅ Bom
function getUserBooks() { }
const isLoading = true;
const CACHE_DURATION = 3600;

// ❌ Ruim
function getUB() { }
const loading = true;
const cacheTime = 3600;
```

#### Componentes React
```javascript
// ✅ Bom - Bem estruturado
export default function BookCard({ book, onPress }) {
  const handlePress = () => onPress(book.id);
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{book.title}</Text>
    </TouchableOpacity>
  );
}

// ❌ Ruim - Lógica complexa dentro do JSX
export default function BookCard() {
  return (
    <TouchableOpacity 
      onPress={() => {
        // muita lógica aqui...
      }}
    >
      <Text>{/* complexo */}</Text>
    </TouchableOpacity>
  );
}
```

#### Importações
```javascript
// ✅ Bom - Ordenado
import React from 'react';
import { View, Text } from 'react-native';
import { useContext } from 'react';

import BookCard from './BookCard';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../constants/colors';

// ❌ Ruim - Desorganizado
import { colors } from '../constants/colors';
import BookCard from './BookCard';
import React, { useContext } from 'react';
import { View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Text } from 'react-native';
```

### 5. Commits Semânticos

Use prefixos para deixar claro o tipo de mudança:

```bash
# Feature nova
git commit -m "feat: adiciona filtro avançado na busca"

# Correção de bug
git commit -m "fix: corrige crash ao carregar livros"

# Melhoria de performance
git commit -m "perf: otimiza renderização de listas"

# Documentação
git commit -m "docs: atualiza README com novo processo"

# Refatoração (sem mudança de funcionalidade)
git commit -m "refactor: simplifica lógica de autenticação"

# Testes
git commit -m "test: adiciona testes para BookCard"

# Style (formatação, etc)
git commit -m "style: padroniza indentação"
```

### 6. Checklist Antes de Fazer PR

- [ ] Código segue os padrões do projeto
- [ ] Testou no navegador (web)
- [ ] Testou no Android (se tocou em componentes nativos)
- [ ] Testou no iOS (se tocou em componentes nativos)
- [ ] Não quebrou nenhuma feature existente
- [ ] Commit messages são claras
- [ ] README foi atualizado (se necessário)
- [ ] Sem logs de debug (`console.log()`)
- [ ] Sem código comentado deixado

### 7. Estrutura de Pastas ao Adicionar Features

Se adicionar uma feature grande, organize assim:

```
feature-name/
├── components/
│   └── FeatureComponent.jsx
├── screens/
│   └── FeatureScreen.jsx
├── context/
│   └── FeatureContext.jsx
└── utils/
    └── featureUtils.js
```

### 8. Atualizando Dependências

Se precisar adicionar uma nova dependência:

```bash
# Instale com npm
npm install nome-do-pacote

# Documente no README.md por que adicionou
# Teste em todas as plataformas

# Commit
git commit -m "chore: adiciona pacote-x para funcionalidade-y"
```

**⚠️ CUIDADO**: Não atualize dependências aleatoriamente. Sempre teste!

### 9. Dúvidas?

1. Verifique o código existente para ver como já foi feito
2. Leia os comentários nas funções
3. Procure documentação do React/React Native
4. Pergunte antes de fazer mudanças grandes

### 10. Boas Práticas

✅ **Faça:**
- Componentes pequenos e reutilizáveis
- Funções com responsabilidade única
- Comentários em lógica complexa
- Testes quando possível
- PRs com escopo pequeno

❌ **Não faça:**
- Commits gigantes com 100 mudanças
- Código comentado deixado no projeto
- Variáveis com nomes genéricos (`tmp`, `data2`, `x`)
- Modificações de múltiplas features em um PR
- Ignorar warnings do ESLint/TypeScript

---

## 📋 Estrutura do Projeto

Antes de mexer, entenda:

- **app/** - Rotas e telas (estrutura importa!)
- **components/** - Componentes reutilizáveis
- **context/** - Estado global (Context API)
- **data/** - Dados mockados
- **utils/** - Funções auxiliares
- **assets/** - Imagens e ícones

---

## 🔄 Processo de Review

Quando você abre um PR:

1. Alguém revisar o código
2. Podem pedir mudanças
3. Você faz as mudanças
4. Revisa novamente
5. Se aprovado, seu código entra no projeto! 🎉

---

## 📞 Contato

Questões sobre contribuição? Abra uma Discussion no repositório.

---

**Obrigado por contribuir! 🌟**

Seu esforço ajuda a tornar FIAP Finder melhor para todos!
