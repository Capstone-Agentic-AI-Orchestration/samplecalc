import { Calculator } from '../../src/calculator';

function calculate(...keys: string[]): Calculator {
  const calculator = new Calculator();
  keys.forEach(key => calculator.input(key));
  return calculator;
}

describe('Calculator', () => {
  it.each([
    [['1', '2', '+', '3', '='], '15'],
    [['9', '-', '1', '2', '='], '-3'],
    [['6', '*', '7', '='], '42'],
    [['9', '/', '4', '='], '2.25'],
    [['0', '.', '1', '+', '0', '.', '2', '='], '0.3'],
    [['2', '+', '3', '*', '4', '='], '20'],
    [['2', '+', '3', '=', '='], '8'],
    [['5', '+', '*', '2', '='], '10'],
  ])('evaluates %j as %s', (keys, expected) => {
    expect(calculate(...keys).display).toBe(expected);
  });

  it('accepts one decimal point and removes digits', () => {
    const calculator = calculate('1', '.', '.', '2', 'backspace');
    expect(calculator.display).toBe('1.');
    calculator.input('backspace');
    calculator.input('backspace');
    expect(calculator.display).toBe('0');
  });

  it('supports sign and percentage', () => {
    expect(calculate('5', '0', 'sign').display).toBe('-50');
    expect(calculate('5', '0', '%').display).toBe('0.5');
    expect(calculate('5', 'sign', '*', '2', '=').display).toBe('-10');
  });

  it('starts a fresh value after equals and resets pending calculations', () => {
    expect(calculate('2', '+', '3', '=', '7').display).toBe('7');
    const calculator = calculate('9', '+', 'clear', '2', '=');
    expect(calculator.display).toBe('2');
    expect(calculator.error).toBe(false);
  });

  it('handles division by zero and recovers on clear or fresh input', () => {
    const calculator = calculate('8', '/', '0', '=');
    expect(calculator.error).toBe(true);
    expect(calculator.display).not.toMatch(/Infinity|NaN/);
    calculator.input('clear');
    expect(calculator.display).toBe('0');
    expect(calculator.error).toBe(false);
    expect(calculate('8', '/', '0', '=', '4').display).toBe('4');
  });

  it('ignores unknown input', () => {
    expect(calculate('2', 'unrecognized').display).toBe('2');
  });
});

describe('Calculator numeric boundaries', () => {
  it('limits entry length without producing an invalid number', () => {
    const calculator = calculate(...'12345678901234567890');
    expect(calculator.display).toBe('123456789012345');
    expect(Number.isFinite(Number(calculator.display))).toBe(true);
  });

  it.each(['.', '7', 'backspace'])('keeps scientific results valid when editing with %s', key => {
    const calculator = calculate('0', '.', '0', '0', '0', '0', '0', '1', '%', key);
    expect(Number.isFinite(Number(calculator.display))).toBe(true);
    calculator.input('+');
    calculator.input('1');
    calculator.input('=');
    expect(calculator.error).toBe(false);
  });

  it('handles overflow without displaying Infinity or NaN', () => {
    const calculator = calculate(...'999999999999999', '*', ...'999999999999999', '=');
    for (let i = 0; i < 25; i++) calculator.input('=');
    expect(calculator.error).toBe(true);
    expect(calculator.display).toBe('Error');
  });
});

describe('Calculator pending operand editing', () => {
  it('starts a negative operand after an operator', () => {
    expect(calculate('2', '+', 'sign', '3', '=').display).toBe('-1');
  });

  it('chains a percentage operand before another operator', () => {
    expect(calculate('2', '+', '5', '0', '%', '+', '1', '=').display).toBe('3.5');
  });
});
