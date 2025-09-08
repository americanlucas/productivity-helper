# Productivity Helper - Chrome Extension

Uma extensão completa para Google Chrome que aumenta sua produtividade com salvamento de links, anotações rápidas e gerenciamento de tarefas.

## 🎯 Objetivo

Esta extensão foi desenvolvida como parte do Bootcamp II, seguindo as melhores práticas do Manifest V3 do Chrome. O objetivo é fornecer uma ferramenta simples e eficaz para organizar informações e tarefas diretamente no navegador.

## ✨ Recursos Principais

- **💾 Salvamento de Links**: Salve páginas interessantes com um clique
- **📝 Anotações Rápidas**: Capture ideias e texto selecionado instantaneamente  
- **✅ Gerenciamento de Tarefas**: Organize suas atividades diárias
- **⚡ Atalhos de Teclado**: Trabalhe mais rápido com atalhos intuitivos
- **🎯 Menu de Contexto**: Salve conteúdo com clique direito
- **📊 Estatísticas**: Acompanhe seu uso e produtividade

## 🚀 Instalação

### Método 1: Download Direto
1. Baixe o arquivo ZIP da [página de releases](https://github.com/seu-usuario/productivity-helper/releases)
2. Extraia o conteúdo em uma pasta no seu computador
3. Abra o Chrome e vá para `chrome://extensions/`
4. Ative o "Modo do desenvolvedor" no canto superior direito
5. Clique em "Carregar sem compactação" e selecione a pasta extraída
6. A extensão aparecerá na barra de ferramentas

### Método 2: Clone do Repositório
```bash
git clone https://github.com/seu-usuario/productivity-helper.git
cd productivity-helper
```

Depois siga os passos 3-6 do método anterior.

## 📖 Como Usar

### Interface Principal
- Clique no ícone da extensão na barra de ferramentas
- Use as abas para navegar entre Links, Notas e Tarefas
- Cada seção permite adicionar, visualizar e gerenciar seus itens

### Atalhos de Teclado
- `Ctrl + S`: Salvar página atual
- `Ctrl + Shift + N`: Salvar texto selecionado como nota

### Menu de Contexto
- Clique direito em qualquer link → "Salvar link no Productivity Helper"
- Selecione texto e clique direito → "Salvar seleção como nota"

### Configurações
- Clique direito no ícone da extensão → "Opções"
- Configure notificações, botão flutuante e outras preferências
- Visualize estatísticas de uso
- Exporte/importe seus dados

## 🗂️ Estrutura do Projeto

```
productivity-helper/
├── src/
│   ├── popup/              # Interface principal (popup)
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── background/         # Service worker
│   │   └── service-worker.js
│   ├── content/           # Script injetado nas páginas
│   │   └── content.js
│   └── options/           # Página de configurações
│       ├── options.html
│       ├── options.css
│       └── options.js
├── icons/                 # Ícones da extensão
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── docs/                  # GitHub Pages (landing page)
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── manifest.json          # Configuração da extensão
├── README.md
└── LICENSE
```

## 🔧 Tecnologias Utilizadas

- **Manifest V3**: Versão mais recente do sistema de extensões do Chrome
- **Vanilla JavaScript**: Sem dependências externas para máxima compatibilidade
- **Chrome APIs**: Storage, Runtime, Tabs, ContextMenus, Notifications
- **HTML5 & CSS3**: Interface moderna e responsiva
- **GitHub Pages**: Landing page hospedada gratuitamente

## 📋 Requisitos Técnicos

- **Chrome 114+**: Compatível com versões recentes do Chrome
- **Manifest V3**: Segue as especificações mais atuais
- **Permissões Mínimas**: Princípio do menor privilégio
- **CSP Compatível**: Sem uso de `eval()` ou scripts inline
- **Sem Dependências**: Funciona sem bibliotecas externas

## 🛠️ Desenvolvimento

### Estrutura do Código

#### Popup (Interface Principal)
- **popup.html**: Estrutura da interface com abas
- **popup.css**: Estilos modernos e responsivos  
- **popup.js**: Lógica de interação e gerenciamento de dados

#### Service Worker (Background)
- **service-worker.js**: Gerencia eventos, storage e notificações
- Processa mensagens do popup e content scripts
- Mantém dados sincronizados entre componentes

#### Content Script
- **content.js**: Injetado em todas as páginas
- Adiciona botão flutuante e atalhos de teclado
- Captura seleções de texto e links

#### Página de Opções
- **options.html/css/js**: Interface de configurações
- Gerencia preferências do usuário
- Exibe estatísticas de uso
- Permite exportar/importar dados

### APIs Utilizadas

```javascript
// Storage API - Persistência de dados
chrome.storage.local.set({key: value});
chrome.storage.local.get(['key']);

// Runtime API - Comunicação entre componentes  
chrome.runtime.sendMessage({type: 'ACTION', data: {}});
chrome.runtime.onMessage.addListener(callback);

// Tabs API - Informações da aba ativa
chrome.tabs.query({active: true, currentWindow: true});

// Context Menus API - Menu do botão direito
chrome.contextMenus.create({id, title, contexts});

// Notifications API - Notificações do sistema
chrome.notifications.create({type, title, message});
```

## 📊 Funcionalidades Detalhadas

### Salvamento de Links
- Captura título e URL da página atual
- Organiza por data de salvamento
- Permite exclusão individual
- Abre links em nova aba

### Sistema de Notas
- Salva texto digitado ou selecionado
- Preserva formatação básica
- Inclui URL de origem quando aplicável
- Busca rápida por conteúdo

### Gerenciador de Tarefas
- Adiciona tarefas com timestamp
- Marca como concluída/pendente
- Remove tarefas individuais
- Contador visual de progresso

### Configurações Avançadas
- Toggle para botão flutuante
- Controle de notificações
- Ativação/desativação do menu de contexto
- Backup e restauração de dados

## 🎨 Design e UX

### Princípios de Design
- **Minimalista**: Interface limpa e focada
- **Consistente**: Padrões visuais uniformes
- **Acessível**: Contraste adequado e navegação por teclado
- **Responsivo**: Funciona em diferentes tamanhos de tela

### Paleta de Cores
- **Primária**: #3b82f6 (Azul)
- **Secundária**: #64748b (Cinza)
- **Sucesso**: #10b981 (Verde)
- **Erro**: #ef4444 (Vermelho)
- **Fundo**: #f8fafc (Cinza claro)

## 🔒 Segurança e Privacidade

- **Dados Locais**: Todas as informações ficam no dispositivo do usuário
- **Sem Telemetria**: Não coleta dados de uso ou pessoais
- **Permissões Mínimas**: Solicita apenas acessos necessários
- **CSP Rigoroso**: Previne execução de código malicioso

## 📈 Estatísticas e Métricas

A extensão rastreia localmente:
- Número de links salvos
- Quantidade de notas criadas  
- Total de tarefas gerenciadas
- Dias desde a instalação
- Frequência de uso por recurso

## 🚀 Roadmap Futuro

### Versão 1.1
- [ ] Sincronização com Google Drive
- [ ] Categorias para links e notas
- [ ] Busca avançada com filtros
- [ ] Temas personalizáveis

### Versão 1.2  
- [ ] Integração com calendário
- [ ] Lembretes e notificações programadas
- [ ] Exportação para diferentes formatos
- [ ] API para integrações externas

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes de Contribuição
- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário
- Mantenha commits pequenos e focados

## 🐛 Reportar Bugs

Encontrou um problema? [Abra uma issue](https://github.com/seu-usuario/productivity-helper/issues) com:

- Descrição detalhada do problema
- Passos para reproduzir
- Versão do Chrome e da extensão
- Screenshots se aplicável

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

Desenvolvido por [Seu Nome] como parte do Bootcamp II.

- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)
- Email: seu.email@exemplo.com

## 🙏 Agradecimentos

- Bootcamp II pela oportunidade de aprendizado
- Comunidade Chrome Extensions pela documentação
- Contribuidores e testadores da extensão

## 📚 Recursos Adicionais

- [Documentação Oficial Chrome Extensions](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension Samples](https://github.com/GoogleChrome/chrome-extensions-samples)

---

⭐ Se esta extensão foi útil para você, considere dar uma estrela no repositório!
