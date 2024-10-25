import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Timestamp } from 'firebase/firestore';

const AddTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user); // Get user from Redux

  const handleSubmit = async (e) => {
    e.preventDefault();
    //const selectedDueDate = dueDate ? new Date(`${dueDate}T00:00:00`) : null;
    //const selectedDueDate = dueDate ? new Date(dueDate) : null;
    const selectedDueDate = new Date(dueDate);
        if (isNaN(selectedDueDate.getTime())) {
            alert('Invalid date format. Please use YYYY-MM-DD format.');
            return;
        }
    
    console.log({ title, description, status, dueDate: selectedDueDate, userId: user.uid }); // Log task details

    try {
      await addDoc(collection(db, 'tasks'), {
        title,
        description: description || '', 
        dueDate: Timestamp.fromDate(selectedDueDate),
        userId: user.uid, // Ensure user ID is included
         
      });
      navigate('/tasks'); // Redirect to tasks after adding
    } catch (error) {
      console.error("Error adding task: ", error); // Log any errors
    }
  };

  return (
    <div>
      <h2>Add New Task</h2>
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
          // Remove the required attribute to make it optional
        />
        <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        placeholder="Due Date" // Placeholder for the date field
        className="input-due-date"
      />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Pending">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
};

export default AddTask;
