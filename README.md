# Prumo Advisory — Discovery Session

Formulário preparatório para sessão estratégica de rebuilding.
Deploy em: `krflow.com.br/prumodiscovery`

---

## Deploy: GitHub + GoDaddy

### Passo 1 — Criar repositório no GitHub

1. Acesse github.com e crie um novo repositório (ex: `prumo-discovery`)
2. No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Prumo Advisory - Discovery Form v1.0"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/prumo-discovery.git
git push -u origin main
```

### Passo 2 — Instalar e fazer build

```bash
npm install
npm run build
```

Isso gera a pasta `dist/` com os arquivos estáticos prontos.

### Passo 3 — Upload para GoDaddy

1. Acesse o painel do GoDaddy → File Manager (ou acesse via FTP)
2. Navegue até a pasta raiz do site `krflow.com.br`
3. Crie uma pasta chamada `prumodiscovery`
4. Faça upload de TODO o conteúdo da pasta `dist/` para dentro de `prumodiscovery/`
   - index.html
   - assets/ (pasta com JS e CSS)

A estrutura no servidor deve ficar:
```
public_html/
  └── prumodiscovery/
      ├── index.html
      └── assets/
          ├── index-XXXXXX.js
          └── index-XXXXXX.css
```

### Passo 4 — Testar

Acesse: `https://krflow.com.br/prumodiscovery`

---

## Atualizações futuras

Quando quiser atualizar o formulário:

1. Edite os arquivos em `src/`
2. Rode `npm run build`
3. Suba o conteúdo da nova `dist/` para o GoDaddy (substituindo os arquivos anteriores)
4. Commit no GitHub para manter versionado

---

## Stack

- React 18 + Vite 6 + Tailwind CSS 4 + Recharts
- Build gera arquivos estáticos (HTML + JS + CSS) — não precisa de Node no servidor
