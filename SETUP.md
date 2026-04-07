# 🚀 Guia Rápido de Setup - FIAP Finder

## ⚡ Setup em 5 Minutos

### ⚠️ IMPORTANTE: ENTRE NA PASTA PRIMEIRO!

**ANTES de executar qualquer comando, você PRECISA estar dentro da pasta `fiap-finder`:**

```bash
cd "c:\wamp64\www\cp01 mobile\fiap-finder"
```

**Todos os comandos abaixo devem ser executados DENTRO dessa pasta!**

---

### Passo 1: Instalar Node.js (Se não tiver)
[Baixe aqui](https://nodejs.org/) e instale a versão LTS

Verifique se foi instalado:
```bash
node --version
npm --version
```

### Passo 2: Instalar Dependências

✅ **Se você já entrou na pasta** (Passo anterior), execute apenas:

```bash
npm install
```

⏳ Pode levar 2-3 minutos na primeira vez.

### Passo 3: Rodar o App

#### Opção 1: Na Web (Mais fácil para começar)
```bash
npm run web
```
O navegador abre automaticamente em `http://localhost:19006`

#### Opção 2: No Android
```bash
npm run android
```
Precisa de emulador Android aberto ou device conectado

#### Opção 3: No iOS
```bash
npm run ios
```
Só funciona em Mac com Xcode

---

## 📱 Plataformas Testadas

| Plataforma | Status | Requisitos |
|---|---|---|
| Web (Navegador) | ✅ Funciona | Nenhum |
| Android | ✅ Funciona | Emulador ou device |
| iOS | ✅ Funciona | Mac com Xcode |

---

## 🎯 Primeira Execução

1. Execute `npm run web`
2. Espere o app compilar (pode levar 30-60s)
3. O navegador abrirá automaticamente
4. Se vir a tela de login, está funcionando! 🎉

---

## 🔄 Recarregar o App

Durante desenvolvimento, o app recarrega automaticamente quando você salva arquivos.

Se não recarregar, aperte:
- `r` no terminal (hard refresh)
- Ou `Ctrl + Shift + R` no navegador

---

## 📁 Estrutura Básica

```
fiap-finder/
├── app/          ← Páginas e rotas
├── components/   ← Componentes reutilizáveis
├── context/      ← Estado global
├── data/         ← Dados de teste
└── assets/       ← Imagens e ícones
```

Para detalhes completos, veja [README.md](README.md)

---

## ✅ Checklist

- [ ] Node.js instalado
- [ ] `npm install` executado com sucesso
- [ ] `npm run web` rodando sem erros
- [ ] App aberto no navegador

Se tudo está marcado, **parabéns!** 🎉 Você está pronto para desenvolver.

---

## ❌ Problemas Comuns

| Problema | Solução |
|---|---|
| Porta ocupada | Mude: `npm start -- --port 19007` |
| Dependencies não instalam | Execute: `npm install --legacy-peer-deps` |
| Cache corrompido | Execute: `npm cache clean --force` |

Para mais problemas, veja a seção de Troubleshooting no [README.md](README.md#-troubleshooting).

---

## 🆘 Precisa de Ajuda?

1. Verifique [README.md](README.md)
2. Procure no console (F12) por mensagens de erro
3. Veja a documentação do [Expo](https://docs.expo.dev/)

**Bom desenvolvimento!** 🚀
