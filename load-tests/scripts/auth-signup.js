import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('signup_errors');
const signupDuration = new Trend('signup_duration');

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 2,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800'],
    signup_errors: ['rate<0.05'],
  },
};

export default function () {
  const uniqueId = `${__VU}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const payload = JSON.stringify({
    email: `loadtest_${uniqueId}@test.com`,
    password: 'TestP@ss123!',
    confirmPassword: 'TestP@ss123!',
    name: `Load Test User ${uniqueId}`,
  });

  const res = http.post(`${__ENV.API_URL}/api/v1/auth/signup`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  signupDuration.add(res.timings.duration);

  const success = check(res, {
    'status is 201 or 400': (r) => r.status === 201 || r.status === 400,
    'has response body': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
  }

  sleep(2);
}
