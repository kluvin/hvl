const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
};

async function fetchJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (_error) {
    return null;
  }
}

export async function getStatuses(baseUrl) {
  const payload = await fetchJson(`${baseUrl}/allstatuses`, { method: "GET" });
  if (payload && payload.responseStatus && Array.isArray(payload.allstatuses)) {
    return payload.allstatuses;
  }
  return null;
}

export async function getTasks(baseUrl) {
  const payload = await fetchJson(`${baseUrl}/tasklist`, { method: "GET" });
  if (payload && payload.responseStatus && Array.isArray(payload.tasks)) {
    return payload.tasks;
  }
  return null;
}

export async function updateTaskStatus(baseUrl, id, status) {
  const payload = await fetchJson(`${baseUrl}/task/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ status }),
  });
  return Boolean(payload && payload.responseStatus);
}

export async function deleteTask(baseUrl, id) {
  const payload = await fetchJson(`${baseUrl}/task/${id}`, {
    method: "DELETE",
  });
  return Boolean(payload && payload.responseStatus);
}

export async function createTask(baseUrl, task) {
  const payload = await fetchJson(`${baseUrl}/task`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(task),
  });
  if (payload && payload.responseStatus && payload.task) {
    return payload.task;
  }
  return null;
}
