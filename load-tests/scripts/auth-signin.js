import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('auth_errors');
const signinDuration = new Trend('signin_duration');

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 3,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    auth_errors: ['rate<0.05'],
    signin_duration: ['p(95)<400'],
  },
};

export default function () {
  const payload = JSON.stringify({
    email: `user${__VU}@loadtest.com`,
    password: 'TestP@ssword123!',
  });

  const res = http.post(`${__ENV.API_URL}/api/v1/auth/signin`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  signinDuration.add(res.timings.duration);

  const success = check(res, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'response has body': (r) => r.body !== null && r.body.length > 0,
  });

  if (!success) {
    errorRate.add(1);
  }

  sleep(1);
}
