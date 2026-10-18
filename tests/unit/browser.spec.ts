import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createContext, runInContext } from 'node:vm';

class Element {
  textContent = '';
  isContentEditable = false;
  dataset: { key?: string } = {};
  attributes: Record<string, string> = {};
  listeners: Record<string, () => void> = {};
  classes = new Set<string>();
  classList = { toggle: (name: string, active: boolean) => active ? this.classes.add(name) : this.classes.delete(name) };
  setAttribute(name: string, value: string) { this.attributes[name] = value; }
  addEventListener(name: string, callback: () => void) { this.listeners[name] = callback; }
}
class Button extends Element {}
class Input extends Element {}
class TextArea extends Element {}

function setup() {
  const html = readFileSync(resolve('public/index.html'), 'utf8');
  const buttons = [...html.matchAll(/<button\b[^>]*data-key="([^"]+)"/g)].map(match => {
    const button = new Button(); button.dataset.key = match[1]; return button;
  });
  const display = new Element(); const expression = new Element();
  const listeners: Record<string, (event: Record<string, unknown>) => void> = {};
  const context = createContext({
    HTMLButtonElement: Button, HTMLInputElement: Input, HTMLTextAreaElement: TextArea,
    document: {
      getElementById: (id: string) => id === 'display' ? display : expression,
      querySelectorAll: () => buttons,
      addEventListener: (name: string, callback: (event: Record<string, unknown>) => void) => { listeners[name] = callback; }
    }
  });
  for (const file of ['calculator.js', 'app.js']) runInContext(readFileSync(resolve('public', file), 'utf8'), context);
  function click(key: string) { const button = buttons.find(item => item.dataset.key === key); expect(button).toBeDefined(); button!.listeners.click(); }
  function keyboard(key: string, properties = {}) {
    const preventDefault = jest.fn(); listeners.keydown({ key, target: new Element(), preventDefault, ...properties }); return preventDefault;
  }
  return { buttons, display, expression, click, keyboard };
}

describe('served calculator browser adapter', () => {
  it('wires real HTML buttons to calculation, pending operator and reset', () => {
    const ui = setup();
    expect(ui.buttons).toHaveLength(20);
    ui.click('7'); ui.click('+');
    expect(ui.buttons.find(button => button.dataset.key === '+')?.attributes['aria-pressed']).toBe('true');
    ui.click('8'); ui.click('=');
    expect(ui.display.textContent).toBe('15'); expect(ui.expression.textContent).toBe('7 + 8 =');
    ui.click('clear'); expect(ui.display.textContent).toBe('0'); expect(ui.expression.textContent).toBe('Ready when you are');
  });
  it('maps keyboard digits, decimal comma, multiply, backspace, enter and escape', () => {
    const ui = setup();
    for (const key of ['1', ',', '5', '9', 'Backspace', 'x', '2', 'Enter']) expect(ui.keyboard(key)).toHaveBeenCalled();
    expect(ui.display.textContent).toBe('3');
    ui.keyboard('Escape'); expect(ui.display.textContent).toBe('0');
  });
  it('shows division errors and recovers on number entry', () => {
    const ui = setup(); for (const key of ['9', '/', '0', '=']) ui.click(key);
    expect(ui.display.textContent).toBe('Error'); expect(ui.display.classes.has('error')).toBe(true);
    expect(ui.expression.textContent).toContain('Cannot divide by zero');
    ui.click('4'); expect(ui.display.textContent).toBe('4'); expect(ui.display.classes.has('error')).toBe(false);
  });
  it('does not intercept editing, shortcuts or native button activation', () => {
    const ui = setup();
    for (const properties of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { target: new Input() }, { target: new TextArea() }, { target: { isContentEditable: true } }]) expect(ui.keyboard('9', properties)).not.toHaveBeenCalled();
    expect(ui.keyboard('Enter', { target: new Button() })).not.toHaveBeenCalled();
    expect(ui.keyboard(' ', { target: new Button() })).not.toHaveBeenCalled();
    expect(ui.keyboard('Tab')).not.toHaveBeenCalled();
    ui.click('2'); expect(ui.display.textContent).toBe('2');
  });
});
