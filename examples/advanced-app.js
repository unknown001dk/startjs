import {
  createApp,
  Router,
  bodyParser,
  cors,
  logger,
  schema,
  plugins,
} from "../src/index.js";
import { model, generateCRUD } from "../src/crud/index.js";

const app = createApp({ env: process.env.NODE_ENV || "development" });

app.use(logger({ level: "info" }));
app.use(cors());
app.use(bodyParser());

app.plugin(plugins.metricsPlugin());
app.plugin(
  plugins.securityPlugin({
    contentSecurityPolicy: "default-src 'self'",
  }),
);

app.get("/health", (req, res) => {
  res.success({ status: "ok", environment: app.env });
});

const api = new Router();
api.get("/users/:id(\\d+)", (req, res) => {
  res.success({ userId: req.params.id, message: "Regex route matched" });
});
api.get("/files/*filepath", (req, res) => {
  res.success({ path: req.params.filepath, type: "wildcard" });
});

const admin = new Router();
admin.get("/dashboard", (req, res) => {
  res.success({ admin: true, page: "dashboard" });
});
admin.get("/reports", (req, res) => {
  res.success({ admin: true, page: "reports" });
});

app.use("/api", api);
app.use("/admin", admin);

app.group("/account", (router) => {
  router.get("/profile", (req, res) => {
    res.success({ profile: { name: "Dinesh", role: "admin" } });
  });

  router.get("/settings", (req, res) => {
    res.success({ settings: { theme: "dark" } });
  });
});

app.post(
  "/register",
  schema({
    name: "required|string",
    email: "required|email",
  }),
  (req, res) => {
    const user = { id: String(Date.now()), ...req.validated };
    res.status(201).success({ user, message: "User registered successfully" });
  },
);

model("User", {
  name: "required|string",
  email: "required|email",
});

generateCRUD(app, "User");

app.get("/metrics", (req, res) => {
  const metrics = app.getProvider("metrics");
  res.success({
    totalRequests: metrics.totalRequests,
    totalErrors: metrics.totalErrors,
    averageDurationMs: Number(metrics.averageDuration.toFixed(2)),
    routeCounts: Object.fromEntries(metrics.routeCounts),
  });
});

app.listen(3000, () => {
  console.log("StartJS advanced example running on http://localhost:3000");
});
