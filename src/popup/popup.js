// Elementos DOM
const tabBtns = document.querySelectorAll(".tab-btn")
const tabContents = document.querySelectorAll(".tab-content")
const saveCurrentLinkBtn = document.getElementById("saveCurrentLink")
const savedLinksContainer = document.getElementById("savedLinks")
const quickNoteTextarea = document.getElementById("quickNote")
const saveNoteBtn = document.getElementById("saveNote")
const savedNotesContainer = document.getElementById("savedNotes")
const newTaskInput = document.getElementById("newTask")
const addTaskBtn = document.getElementById("addTask")
const tasksListContainer = document.getElementById("tasksList")
const pingBackgroundBtn = document.getElementById("pingBackground")
const statusSpan = document.getElementById("status")

// Gerenciamento de tabs
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetTab = btn.dataset.tab

    // Remove active de todos os botões e conteúdos
    tabBtns.forEach((b) => b.classList.remove("active"))
    tabContents.forEach((c) => c.classList.remove("active"))

    // Adiciona active ao botão e conteúdo clicado
    btn.classList.add("active")
    document.getElementById(targetTab).classList.add("active")
  })
})

// Salvar link atual
saveCurrentLinkBtn.addEventListener("click", async () => {
  try {
    const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true })
    const link = {
      id: Date.now(),
      title: tab.title,
      url: tab.url,
      timestamp: new Date().toISOString(),
    }

    const result = await window.chrome.storage.local.get(["savedLinks"])
    const savedLinks = result.savedLinks || []
    savedLinks.unshift(link)

    await window.chrome.storage.local.set({ savedLinks })
    displayLinks()
    showStatus("Link salvo!", "success")
  } catch (error) {
    console.error("Erro ao salvar link:", error)
    showStatus("Erro ao salvar link", "error")
  }
})

// Salvar nota
saveNoteBtn.addEventListener("click", async () => {
  const noteText = quickNoteTextarea.value.trim()
  if (!noteText) return

  try {
    const note = {
      id: Date.now(),
      text: noteText,
      timestamp: new Date().toISOString(),
    }

    const result = await window.chrome.storage.local.get(["savedNotes"])
    const savedNotes = result.savedNotes || []
    savedNotes.unshift(note)

    await window.chrome.storage.local.set({ savedNotes })
    quickNoteTextarea.value = ""
    displayNotes()
    showStatus("Nota salva!", "success")
  } catch (error) {
    console.error("Erro ao salvar nota:", error)
    showStatus("Erro ao salvar nota", "error")
  }
})

// Adicionar tarefa
addTaskBtn.addEventListener("click", addTask)
newTaskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask()
})

async function addTask() {
  const taskText = newTaskInput.value.trim()
  if (!taskText) return

  try {
    const task = {
      id: Date.now(),
      text: taskText,
      completed: false,
      timestamp: new Date().toISOString(),
    }

    const result = await window.chrome.storage.local.get(["tasks"])
    const tasks = result.tasks || []
    tasks.unshift(task)

    await window.chrome.storage.local.set({ tasks })
    newTaskInput.value = ""
    displayTasks()
    showStatus("Tarefa adicionada!", "success")
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error)
    showStatus("Erro ao adicionar tarefa", "error")
  }
}

// Ping background
pingBackgroundBtn.addEventListener("click", async () => {
  try {
    const response = await window.chrome.runtime.sendMessage({ type: "PING" })
    showStatus(`Pong! ${response.time}`, "success")
  } catch (error) {
    console.error("Erro ao fazer ping:", error)
    showStatus("Erro no ping", "error")
  }
})

