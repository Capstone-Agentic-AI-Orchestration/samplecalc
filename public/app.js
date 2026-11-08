(() => {
  const calculator = new globalThis.Calculator();
  const display = document.getElementById('display');
  const expression = document.getElementById('expression');
  const buttons = [...document.querySelectorAll('button[data-key]')];
  const operators = buttons.filter(button => ['+', '-', '*', '/'].includes(button.dataset.key));
  function render() {
    display.textContent = calculator.display;
    display.classList.toggle('error', calculator.error);
    expression.textContent = calculator.expression || 'Ready when you are';
    operators.forEach(button => button.setAttribute('aria-pressed', String(!calculator.error && button.dataset.key === calculator.operator)));
  }
  function input(key) {
    calculator.input(key);
    render();
  }
  render();
  buttons.forEach(button => button.addEventListener('click', () => input(button.dataset.key)));
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target.isContentEditable) return;
    // Let native Enter/Space activate a focused button exactly once.
    if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLButtonElement) return;
    const key = { Enter: '=', Escape: 'clear', Delete: 'clear', Backspace: 'backspace', ',': '.', x: '*', X: '*' }[event.key] || event.key;
    if (/^[0-9.+*/%=-]$/.test(key) || ['clear', 'backspace'].includes(key)) { event.preventDefault(); input(key); }
  });
})();
