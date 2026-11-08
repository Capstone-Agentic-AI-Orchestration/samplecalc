import request from 'supertest';
import { app } from '../../src/app.js';

describe('calculator web application', () => {
  it('serves the accessible calculator at the root', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
    expect(response.text).toContain('<title>Calculator');
    expect(response.text).toContain('aria-live="polite"');
    expect(response.text.match(/data-key=/g)).toHaveLength(20);
  });

  test.each(['/calculator.js', '/app.js', '/styles.css'])('serves %s', async asset => {
    const response = await request(app).get(asset);
    expect(response.status).toBe(200);
    expect(response.text.length).toBeGreaterThan(100);
  });
});
