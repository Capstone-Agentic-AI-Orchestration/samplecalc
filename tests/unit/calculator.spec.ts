import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

interface Engine {
  display: string;
  expression: string;
  error: boolean;
  input(key: string): void;
}
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../../public/calculator.js'), 'utf8'), context);
const Calculator = vm.runInContext('Calculator', context) as new () => Engine;
function run(...keys: string[]): Engine {
  const calculator = new Calculator();
  keys.forEach(key => calculator.input(key));
  return calculator;
}

describe('calculator engine', () => {
  test.each([
    [['2', '+', '3', '='], '5'],
    [['9', '-', '4', '='], '5'],
    [['6', '*', '7', '='], '42'],
    [['8', '/', '2', '='], '4'],
    [['0', '.', '1', '+', '0', '.', '2', '='], '0.3'],
    [['2', '+', '3', '*', '4', '='], '20'],
    [['2', '+', '*', '3', '='], '6'],
    [['2', '+', '3', '=', '='], '8'],
    [['2', '+', '3', '=', '9'], '9'],
    [['2', '+', '3', '=', '*', '4', '='], '20'],
    [['.', '.', '5'], '0.5'],
    [['1', '2', 'backspace'], '1'],
    [['1', 'sign', 'backspace'], '0'],
    [['5', 'sign', '*', '2', '='], '-10'],
    [['5', '0', '%'], '0.5'],
    [['2', '+', '5', '0', '%', '='], '2.5'],
    [['9', '+', '2', 'clear', '3', '='], '3'],
  ])('handles %j', (keys, expected) => {
    expect(run(...keys).display).toBe(expected);
  });

  it('reports division by zero and recovers on clear or new input', () => {
    const calculator = run('8', '/', '0', '=');
    expect(calculator.error).toBe(true);
    expect(calculator.expression).toContain('Cannot divide by zero');
    calculator.input('+');
    expect(calculator.display).toBe('Error');
    calculator.input('7');
    expect(calculator.display).toBe('7');
    expect(calculator.error).toBe(false);
    expect(run('8', '/', '0', '=', 'clear').display).toBe('0');
    expect(run('8', '/', '0', '=', 'backspace').display).toBe('0');
  });

  it('limits input length and catches numeric overflow', () => {
    expect(run(...'123456789012345').display).toBe('123456789012');
    const calculator = run('9', '*', ...'999999999999', '=');
    for (let index = 0; index < 30; index++) calculator.input('=');
    expect(calculator.error).toBe(true);
    expect(calculator.expression).toContain('too large');
  });
});
