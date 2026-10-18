/** Immediate-execution calculator shared by the browser and unit tests. */
export class Calculator {
  display = '0';
  expression = '';
  error = false;
  private stored: number | null = null;
  private operator = '';
  private fresh = false;
  private computed = false;
  private repeatOperator = '';
  private repeatValue = 0;

  private format(value: number): string {
    return String(Number(value.toPrecision(12)));
  }

  private calculate(left: number, right: number, operator: string): number {
    switch (operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return right === 0 ? NaN : left / right;
      default: return right;
    }
  }

  private result(value: number): boolean {
    if (!Number.isFinite(value)) {
      this.display = 'Error';
      this.expression = 'Cannot divide by zero or show this result. Press AC to reset.';
      this.error = true;
      this.stored = null;
      this.operator = '';
      this.repeatOperator = '';
      return false;
    }
    this.display = this.format(value);
    this.computed = true;
    return true;
  }

  input(key: string): void {
    if (key === 'clear') {
      this.display = '0'; this.expression = ''; this.error = false;
      this.stored = null; this.operator = ''; this.fresh = false; this.computed = false;
      this.repeatOperator = ''; this.repeatValue = 0;
      return;
    }
    if (this.error) {
      if (/^[0-9.]$/.test(key)) this.input('clear');
      else return;
    }
    if (/^[0-9.]$/.test(key)) {
      if (this.fresh || this.computed) {
        this.display = '0'; this.fresh = false; this.computed = false;
        if (!this.operator) this.expression = '';
      }
      this.repeatOperator = '';
      if (key === '.') {
        if (!this.display.includes('.')) this.display += '.';
      } else if (this.display.replace(/[-.]/g, '').length < 15) {
        this.display = this.display === '0' ? key : this.display === '-0' ? '-' + key : this.display + key;
      }
      return;
    }
    if (key === 'sign') {
      if (this.fresh && this.operator) {
        this.display = '0'; this.fresh = false; this.computed = false;
      }
      this.display = this.display.startsWith('-') ? this.display.slice(1) : '-' + this.display;
      this.computed = this.computed || /e/i.test(this.display);
      return;
    }
    if (key === '%') {
      this.result(Number(this.display) / 100);
      this.fresh = false;
      return;
    }
    if (key === 'backspace') {
      if (this.fresh || this.computed) return;
      this.display = this.display.slice(0, -1);
      if (!this.display || this.display === '-') this.display = '0';
      return;
    }
    if (['+', '-', '*', '/'].includes(key)) {
      if (this.operator && !this.fresh && this.stored !== null) {
        if (!this.result(this.calculate(this.stored, Number(this.display), this.operator))) return;
      }
      this.stored = Number(this.display);
      this.operator = key;
      this.expression = this.display + ' ' + ({ '*': '×', '/': '÷' }[key] ?? key);
      this.fresh = true;
      this.repeatOperator = '';
      return;
    }
    if (key === '=') {
      const op = this.operator || this.repeatOperator;
      if (!op) return;
      const left = this.operator ? this.stored! : Number(this.display);
      const right = this.operator ? Number(this.display) : this.repeatValue;
      this.expression = this.format(left) + ' ' + ({ '*': '×', '/': '÷' }[op] ?? op) + ' ' + this.format(right) + ' =';
      if (!this.result(this.calculate(left, right, op))) return;
      this.repeatOperator = op; this.repeatValue = right;
      this.operator = ''; this.stored = null; this.fresh = true;
    }
  }
}
