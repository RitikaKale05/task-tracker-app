import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
//import { useSelector } from 'react-redux';

const EditTask = () => {
  const { id } = useParams(); // Get the task ID from the URL
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const navigate = useNavigate();
  //const user = useSelector((state) => state.user.user); // Get user from Redux

  useEffect(() => {
    const fetchTask = async () => {
      const taskDocRef = doc(db, 'tasks', id); // Create a reference to the document
      const taskDoc = await getDoc(taskDocRef); // Use getDoc to fetch the document

      if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        setTitle(taskData.title);
        setDescription(taskData.description);
        
        // Use Firestore's toDate() method to get a JavaScript Date object
        const dueDateTimestamp = taskData.dueDate ? taskData.dueDate.toDate() : null;
        
        // Set due date to the local time string in YYYY-MM-DD format
        if (dueDateTimestamp) {
          const localDateString = new Date(dueDateTimestamp.getTime() - dueDateTimestamp.getTimezoneOffset() * 60000).toISOString().split('T')[0];
          setDueDate(localDateString);
          
          // Console logs for debugging
          console.log("Fetched Due Date:", dueDateTimestamp);
          console.log("Local Due Date String:", localDateString);
        } else {
          setDueDate('');
        }

        setStatus(taskData.status);
      }
    };

    fetchTask();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Set the dueDate to midnight of the selected date in UTC
      const dueDateUTC = dueDate ? new Date(`${dueDate}T00:00:00Z`) : null;

      // Console log before updating the task
      console.log("Updating Due Date to UTC:", dueDateUTC);

      await updateDoc(doc(db, 'tasks', id), {
        title,
        description,
        dueDate: dueDateUTC, // Set the updated due date
        status,
      });
      navigate('/tasks'); // Redirect to tasks after editing
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  return (
    <div>
      <h2>Edit Task</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Task Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Pending">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <button type="submit">Update Task</button>
      </form>
    </div>
  );
};

export default EditTask;