// Funções de exibição
async function displayLinks() {
  try {
    const result = await window.chrome.storage.local.get(["savedLinks"])
    const savedLinks = result.savedLinks || []

    if (savedLinks.length === 0) {
      savedLinksContainer.innerHTML = '<div class="empty-state">Nenhum link salvo ainda</div>'
      return
    }

    savedLinksContainer.innerHTML = savedLinks
      .map(
        (link) => `
      <div class="link-item">
        <div class="link-title">${escapeHtml(link.title)}</div>
        <a href="${link.url}" class="link-url" target="_blank">${escapeHtml(link.url)}</a>
        <div class="link-actions">
          <button class="btn btn-danger" onclick="deleteLink(${link.id})">🗑️ Excluir</button>
        </div>
      </div>
    `,
      )
      .join("")
  } catch (error) {
    console.error("Erro ao exibir links:", error)
  }
}

async function displayNotes() {
  try {
    const result = await window.chrome.storage.local.get(["savedNotes"])
    const savedNotes = result.savedNotes || []

    if (savedNotes.length === 0) {
      savedNotesContainer.innerHTML = '<div class="empty-state">Nenhuma nota salva ainda</div>'
      return
    }

    savedNotesContainer.innerHTML = savedNotes
      .map(
        (note) => `
      <div class="note-item">
        ${escapeHtml(note.text)}
        <div class="note-actions">
          <button class="btn btn-danger" onclick="deleteNote(${note.id})">🗑️ Excluir</button>
        </div>
      </div>
    `,
      )
      .join("")
  } catch (error) {
    console.error("Erro ao exibir notas:", error)
  }
}

async function displayTasks() {
  try {
    const result = await window.chrome.storage.local.get(["tasks"])
    const tasks = result.tasks || []

    if (tasks.length === 0) {
      tasksListContainer.innerHTML = '<div class="empty-state">Nenhuma tarefa adicionada ainda</div>'
      return
    }

    tasksListContainer.innerHTML = tasks
      .map(
        (task) => `
      <div class="task-item">
        <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} 
               onchange="toggleTask(${task.id})">
        <span class="task-text ${task.completed ? "completed" : ""}">${escapeHtml(task.text)}</span>
        <button class="btn btn-danger" onclick="deleteTask(${task.id})">🗑️</button>
      </div>
    `,
      )
      .join("")
  } catch (error) {
    console.error("Erro ao exibir tarefas:", error)
  }
}

// Funções de exclusão e toggle
window.deleteLink = async (id) => {
  try {
    const result = await window.chrome.storage.local.get(["savedLinks"])
    const savedLinks = result.savedLinks || []
    const updatedLinks = savedLinks.filter((link) => link.id !== id)
    await window.chrome.storage.local.set({ savedLinks: updatedLinks })
    displayLinks()
    showStatus("Link excluído!", "success")
  } catch (error) {
    console.error("Erro ao excluir link:", error)
  }
}

window.deleteNote = async (id) => {
  try {
    const result = await window.chrome.storage.local.get(["savedNotes"])
    const savedNotes = result.savedNotes || []
    const updatedNotes = savedNotes.filter((note) => note.id !== id)
    await window.chrome.storage.local.set({ savedNotes: updatedNotes })
    displayNotes()
    showStatus("Nota excluída!", "success")
  } catch (error) {
    console.error("Erro ao excluir nota:", error)
  }
}

window.deleteTask = async (id) => {
  try {
    const result = await window.chrome.storage.local.get(["tasks"])
    const tasks = result.tasks || []
    const updatedTasks = tasks.filter((task) => task.id !== id)
    await window.chrome.storage.local.set({ tasks: updatedTasks })
    displayTasks()
    showStatus("Tarefa excluída!", "success")
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error)
  }
}

window.toggleTask = async (id) => {
  try {
    const result = await window.chrome.storage.local.get(["tasks"])
    const tasks = result.tasks || []
    const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    await window.chrome.storage.local.set({ tasks: updatedTasks })
    displayTasks()
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error)
  }
}

// Funções utilitárias
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

function showStatus(message, type) {
  statusSpan.textContent = message
  statusSpan.className = `status ${type}`
  setTimeout(() => {
    statusSpan.textContent = ""
    statusSpan.className = "status"
  }, 3000)
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  displayLinks()
  displayNotes()
  displayTasks()
})
