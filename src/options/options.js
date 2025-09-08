// Página de opções do Productivity Helper
// Gerencia configurações, estatísticas e dados da extensão

document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings()
  await loadStats()
  setupEventListeners()
})

// Elementos DOM
const floatingButtonCheckbox = document.getElementById("floatingButton")
const notificationsCheckbox = document.getElementById("notifications")
const contextMenuCheckbox = document.getElementById("contextMenu")
const exportDataBtn = document.getElementById("exportData")
const importDataBtn = document.getElementById("importData")
const clearDataBtn = document.getElementById("clearData")
const importFileInput = document.getElementById("importFile")

// Elementos de estatísticas
const linksCountEl = document.getElementById("linksCount")
const notesCountEl = document.getElementById("notesCount")
const tasksCountEl = document.getElementById("tasksCount")
const daysInstalledEl = document.getElementById("daysInstalled")

// Carrega configurações salvas
async function loadSettings() {
  try {
    const result = await window.chrome.storage.local.get([
      "floatingButtonEnabled",
      "notificationsEnabled",
      "contextMenuEnabled",
    ])

    // Define valores padrão se não existirem
    floatingButtonCheckbox.checked = result.floatingButtonEnabled !== false
    notificationsCheckbox.checked = result.notificationsEnabled !== false
    contextMenuCheckbox.checked = result.contextMenuEnabled !== false

    console.log("Configurações carregadas:", result)
  } catch (error) {
    console.error("Erro ao carregar configurações:", error)
  }
}

// Carrega estatísticas de uso
async function loadStats() {
  try {
    const stats = await window.chrome.runtime.sendMessage({ type: "GET_STATS" })

    if (stats && !stats.error) {
      linksCountEl.textContent = stats.linksCount || 0
      notesCountEl.textContent = stats.notesCount || 0
      tasksCountEl.textContent = stats.tasksCount || 0
      daysInstalledEl.textContent = stats.daysSinceInstall || 0
    }

    console.log("Estatísticas carregadas:", stats)
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error)
  }
}

// Configura event listeners
function setupEventListeners() {
  // Configurações
  floatingButtonCheckbox.addEventListener("change", saveSetting)
  notificationsCheckbox.addEventListener("change", saveSetting)
  contextMenuCheckbox.addEventListener("change", saveSetting)

  // Gerenciamento de dados
  exportDataBtn.addEventListener("click", exportData)
  importDataBtn.addEventListener("click", () => importFileInput.click())
  importFileInput.addEventListener("change", importData)
  clearDataBtn.addEventListener("click", clearAllData)
}

// Salva configuração individual
async function saveSetting(event) {
  const setting = event.target.id
  const value = event.target.checked

  try {
    const settingKey = `${setting}Enabled`
    await window.chrome.storage.local.set({ [settingKey]: value })

    console.log(`Configuração salva: ${settingKey} = ${value}`)
    showNotification(`Configuração "${getSettingLabel(setting)}" ${value ? "ativada" : "desativada"}!`)
  } catch (error) {
    console.error("Erro ao salvar configuração:", error)
    showNotification("Erro ao salvar configuração", "error")
  }
}

// Exporta todos os dados
async function exportData() {
  try {
    const result = await window.chrome.storage.local.get([
      "savedLinks",
      "savedNotes",
      "tasks",
      "installTime",
      "floatingButtonEnabled",
      "notificationsEnabled",
      "contextMenuEnabled",
    ])

    const exportData = {
      ...result,
      exportDate: new Date().toISOString(),
      version: window.chrome.runtime.getManifest().version,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `productivity-helper-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showNotification("Dados exportados com sucesso!")
    console.log("Dados exportados:", exportData)
  } catch (error) {
    console.error("Erro ao exportar dados:", error)
    showNotification("Erro ao exportar dados", "error")
  }
}

// Importa dados de arquivo
async function importData(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const importedData = JSON.parse(text)

    // Valida estrutura dos dados
    if (!validateImportData(importedData)) {
      showNotification("Arquivo de backup inválido", "error")
      return
    }

    // Confirma importação
    const confirmed = confirm(
      "Isso substituirá todos os dados atuais. Deseja continuar?\n\n" +
        `Links: ${(importedData.savedLinks || []).length}\n` +
        `Notas: ${(importedData.savedNotes || []).length}\n` +
        `Tarefas: ${(importedData.tasks || []).length}`,
    )

    if (!confirmed) return

    // Importa dados
    await window.chrome.storage.local.set({
      savedLinks: importedData.savedLinks || [],
      savedNotes: importedData.savedNotes || [],
      tasks: importedData.tasks || [],
      floatingButtonEnabled: importedData.floatingButtonEnabled !== false,
      notificationsEnabled: importedData.notificationsEnabled !== false,
      contextMenuEnabled: importedData.contextMenuEnabled !== false,
    })

    // Recarrega interface
    await loadSettings()
    await loadStats()

    showNotification("Dados importados com sucesso!")
    console.log("Dados importados:", importedData)
  } catch (error) {
    console.error("Erro ao importar dados:", error)
    showNotification("Erro ao importar dados. Verifique o arquivo.", "error")
  } finally {
    // Limpa input
    event.target.value = ""
  }
}

// Limpa todos os dados
async function clearAllData() {
  const confirmed = confirm(
    "Isso removerá TODOS os dados salvos (links, notas, tarefas e configurações).\n\n" +
      "Esta ação não pode ser desfeita. Deseja continuar?",
  )

  if (!confirmed) return

  try {
    await window.chrome.storage.local.clear()

    // Redefine configurações padrão
    await window.chrome.storage.local.set({
      installTime: Date.now(),
      version: window.chrome.runtime.getManifest().version,
      savedLinks: [],
      savedNotes: [],
      tasks: [],
      floatingButtonEnabled: true,
      notificationsEnabled: true,
      contextMenuEnabled: true,
    })

    // Recarrega interface
    await loadSettings()
    await loadStats()

    showNotification("Todos os dados foram removidos!")
    console.log("Dados limpos e reconfigurados")
  } catch (error) {
    console.error("Erro ao limpar dados:", error)
    showNotification("Erro ao limpar dados", "error")
  }
}

// Funções auxiliares

function validateImportData(data) {
  // Verifica se é um objeto válido
  if (!data || typeof data !== "object") return false

  // Verifica arrays opcionais
  const arrays = ["savedLinks", "savedNotes", "tasks"]
  for (const arr of arrays) {
    if (data[arr] && !Array.isArray(data[arr])) return false
  }

  return true
}

function getSettingLabel(settingId) {
  const labels = {
    floatingButton: "Botão flutuante",
    notifications: "Notificações",
    contextMenu: "Menu de contexto",
  }
  return labels[settingId] || settingId
}

function showNotification(message, type = "success") {
  // Remove notificação anterior
  const existing = document.getElementById("options-notification")
  if (existing) existing.remove()

  const notification = document.createElement("div")
  notification.id = "options-notification"
  notification.textContent = message

  // Estilos baseados no tipo
  const colors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
  }

  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: colors[type] || colors.success,
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    zIndex: "1000",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    animation: "slideIn 0.3s ease",
  })

  // Adiciona CSS de animação
  if (!document.getElementById("notification-styles")) {
    const styles = document.createElement("style")
    styles.id = "notification-styles"
    styles.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
      }
    `
    document.head.appendChild(styles)
  }

  document.body.appendChild(notification)

  // Remove após 3 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 3000)
}

// Atualiza estatísticas a cada 30 segundos
setInterval(loadStats, 30000)
