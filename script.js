const STORAGE_KEY = 'ssyn-roster-v1';
const navItems = document.querySelectorAll('.nav-item');
const mobileToggle = document.getElementById('mobileToggle');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const rosterBody = document.getElementById('rosterBody');
const rosterSearch = document.getElementById('rosterSearch');
const sortButton = document.getElementById('sortButton');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerModal = document.getElementById('playerModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelPlayerBtn = document.getElementById('cancelPlayerBtn');
const playerForm = document.getElementById('playerForm');
const playerModalTitle = document.getElementById('playerModalTitle');

let players = loadPlayers();
let editingId = null;
let sortMode = 'name';

function loadPlayers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePlayers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

function showPage(pageId) {
  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  if (window.innerWidth <= 960) {
    closeSidebar();
  }
}

function openSidebar() {
  sidebar?.classList.add('open');
  sidebarBackdrop.hidden = false;
  mobileToggle.setAttribute('aria-expanded', 'true');
  document.body.classList.add('modal-open');
}

function closeSidebar() {
  sidebar?.classList.remove('open');
  sidebarBackdrop.hidden = true;
  mobileToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('modal-open');
}

function getSortLabel(mode) {
  if (mode === 'rank') return 'Rank';
  if (mode === 'thp') return 'THP';
  return 'Name';
}

function renderRoster() {
  if (!rosterBody) {
    return;
  }

  const query = (rosterSearch?.value || '').trim().toLowerCase();

  const filteredPlayers = players
    .filter((player) => `${player.name}`.toLowerCase().includes(query))
    .sort((a, b) => {
      if (sortMode === 'rank') {
        return a.rank.localeCompare(b.rank);
      }
      if (sortMode === 'thp') {
        return b.thp - a.thp;
      }
      return a.name.localeCompare(b.name);
    });

  if (sortButton) {
    sortButton.textContent = `Sort: ${getSortLabel(sortMode)}`;
  }

  if (!filteredPlayers.length) {
    rosterBody.innerHTML = `
      <div class="empty-state">No players matched the current search. Add one to build the roster.</div>
    `;
    return;
  }

  rosterBody.innerHTML = filteredPlayers
    .map(
      (player) => `
        <button class="roster-card" type="button" data-action="edit" data-id="${player.id}" aria-label="Edit ${player.name}">
          <span class="roster-card__content">
            <span class="roster-card__name">${player.name}</span>
            <span class="roster-card__meta">
              <span class="rank-badge">${player.rank}</span>
              <span class="thp-value">THP ${player.thp.toFixed(1)}</span>
            </span>
          </span>
          <span class="roster-card__icon" aria-hidden="true">✎</span>
        </button>
      `
    )
    .join('');
}

function toggleSort() {
  const modes = ['name', 'rank', 'thp'];
  const currentIndex = modes.indexOf(sortMode);
  sortMode = modes[(currentIndex + 1) % modes.length];
  renderRoster();
}

function openPlayerModal(playerId = null) {
  editingId = playerId;

  if (playerId) {
    const player = players.find((entry) => entry.id === playerId);
    if (!player) {
      return;
    }

    playerModalTitle.textContent = 'Edit Player';
    playerForm.elements.name.value = player.name;
    playerForm.elements.rank.value = player.rank;
    playerForm.elements.thp.value = player.thp;
  } else {
    playerModalTitle.textContent = 'Add Player';
    playerForm.reset();
  }

  playerModal.hidden = false;
  document.body.classList.add('modal-open');
}

function closePlayerModal() {
  editingId = null;
  playerModal.hidden = true;
  document.body.classList.remove('modal-open');
  playerForm.reset();
}

function handlePlayerSubmit(event) {
  event.preventDefault();

  const data = new FormData(playerForm);
  const nextPlayer = {
    id: editingId || Date.now(),
    name: data.get('name').toString().trim(),
    rank: data.get('rank').toString().trim(),
    thp: Number(data.get('thp')),
  };

  if (!nextPlayer.name || !nextPlayer.rank || Number.isNaN(nextPlayer.thp)) {
    return;
  }

  if (editingId) {
    players = players.map((player) => (player.id === editingId ? { ...player, ...nextPlayer } : player));
  } else {
    players = [nextPlayer, ...players];
  }

  savePlayers();
  renderRoster();
  closePlayerModal();
}

function handleRosterAction(event) {
  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton) {
    return;
  }

  const playerId = Number(actionButton.dataset.id);
  openPlayerModal(playerId);
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    showPage(item.dataset.page);
  });
});

mobileToggle?.addEventListener('click', () => {
  if (sidebar.classList.contains('open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

sidebarBackdrop?.addEventListener('click', closeSidebar);
addPlayerBtn?.addEventListener('click', () => openPlayerModal());
sortButton?.addEventListener('click', toggleSort);
closeModalBtn?.addEventListener('click', closePlayerModal);
cancelPlayerBtn?.addEventListener('click', closePlayerModal);
playerForm?.addEventListener('submit', handlePlayerSubmit);
rosterBody?.addEventListener('click', handleRosterAction);

if (rosterSearch) {
  rosterSearch.addEventListener('input', renderRoster);
}

playerModal?.addEventListener('click', (event) => {
  if (event.target === playerModal) {
    closePlayerModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !playerModal.hidden) {
    closePlayerModal();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 960) {
    closeSidebar();
  }
});

showPage('roster');
renderRoster();
