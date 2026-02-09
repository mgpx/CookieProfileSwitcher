# Cookie Profile Switcher

## English

### Install (Developer Mode)
This version is not published in the Web Store. To install:
1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the project folder.
4. Pin the extension and open any site to use the popup.

### Overview
Cookie Profile Switcher lets you manage multiple cookie sessions for the same site without logging out and logging back in. Create profiles per domain and switch between them instantly.

### What Changed in 2.0
- Refreshed UI for the options page and popup.
- Added domain-focused profile management in Options.
- Added actions to clone and save cookies from the current profile.
- Updated bundled libraries to current non-minified versions.

### How It Works
The extension uses the browser cookie and storage APIs. Profiles are stored in `chrome.storage.local`. When you switch profiles, cookies from the active site are saved to the previous profile and cookies from the selected profile are loaded into the browser.

### Project Origin
This project is based on the original open-source extension by Emery Steele.

Source:
```
https://github.com/emerysteele/CookieProfileSwitcher
```

Contact:
```
emerysteele@gmail.com
```

### License
GNU General Public License v3.0.

### Dependencies
- jQuery
- Bootstrap
- Font Awesome
- Showdown

## Português

### Instalação (Modo Desenvolvedor)
Esta versão não está publicada na Web Store. Para instalar:
1. Abra `chrome://extensions` (ou `edge://extensions`).
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione a pasta do projeto.
4. Fixe a extensão e abra qualquer site para usar o popup.

### Visão Geral
O Cookie Profile Switcher permite gerenciar múltiplas sessões de cookies no mesmo site sem precisar sair e entrar novamente. Crie perfis por domínio e alterne entre eles rapidamente.

### O que mudou na versão 2.0
- UI renovada para a página de opções e o popup.
- Gerenciamento de perfis por domínio nas opções.
- Ações para clonar e salvar cookies do perfil atual.
- Bibliotecas atualizadas para versões atuais sem minificação.

### Como Funciona
A extensão usa as APIs de cookies e armazenamento do navegador. Os perfis ficam no `chrome.storage.local`. Ao trocar de perfil, os cookies do site ativo são salvos no perfil anterior e os cookies do perfil escolhido são carregados no navegador.

### Origem do Projeto
Este projeto é baseado na extensão open-source original de Emery Steele.

Fonte:
```
https://github.com/emerysteele/CookieProfileSwitcher
```

Contato:
```
emerysteele@gmail.com
```

### Licença
GNU General Public License v3.0.

### Dependências
- jQuery
- Bootstrap
- Font Awesome
- Showdown
