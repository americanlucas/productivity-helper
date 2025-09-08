// Content Script para Productivity Helper
// Adiciona funcionalidades de captura rápida nas páginas web

;(() => {
  console.log("Productivity Helper Content Script carregado em:", window.location.href)

  // Configurações
  const CONFIG = {
    shortcutKey: "KeyS", // Ctrl+S para salvar link
    noteShortcutKey: "KeyN", // Ctrl+Shift+N para salvar seleção como nota
    showNotifications: true,
    floatingButtonEnabled: true,
  }

  // Estado
  let floatingButton = null
  let isInitialized = false
  const chrome = window.chrome // Declare the chrome variable

  // Inicialização
  function init() {
    if (isInitialized) return

    setupKeyboardShortcuts()
    createFloatingButton()
    setupSelectionHandler()

    isInitialized = true
    console.log("Content Script inicializado")
  }

  // Atalhos de teclado
  function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      // Ctrl+S - Salvar link atual
      if (event.ctrlKey && event.code === CONFIG.shortcutKey && !event.shiftKey) {
        event.preventDefault()
        saveCurrentPage()
      }

      // Ctrl+Shift+N - Salvar seleção como nota
      if (event.ctrlKey && event.shiftKey && event.code === CONFIG.noteShortcutKey) {
        event.preventDefault()
        saveSelectedText()
      }
    })
  }

  // Botão flutuante
  function createFloatingButton() {
    if (!CONFIG.floatingButtonEnabled || floatingButton) return

    floatingButton = document.createElement("div")
    floatingButton.id = "productivity-helper-float-btn"
    floatingButton.innerHTML = "💾"
    floatingButton.title = "Productivity Helper - Salvar página (Ctrl+S)"

    // Estilos do botão flutuante
    Object.assign(floatingButton.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      width: "50px",
      height: "50px",
      backgroundColor: "#3b82f6",
      color: "white",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "20px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      zIndex: "10000",
      transition: "all 0.3s ease",
      opacity: "0.8",
    })

    // Eventos do botão
    floatingButton.addEventListener("mouseenter", () => {
      floatingButton.style.opacity = "1"
      floatingButton.style.transform = "scale(1.1)"
    })

    floatingButton.addEventListener("mouseleave", () => {
      floatingButton.style.opacity = "0.8"
      floatingButton.style.transform = "scale(1)"
    })

    floatingButton.addEventListener("click", saveCurrentPage)

    // Adiciona à página
    document.body.appendChild(floatingButton)
  }

  // Gerenciador de seleção de texto
  function setupSelectionHandler() {
    let selectionTimeout

    document.addEventListener("mouseup", () => {
      clearTimeout(selectionTimeout)
      selectionTimeout = setTimeout(() => {
        const selection = window.getSelection()
        if (selection.toString().trim().length > 0) {
          showSelectionTooltip(selection)
        }
      }, 300)
    })
  }

  // Tooltip para seleção de texto
  function showSelectionTooltip(selection) {
    // Remove tooltip anterior se existir
    const existingTooltip = document.getElementById("productivity-helper-tooltip")
    if (existingTooltip) {
      existingTooltip.remove()
    }

    const selectedText = selection.toString().trim()
    if (selectedText.length < 10) return // Ignora seleções muito pequenas

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    const tooltip = document.createElement("div")
    tooltip.id = "productivity-helper-tooltip"
    tooltip.innerHTML = `
      <button id="save-selection-btn">💾 Salvar como nota</button>
    `

    // Estilos do tooltip
    Object.assign(tooltip.style, {
      position: "fixed",
      top: `${rect.top - 50}px`,
      left: `${rect.left}px`,
      backgroundColor: "#1f2937",
      color: "white",
      padding: "8px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      zIndex: "10001",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
      animation: "fadeIn 0.2s ease",
    })

    // Adiciona CSS de animação
    if (!document.getElementById("productivity-helper-styles")) {
      const styles = document.createElement("style")
      styles.id = "productivity-helper-styles"
      styles.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `
      document.head.appendChild(styles)
    }

    document.body.appendChild(tooltip)

    // Event listener para o botão
    document.getElementById("save-selection-btn").addEventListener("click", () => {
      saveSelectedText()
      tooltip.remove()
    })

    // Remove tooltip após 5 segundos ou ao clicar fora
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.remove()
      }
    }, 5000)

    document.addEventListener("click", function removeTooltip(e) {
      if (!tooltip.contains(e.target)) {
        tooltip.remove()
        document.removeEventListener("click", removeTooltip)
      }
    })
  }

  // Salvar página atual
  async function saveCurrentPage() {
    try {
      const linkData = {
        title: document.title,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }

      const response = await chrome.runtime.sendMessage({
        type: "SAVE_LINK",
        data: linkData,
      })

      if (response.success) {
        showNotification("Página salva!", "success")
      } else {
        showNotification("Erro ao salvar página", "error")
      }
    } catch (error) {
      console.error("Erro ao salvar página:", error)
      showNotification("Erro ao salvar página", "error")
    }
  }

  // Salvar texto selecionado
  async function saveSelectedText() {
    const selection = window.getSelection()
    const selectedText = selection.toString().trim()

    if (!selectedText) {
      showNotification("Nenhum texto selecionado", "warning")
      return
    }

    try {
      const noteData = {
        text: selectedText,
        url: window.location.href,
        pageTitle: document.title,
        timestamp: new Date().toISOString(),
      }

      const response = await chrome.runtime.sendMessage({
        type: "SAVE_NOTE",
        data: noteData,
      })

      if (response.success) {
        showNotification("Texto salvo como nota!", "success")
        selection.removeAllRanges() // Limpa a seleção
      } else {
        showNotification("Erro ao salvar nota", "error")
      }
    } catch (error) {
      console.error("Erro ao salvar texto:", error)
      showNotification("Erro ao salvar nota", "error")
    }
  }

  // Sistema de notificações
  function showNotification(message, type = "info") {
    if (!CONFIG.showNotifications) return

    // Remove notificação anterior se existir
    const existingNotification = document.getElementById("productivity-helper-notification")
    if (existingNotification) {
      existingNotification.remove()
    }

    const notification = document.createElement("div")
    notification.id = "productivity-helper-notification"
    notification.textContent = message

    // Cores baseadas no tipo
    const colors = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    }

    // Estilos da notificação
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: colors[type] || colors.info,
      color: "white",
      padding: "12px 20px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      zIndex: "10002",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
      animation: "slideDown 0.3s ease",
    })

    // Adiciona CSS de animação se não existir
    if (!document.getElementById("productivity-helper-notification-styles")) {
      const styles = document.createElement("style")
      styles.id = "productivity-helper-notification-styles"
      styles.textContent = `
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
      `
      document.head.appendChild(styles)
    }

    document.body.appendChild(notification)

    // Remove após 3 segundos
    setTimeout(() => {
      notification.style.animation = "slideUp 0.3s ease"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove()
        }
      }, 300)
    }, 3000)
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }

  // Cleanup ao descarregar a página
  window.addEventListener("beforeunload", () => {
    if (floatingButton && floatingButton.parentNode) {
      floatingButton.remove()
    }
  })
})()
