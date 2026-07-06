const buttons = document.querySelectorAll('.nav-btn');
const panels = document.querySelectorAll('.panel');

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.target;

    buttons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    panels.forEach((panel) => {
      panel.hidden = panel.id !== targetId;
      panel.classList.toggle('active', panel.id === targetId);
    });
  });
});
