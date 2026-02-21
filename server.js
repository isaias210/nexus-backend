require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getState, updateState, addLog } = require('./system/memory-engine');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

/*
========================================
ROOT
========================================
*/
app.get("/", (req, res) => {
  res.json({
    status: "Nexus Backend Running",
    version: "2.0.0"
  });
});

/*
========================================
REGISTER
========================================
*/
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created",
      token
    });

  } catch (error) {
    res.status(500).json({
      error: "Registration failed",
      details: error.message
    });
  }
});

/*
========================================
LOGIN
========================================
*/
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    res.status(500).json({
      error: "Login failed",
      details: error.message
    });
  }
});

/*
========================================
JWT MIDDLEWARE
========================================
*/
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Token not provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
}

/*
========================================
GET CURRENT USER
========================================
*/
app.get("/api/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/*
========================================
CREATE PROJECT
========================================
*/
app.post("/api/projects", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Project name required" });
    }

    const project = await prisma.project.create({
      data: {
        name,
        userId: req.user.userId
      }
    });

    res.status(201).json(project);

  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

/*
========================================
LIST PROJECTS
========================================
*/
app.get("/api/projects", authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.userId }
    });

    res.json(projects);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

app.post("/api/tasks", authenticateToken, async (req, res) => {
  try {
    const { title, description, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: "Title and projectId required" });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId
      }
    });

    res.status(201).json(task);

  } catch (error) {
    res.status(500).json({ error: "Error creating task" });
  }
});

app.get("/api/tasks/:projectId", authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId }
    });

    res.json(tasks);

  } catch (error) {
    res.status(500).json({ error: "Error fetching tasks" });
  }
});

app.put("/api/tasks/:taskId", authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!task || task.project.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status }
    });

    res.json(updatedTask);

  } catch (error) {
    res.status(500).json({ error: "Error updating task" });
  }
});

/*
========================================
rota GET /system/state
========================================
*/
app.get('/system/state', (req, res) => {
  try {
    const state = getState();
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read state' });
  }
});

/*
========================================
rota POST /system/update
========================================
*/
app.post('/system/update', (req, res) => {
  try {
    const updated = updateState(req.body);
    addLog({
      action: "STATE_UPDATED",
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update state' });
  }
});

/*
========================================
HEALTH
========================================
*/
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

/*
========================================
404
========================================
*/
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Nexus Backend running on port ${PORT}`);
});
