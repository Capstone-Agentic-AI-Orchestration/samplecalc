import { Calculator } from './calculator.js';

export const calculatorScript = `
const Calculator = ${Calculator.toString()};
const calculator = new Calculator();
const display = document.querySelector('#result');
const expression = document.querySelector('#expression');
function press(key) {
  calculator.input(key);
  display.textContent = calculator.display;
  expression.textContent = calculator.expression || 'Ready when you are';
  display.classList.toggle('error', calculator.error);
  document.querySelectorAll('[data-key]').forEach(button => {
    button.classList.toggle('selected', ['+','-','*','/'].includes(button.dataset.key) && calculator.expression.endsWith({'*':'×','/':'÷'}[button.dataset.key] || button.dataset.key));
  });
}
document.querySelectorAll('[data-key]').forEach(button => button.addEventListener('click', () => press(button.dataset.key)));
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target instanceof HTMLButtonElement && (event.key === 'Enter' || event.key === ' ')) return;
  const key = {Enter:'=',Escape:'clear',Delete:'clear',Backspace:'backspace',',':'.'}[event.key] || event.key;
  if (/^[0-9.+*/%=-]$/.test(key) || ['clear','backspace'].includes(key)) {
    event.preventDefault(); press(key);
  }
});
`;

const buttons = [
  ['clear', 'AC', 'Clear all', 'utility'], ['sign', '±', 'Change sign', 'utility'], ['%', '%', 'Percent', 'utility'], ['/', '÷', 'Divide', 'operator'],
  ['7', '7', '7', ''], ['8', '8', '8', ''], ['9', '9', '9', ''], ['*', '×', 'Multiply', 'operator'],
  ['4', '4', '4', ''], ['5', '5', '5', ''], ['6', '6', '6', ''], ['-', '−', 'Subtract', 'operator'],
  ['1', '1', '1', ''], ['2', '2', '2', ''], ['3', '3', '3', ''], ['+', '+', 'Add', 'operator'],
  ['backspace', '⌫', 'Backspace', 'utility'], ['0', '0', '0', ''], ['.', '.', 'Decimal point', ''], ['=', '=', 'Equals', 'equals'],
];

export const calculatorPage = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f4f2ec"><title>Calculator · samplecalc</title>
<style>
:root{color-scheme:light;--paper:#f4f2ec;--ink:#242c28;--muted:#5e6861;--accent:#284e3d;--key:#faf9f5}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:'Segoe UI',Arial,sans-serif;min-height:100svh}main{max-width:1000px;margin:auto;padding:52px 32px 28px}header{display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #d4d8cf;padding-bottom:20px}h1{font-size:24px;font-weight:600;letter-spacing:-.03em;margin:0}header span{font-size:13px;color:var(--muted)}.workspace{display:grid;grid-template-columns:1fr 374px;align-items:center;gap:64px;padding:56px 0}.intro h2{font-size:clamp(32px,4.8vw,52px);line-height:1.1;letter-spacing:-.035em;font-weight:500;margin:0 0 20px;max-width:8ch}.intro p{max-width:27ch;color:var(--muted);font-size:16px;line-height:1.6}.rule{width:40px;height:3px;background:var(--accent);margin:28px 0}.calculator{background:#e4e8de;border-radius:16px;padding:18px;box-shadow:0 18px 48px #26372a14}.screen{padding:20px 10px 24px;min-height:128px;text-align:right;display:flex;flex-direction:column;justify-content:flex-end}.expression{font-size:13px;color:#4f5e51;min-height:20px;overflow-wrap:anywhere;line-height:1.5}output{display:block;font-size:clamp(28px,6vw,42px);font-weight:500;font-variant-numeric:tabular-nums;line-height:1.4;letter-spacing:-.025em;overflow-wrap:anywhere}.error{color:#923b27}.keys{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}button{appearance:none;border:0;border-radius:10px;background:var(--key);color:var(--ink);height:62px;font:500 23px 'Segoe UI',Arial,sans-serif;cursor:pointer;transition:background .15s,transform .12s}button:hover{background:#fff}button:active{transform:translateY(2px);background:#d5dccc}button:focus-visible{outline:3px solid #a15323;outline-offset:3px}.utility{background:#d4dccd;font-size:19px}.operator{background:#c5d5c5;font-size:27px}.operator:hover,.operator.selected{background:#abc3ac}.equals{background:var(--accent);color:white}.equals:hover{background:#38654d}.hint{text-align:center;color:var(--muted);font-size:12px;margin:18px 0 0;line-height:1.7}footer{border-top:1px solid #d4d8cf;padding-top:18px;color:var(--muted);font-size:12px;display:flex;justify-content:space-between;gap:16px}kbd{font:inherit;border-bottom:1px solid #a4afa4;padding:0 2px}@media(max-width:700px){main{padding:24px 20px}.workspace{display:flex;flex-direction:column;gap:24px;padding:28px 0}.intro{width:100%;max-width:374px}.intro h2{font-size:30px;max-width:none;margin-bottom:8px}.intro p{max-width:none;font-size:14px;margin:0}.rule{display:none}.calculator{width:100%;max-width:374px}.screen{min-height:112px}footer{flex-wrap:wrap}header span{font-size:12px}}@media(max-width:360px){main{padding:20px 12px}.calculator{padding:12px}.keys{gap:7px}button{height:56px}}@media(prefers-reduced-motion:reduce){button{transition:none}}
</style></head><body><main><header><h1>Calculator</h1><span>samplecalc</span></header><section class="workspace" aria-label="Calculator workspace"><div class="intro"><h2>A little room<br>to work it out.</h2><p>Everyday numbers, without the clutter. Click a key or use your keyboard.</p><div class="rule"></div><p>Simple arithmetic. A clear head.</p></div><div><section class="calculator" aria-label="Basic calculator"><div class="screen" role="status" aria-live="polite" aria-atomic="true"><div id="expression" class="expression">Ready when you are</div><output id="result" aria-label="Result">0</output></div><div class="keys">${buttons.map(([key, label, name, style]) => `<button type="button" data-key="${key}" class="${style}" aria-label="${name}">${label}</button>`).join('')}</div></section><p class="hint"><kbd>Enter</kbd> equals · <kbd>Esc</kbd> clears · <kbd>⌫</kbd> deletes</p></div></section><footer><span>Made for the everyday calculation.</span><span>% divides the current number by 100.</span></footer></main><script src="/calculator.js" defer></script></body></html>`;
