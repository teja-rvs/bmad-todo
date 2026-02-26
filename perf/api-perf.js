import http from 'k6/http';
import { check, group, sleep } from 'k6';

const API_URL = __ENV.API_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    api_perf: {
      executor: 'shared-iterations',
      vus: 3,
      iterations: 50,
      maxDuration: '60s',
    },
  },
  thresholds: {
    'http_req_duration{name:GET /tasks}': ['p(95)<200'],
    'http_req_duration{name:POST /tasks}': ['p(95)<200'],
    'http_req_duration{name:PATCH /tasks/:id}': ['p(95)<200'],
  },
};

const JSON_HEADERS = { headers: { 'Content-Type': 'application/json' } };
const SEED_PREFIX = 'perf-seed-';
const ITER_PREFIX = 'perf-iter-';

export function setup() {
  const healthRes = http.get(`${API_URL}/up`);
  if (
    !check(healthRes, { 'API is reachable (GET /up)': (r) => r.status === 200 })
  ) {
    throw new Error(
      `API not reachable at ${API_URL}/up — start the server before running perf tests`
    );
  }

  const taskIds = [];
  for (let i = 0; i < 15; i++) {
    const res = http.post(
      `${API_URL}/tasks`,
      JSON.stringify({ title: `${SEED_PREFIX}${Date.now()}-${i}` }),
      JSON_HEADERS
    );
    if (res.status === 201) {
      const body = res.json();
      taskIds.push(body.id);
    }
  }

  if (taskIds.length < 15) {
    throw new Error(
      `Setup: only ${taskIds.length}/15 seed tasks created — check API health`
    );
  }

  console.log(`Setup complete: seeded ${taskIds.length} tasks`);
  return { taskIds };
}

export default function (data) {
  group('GET /tasks', () => {
    const res = http.get(`${API_URL}/tasks`, {
      tags: { name: 'GET /tasks' },
    });
    check(res, {
      'GET /tasks status 200': (r) => r.status === 200,
      'GET /tasks returns tasks array': (r) => {
        const body = r.json();
        return body && Array.isArray(body.tasks);
      },
    });
  });

  group('POST /tasks', () => {
    const res = http.post(
      `${API_URL}/tasks`,
      JSON.stringify({
        title: `${ITER_PREFIX}${Date.now()}-${__VU}-${__ITER}`,
      }),
      Object.assign({}, JSON_HEADERS, { tags: { name: 'POST /tasks' } })
    );
    check(res, {
      'POST /tasks status 201': (r) => r.status === 201,
      'POST /tasks returns id': (r) => {
        const body = r.json();
        return body && body.id !== undefined;
      },
    });
  });

  group('PATCH /tasks/:id', () => {
    if (!data.taskIds || data.taskIds.length === 0) {
      console.warn('No seed task IDs available for PATCH test');
      return;
    }
    const id = data.taskIds[Math.floor(Math.random() * data.taskIds.length)];
    const completed = __ITER % 2 === 0;
    const res = http.patch(
      `${API_URL}/tasks/${id}`,
      JSON.stringify({ completed }),
      Object.assign({}, JSON_HEADERS, { tags: { name: 'PATCH /tasks/:id' } })
    );
    check(res, {
      'PATCH /tasks/:id status 200': (r) => r.status === 200,
      'PATCH /tasks/:id returns task': (r) => {
        const body = r.json();
        return body && body.id !== undefined;
      },
    });
  });

  sleep(0.5);
}

export function teardown(data) {
  const listRes = http.get(`${API_URL}/tasks`);
  if (listRes.status !== 200) {
    console.warn('Teardown: could not fetch task list for cleanup');
    return;
  }

  const body = listRes.json();
  const tasks = body && body.tasks ? body.tasks : [];
  const perfTasks = tasks.filter(
    (t) => t.title.startsWith(SEED_PREFIX) || t.title.startsWith(ITER_PREFIX)
  );

  let deleted = 0;
  for (const task of perfTasks) {
    const res = http.del(`${API_URL}/tasks/${task.id}`);
    if (res.status === 204) {
      deleted++;
    }
  }

  console.log(
    `Teardown: removed ${deleted}/${perfTasks.length} perf test tasks`
  );
}
