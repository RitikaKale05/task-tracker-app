const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const serviceAccount = require("./permissions.json");

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://task-tracker-application-f7ea0.firebaseio.com",
});
const db = admin.firestore();
const app = express();


app.use(cors({origin: true}));

// Parse JSON bodies
app.use(express.json());

// Middleware to check Firebase Authentication
const authenticate = async (req, res, next) => {
  const idToken =
  req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ?
        req.headers.authorization.split("Bearer ")[1] :
        null;

  if (!idToken) {
    return res.status(403).send("Unauthorized");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next(); // Move to the next middleware or route handler
  } catch (error) {
    return res.status(403).send("Unauthorized");
  }
};

app.get("/tasks", authenticate, async (req, res) => {
  try {
    const tasksSnapshot = await db.collection("tasks")
        .where("userId", "==", req.user.uid)
        .get();

    const tasks =
    tasksSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({message: "Failed to fetch tasks"});
  }
});

// POST /tasks - Create a new task
app.post("/tasks", authenticate, async (req, res) => {
  try {
    const {title, description, dueDate, status} = req.body;
    const newTask = {
      id: Date.now().toString(), // Generate a unique ID for the task
      title,
      description,
      dueDate: dueDate ? admin.firestore
          .Timestamp.fromDate(new Date(dueDate)) : null,
      status,
      userId: req.user.uid, // Store the authenticated user's ID
    };

    // Write the new task to Firestore
    const taskRef =
    await db.collection("tasks").add(newTask);
    console.log(`Task added with ID: ${taskRef.id}`);

    res.status(201).json({id: taskRef.id, ...newTask});
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({message: "Failed to add task"});
  }
});


// PUT /tasks/:id - Update an existing task
app.put("/tasks/:id", authenticate, async (req, res) => {
  const taskId = req.params.id;
  try {
    // Get the task from Firestore
    const taskRef = db.collection("tasks").doc(taskId);
    const taskSnapshot = await taskRef.get();

    // Check if the task exists
    if (!taskSnapshot.exists) {
      return res.status(404).send("Task not found");
    }

    const taskData = taskSnapshot.data();

    // Check if the user is authorized to update this task
    if (taskData.userId !== req.user.uid) {
      return res.status(403).send("Unauthorized");
    }

    // Update the task
    await taskRef.update(req.body);

    // Return the updated task
    const updatedTask = {id: taskId, ...req.body};
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({message: "Failed to update task"});
  }
});


// DELETE /tasks/:id - Delete a task by ID
app.delete("/tasks/:id", authenticate, async (req, res) => {
  const taskId = req.params.id;
  try {
    // Get the task from Firestore
    const taskRef = db.collection("tasks").doc(taskId);
    const taskSnapshot = await taskRef.get();

    // Check if the task exists
    if (!taskSnapshot.exists) {
      return res.status(404).send("Task not found");
    }

    const taskData = taskSnapshot.data();

    // Check if the user is authorized to delete this task
    if (taskData.userId !== req.user.uid) {
      return res.status(403).send("Unauthorized");
    }

    // Delete the task
    await taskRef.delete();

    // Return a 204 No Content response
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({message: "Failed to delete task"});
  }
});

exports.api = functions.https.onRequest(app);
