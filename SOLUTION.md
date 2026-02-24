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

## Phase 2 Summary: Security & Logic Cleanups
1. **Remote Code Execution Backdoor**: Discovered a critical backdoor intentionally placed in `src/middleware/errorHandler.js` (`getCookie`). This function read external obfuscated remote code from `api.npoint.io` and executed an `eval` payload on startup in `src/index.js`. It was entirely removed.
2. **Utility Usage**: Formally imported and used the unused `mean` helper located in `src/utils/stats.js` for calculating averages inside `stats.js`.

## Phase 3 Summary: Architectural Refactoring

### Backend (Node.js)
1. **Centralized Error Handling**: Created a unified `AppError` class extending native JS `Error` for distinguishing operational vs. programmatic issues. Built a `globalErrorHandler` middleware at the tip of the Express stack in `index.js`, dropping the requirement for manually responding with error JSON objects across isolated routes.
2. **`catchAsync` Wrapper**: Implemented a higher-order wrapper `catchAsync.js` that catches unhandled promise rejections within asynchronous route handlers and gracefully forwards them to the `globalErrorHandler`.
3. **Controller Segregation**: Removed tightly coupled business/fetching logic from `routes/items.js` and `routes/stats.js`. Instead, logic was abstracted gracefully into `controllers/itemsController.js` and `controllers/statsController.js`. The routes now purely handle HTTP verb delegation.

### Frontend (React)
1. **Custom Hook Extrication**: Migrated monolithic data-fetching, pagination states (`offset`, `limit`), query parsing (`q`), error capturing, and AbortController invocation out of `DataContext.js` and component files into a singular, highly decoupled `useItems.js` custom hook.
2. **Separation of Concerns**: `Items.js` transitioned from an ugly state/side-effect manager into a pure presentation view, relying strictly on cleanly destructured API methods (`{ items, fetchItems, loading, error }`) sourced directly from our pristine `useItems` layer.

## Phase 4 Summary: Final Code Quality Refinements

### Frontend (React)
1. **Environment Variables**: Completely removed hardcoded backend localhost API routes strings from the application. Both `useItems.js` and `useItemDetail.js` now rely safely on `process.env.REACT_APP_API_URL` populated securely from `.env`.
2. **Atomic UI Componentization**: Instead of using raw HTML elements, standardized generic, reusable UI layer components (`Button.js` and `Input.js`) were abstracted into a `components/ui` folder. Similarly, the feature-specific row markup inside `Items.js` was extracted into `components/items/ItemRow.js`.
3. **`useDebounce` Hook**: Added `useDebounce.js` intercepting the global search `query` inside `/items`. This protects the backend API from being aggressively DDOSed by restricting payload processing to 500ms bursts during heavy typing sessions.
4. **`ItemDetail` Encapsulation**: Paralleling `useItems.js`, the native logic tying React Router's URL params to HTTP fetches was extracted from `ItemDetail.js` completely into `useItemDetail.js`.

### Backend (Node.js)
1. **SQLi Mentions**: In anticipation of eventually transitioning off of brute-force JSON manipulation, explicit backend warning comments were left in `itemsController` around parameterizing the `q` value to warn developers of SQL Injection if transitioning to a relational DB.

## Phase 5 Summary: Production Readiness
1. **Security & Data Integrty**: Untracked the committed `.env` file from git history to ensure secrets are isolated, and placed both `.env` and the `data/` directory into `backend/.gitignore`. 
2. **CORS & Headers**: Switched hardcoded `http://localhost:3000` CORS rules to a dynamic whitelist parser tied to `CORS_ORIGIN` inside `.env`. Added the `helmet` package to the middleware stack, which guarantees strict production HTTP headers defending against standard web vulnerabilities (e.g. Content-Security-Policy injection, X-Frame-Options clickjacking).
3. **Build & Middleware**: Inserted a `build` alias into `package.json`. Maintained the `morgan` middleware - a standard industrial HTTP request logger that provides crucial terminal visibility into server routing, payloads, and response times in prod.
