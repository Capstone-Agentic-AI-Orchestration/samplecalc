import request from 'supertest';
import { runInNewContext } from 'node:vm';
import { app } from '../../src/app';

type KeyEvent = { key: string; target?: object; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; isComposing?: boolean; preventDefault: jest.Mock };

class Button {
  dataset: { key: string };
  classList = { toggle: jest.fn() };
  click: (() => void) | undefined;
  constructor(key: string) { this.dataset = { key }; }
  addEventListener(_name: string, handler: () => void) { this.click = handler; }
}

async function browser() {
  const page = await request(app).get('/');
  expect(page.status).toBe(200);
  expect(page.type).toBe('text/html');
  expect(page.text).toContain('aria-live="polite"');
  expect(page.text).toContain('src="/calculator.js"');
  const buttons = [...page.text.matchAll(/data-key="([^"]+)"/g)].map(match => new Button(match[1]));
  expect(buttons).toHaveLength(20);
  const result = { textContent: '0', classList: { toggle: jest.fn() } };
  const expression = { textContent: '' };
  let keydown: (event: KeyEvent) => void = () => { throw new Error('Keyboard handler missing'); };
  const script = await request(app).get('/calculator.js');
  expect(script.status).toBe(200);
  expect(script.type).toMatch(/javascript/);
  runInNewContext(script.text, {
    HTMLButtonElement: Button,
    document: {
      querySelector: (selector: string) => selector === '#result' ? result : expression,
      querySelectorAll: () => buttons,
      addEventListener: (_name: string, handler: typeof keydown) => { keydown = handler; },
    },
  });
  return {
    result, expression, buttons,
    click: (key: string) => buttons.find(button => button.dataset.key === key)?.click?.(),
    key: (key: string, extra: Partial<KeyEvent> = {}) => {
      const event = { key, preventDefault: jest.fn(), ...extra };
      keydown(event);
      return event;
    },
  };
}

describe('Calculator browser integration', () => {
  it('serves working button handlers and updates the accessible result', async () => {
    const ui = await browser();
    ['6', '*', '7', '='].forEach(ui.click);
    expect(ui.result.textContent).toBe('42');
    expect(ui.expression.textContent).toContain('=');
    ui.click('clear');
    ['8', '/', '0', '='].forEach(ui.click);
    expect(ui.result.textContent).toBe('Error');
    expect(ui.result.classList.toggle).toHaveBeenLastCalledWith('error', true);
    ui.click('clear');
    expect(ui.result.textContent).toBe('0');
  });

  it('maps keyboard arithmetic, decimals, deletion and reset', async () => {
    const ui = await browser();
    ['1', ',', '5', '+', '2', 'Enter'].forEach(key => ui.key(key));
    expect(ui.result.textContent).toBe('3.5');
    ui.key('Escape');
    ['1', '2', 'Backspace'].forEach(key => ui.key(key));
    expect(ui.result.textContent).toBe('1');
    expect(ui.key('Delete').preventDefault).toHaveBeenCalled();
    expect(ui.result.textContent).toBe('0');
    expect(ui.key('q').preventDefault).not.toHaveBeenCalled();
    ui.key('9', { ctrlKey: true });
    expect(ui.result.textContent).toBe('0');
  });

  it('leaves focused button activation to the browser without double execution', async () => {
    const ui = await browser();
    ['2', '+', '3', '='].forEach(ui.click);
    expect(ui.key('Enter', { target: ui.buttons[0] }).preventDefault).not.toHaveBeenCalled();
    expect(ui.result.textContent).toBe('5');
  });
});


describe('Calculator keyboard accessibility', () => {
  it('supports sign changes without moving focus to the sign button', async () => {
    const ui = await browser();
    ['2', '+', 'F9', '3', 'Enter'].forEach(key => ui.key(key));
    expect(ui.result.textContent).toBe('-1');
    expect(ui.key('F9').preventDefault).toHaveBeenCalled();
  });

  it('preserves text editing, composition and browser shortcuts', async () => {
    const ui = await browser();
    for (const target of [
      { isContentEditable: true },
      { closest: () => ({ tagName: 'INPUT' }) },
    ]) {
      expect(ui.key('9', { target }).preventDefault).not.toHaveBeenCalled();
    }
    for (const extra of [{ isComposing: true }, { metaKey: true }, { altKey: true }]) {
      expect(ui.key('9', extra).preventDefault).not.toHaveBeenCalled();
    }
    expect(ui.result.textContent).toBe('0');
  });

  it('serves instructions and a JavaScript-disabled recovery message', async () => {
    const page = await request(app).get('/');
    expect(page.text).toContain('aria-describedby="calculator-help"');
    expect(page.text).toContain('aria-keyshortcuts="F9"');
    expect(page.text).toContain('<noscript>');
    expect(page.text).toContain('Operations run left to right.');
  });
});
