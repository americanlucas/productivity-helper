// Service Worker para Productivity Helper
// Gerencia eventos de instalação, mensagens e storage

// Import the chrome variable
const chrome = window.chrome

// Evento de instalação da extensão
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Productivity Helper instalado:", details.reason)

  // Inicializa dados padrão no storage
  chrome.storage.local.set({
    installTime: Date.now(),
    version: chrome.runtime.getManifest().version,
    savedLinks: [],
    savedNotes: [],
    tasks: [],
  })

  // Cria menu de contexto para salvar links rapidamente
  chrome.contextMenus.create({
    id: "saveLink",
    title: "Salvar link no Productivity Helper",
    contexts: ["link"],
  })

  chrome.contextMenus.create({
    id: "saveSelection",
    title: "Salvar seleção como nota",
    contexts: ["selection"],
  })
})

// Gerencia mensagens do popup e content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Mensagem recebida:", message)

  switch (message.type) {
    case "PING":
      // Responde ao ping do popup
      sendResponse({
        ok: true,
        time: new Date().toISOString(),
        version: chrome.runtime.getManifest().version,
      })
      break

    case "SAVE_LINK":
      // Salva link enviado pelo content script
      saveLinkFromMessage(message.data)
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ success: false, error: error.message }))
      return true // Mantém o canal aberto para resposta assíncrona

    case "SAVE_NOTE":
      // Salva nota enviada pelo content script
      saveNoteFromMessage(message.data)
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ success: false, error: error.message }))
      return true

    case "GET_STATS":
      // Retorna estatísticas de uso
      getUsageStats()
        .then((stats) => sendResponse(stats))
        .catch((error) => sendResponse({ error: error.message }))
      return true

    default:
      console.warn("Tipo de mensagem não reconhecido:", message.type)
      sendResponse({ error: "Tipo de mensagem não reconhecido" })
  }
})

// Gerencia cliques no menu de contexto
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    switch (info.menuItemId) {
      case "saveLink":
        await saveLinkFromContext(info, tab)
        break

      case "saveSelection":
        await saveSelectionAsNote(info, tab)
        break
    }
  } catch (error) {
    console.error("Erro no menu de contexto:", error)
  }
})

// Monitora mudanças no storage para logs
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log("Storage alterado:", namespace, changes)

  // Atualiza badge com número de itens salvos
  updateBadge()
})

// Gerencia eventos de tabs para funcionalidades futuras
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Pode ser usado para funcionalidades baseadas na tab ativa
  console.log("Tab ativa mudou:", activeInfo.tabId)
})

// Funções auxiliares

async function saveLinkFromMessage(linkData) {
  const result = await chrome.storage.local.get(["savedLinks"])
  const savedLinks = result.savedLinks || []

  const newLink = {
    id: Date.now(),
    title: linkData.title,
    url: linkData.url,
    timestamp: new Date().toISOString(),
    source: "content_script",
  }

  savedLinks.unshift(newLink)
  await chrome.storage.local.set({ savedLinks })

  console.log("Link salvo via mensagem:", newLink)
}

async function saveNoteFromMessage(noteData) {
  const result = await chrome.storage.local.get(["savedNotes"])
  const savedNotes = result.savedNotes || []

  const newNote = {
    id: Date.now(),
    text: noteData.text,
    url: noteData.url,
    timestamp: new Date().toISOString(),
    source: "content_script",
  }

  savedNotes.unshift(newNote)
  await chrome.storage.local.set({ savedNotes })

  console.log("Nota salva via mensagem:", newNote)
}

async function saveLinkFromContext(info, tab) {
  const result = await chrome.storage.local.get(["savedLinks"])
  const savedLinks = result.savedLinks || []

  const newLink = {
    id: Date.now(),
    title: info.linkText || tab.title,
    url: info.linkUrl,
    timestamp: new Date().toISOString(),
    source: "context_menu",
  }

  savedLinks.unshift(newLink)
  await chrome.storage.local.set({ savedLinks })

  // Mostra notificação
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.jpg",
    title: "Productivity Helper",
    message: "Link salvo com sucesso!",
  })

  console.log("Link salvo via menu de contexto:", newLink)
}

async function saveSelectionAsNote(info, tab) {
  const result = await chrome.storage.local.get(["savedNotes"])
  const savedNotes = result.savedNotes || []

  const newNote = {
    id: Date.now(),
    text: info.selectionText,
    url: tab.url,
    pageTitle: tab.title,
    timestamp: new Date().toISOString(),
    source: "context_menu",
  }

  savedNotes.unshift(newNote)
  await chrome.storage.local.set({ savedNotes })

  // Mostra notificação
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.jpg",
    title: "Productivity Helper",
    message: "Seleção salva como nota!",
  })

  console.log("Seleção salva como nota:", newNote)
}

async function getUsageStats() {
  const result = await chrome.storage.local.get(["savedLinks", "savedNotes", "tasks", "installTime"])

  return {
    linksCount: (result.savedLinks || []).length,
    notesCount: (result.savedNotes || []).length,
    tasksCount: (result.tasks || []).length,
    installTime: result.installTime,
    daysSinceInstall: Math.floor((Date.now() - result.installTime) / (1000 * 60 * 60 * 24)),
  }
}

async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(["savedLinks", "savedNotes", "tasks"])
    const totalItems = (result.savedLinks || []).length + (result.savedNotes || []).length + (result.tasks || []).length

    if (totalItems > 0) {
      chrome.action.setBadgeText({ text: totalItems.toString() })
      chrome.action.setBadgeBackgroundColor({ color: "#3b82f6" })
    } else {
      chrome.action.setBadgeText({ text: "" })
    }
  } catch (error) {
    console.error("Erro ao atualizar badge:", error)
  }
}

// Inicialização
console.log("Service Worker do Productivity Helper iniciado")
updateBadge()
