/* Shared by the browser and the engine tests; no expression evaluation. */
globalThis.Calculator = class Calculator {
  constructor() { this.clear(); }
  clear() {
    this.display = '0'; this.stored = null; this.operator = null;
    this.fresh = true; this.repeat = null; this.expression = ''; this.error = false;
  }
  value(number) {
    if (!Number.isFinite(number)) { this.display = 'Error'; this.expression = 'Result is too large. Clear or enter a number.'; this.error = true; return; }
    this.display = String(Number(number.toPrecision(12)));
  }
  calculate(left, operator, right) {
    if (operator === '/' && right === 0) { this.display = 'Error'; this.expression = 'Cannot divide by zero. Clear or enter a number.'; this.error = true; return; }
    this.value(operator === '+' ? left + right : operator === '-' ? left - right : operator === '*' ? left * right : left / right);
  }
  input(key) {
    if (key === 'clear') { this.clear(); return; }
    if (/^[0-9.]$/.test(key)) {
      if (this.error) this.clear();
      if (this.fresh || this.display.includes('e')) { this.display = key === '.' ? '0.' : key; this.fresh = false; if (!this.operator) { this.expression = ''; this.repeat = null; } }
      else if (key === '.' && !this.display.includes('.')) this.display += '.';
      else if (key !== '.' && this.display.replace(/[-.]/g, '').length < 12) this.display = this.display === '0' ? key : this.display === '-0' ? '-' + key : this.display + key;
      return;
    }
    if (this.error) { if (key === 'backspace') this.clear(); return; }
    if (key === 'backspace') {
      if (this.fresh) return;
      if (this.display.includes('e')) { this.display = '0'; return; }
      this.display = this.display.length > 1 ? this.display.slice(0, -1) : '0';
      if (this.display === '-') this.display = '0';
      return;
    }
    if (key === 'sign' || key === '%') {
      if (key === 'sign') this.display = this.display.startsWith('-') ? this.display.slice(1) : this.display === '0' ? '0' : '-' + this.display;
      else this.value(Number(this.display) / 100);
      this.fresh = false; this.repeat = null; return;
    }
    if (['+', '-', '*', '/'].includes(key)) {
      if (this.operator && !this.fresh) this.calculate(this.stored, this.operator, Number(this.display));
      if (this.error) return;
      this.stored = Number(this.display); this.operator = key; this.repeat = null; this.fresh = true;
      this.expression = this.display + ' ' + ({ '*': '×', '/': '÷', '-': '−', '+': '+' }[key]);
      return;
    }
    if (key === '=') {
      const operator = this.operator || this.repeat?.operator;
      if (!operator) return;
      const left = this.operator ? this.stored : Number(this.display);
      const right = this.operator ? Number(this.display) : this.repeat.right;
      this.calculate(left, operator, right);
      if (this.error) return;
      this.expression = left + ' ' + ({ '*': '×', '/': '÷', '-': '−', '+': '+' }[operator]) + ' ' + right + ' =';
      this.repeat = { operator, right }; this.operator = null; this.stored = null; this.fresh = true;
    }
  }
};

