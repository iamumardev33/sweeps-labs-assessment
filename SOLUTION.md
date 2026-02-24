# Phase 1 Summary

## Approach and Trade-offs

### Backend
1. **Blocking I/O**: The synchronous `fs.readFileSync` calls in both `/items` and `/stats` routes were converted to use `fs.promises.readFile`. This was crucial to ensure Node's event loop isn't blocked on every request, allowing for better concurrency.
2. **Stats Route Performance**: Calculating `reduce` iteratively on massive files was heavily blocking. While a full database (e.g., PostgreSQL or Redis) is preferred for high-volume scenarios, the approach taken was an **in-memory caching mechanism**. The `/api/stats` endpoint computes the numbers once and holds them in memory. We then watch `items.json` via `fs.watch`, clearing the cache dynamically whenever changes are written to disk. The trade-off here is memory overhead on the Node process.
3. **Items Route Pagination & Search**: Server side logic was added to intercept `offset`, `limit`, and `q` parameters, delegating the heavy lifting to the server before data goes over the wire, optimizing bandwidth.
4. **Testing**: Implemented robust endpoint testing using `Jest` alongside `supertest` to confirm endpoints adhere strictly to these behaviours.

### Frontend
1. **Memory Leaks**: `AbortController` was integrated tightly into the fetch invocation within the `useEffect` on `Items.js`. When the component unmounts prematurely before the HTTP request completes, `controller.abort()` cleanly shuts down the request context and prevents the eventual `setState` callback memory leak.
2. **Virtualization**: As the list payload can grow enormous, a simple loop rendering components would bloat the DOM. `react-window`'s `FixedSizeList` provides extreme performance boundaries: only rendering components realistically placed within the user's view frustum.
3. **Data Management Context**: The `DataContext.js` provider was updated to natively handle `q` / `limit` / `offset` state, alongside handling generic `loading` and `error` parameters to create smooth UI/UX flows.

### Future (Phase 2 & 3)
The immediate focus moving forward revolves around flushing out existing security concerns (the malicious `getCookie` injection), and restructuring the backend and frontend tightly along traditional Controller / Services schema, and extracting frontend Context state into isolated UI custom hooks.
