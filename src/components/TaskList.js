import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTasks, deleteTask } from '../slices/tasksSlice';
import { db } from '../firebase/config';
import { doc, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom'; 
import '../tasks.css';
import axios from 'axios'
import { clearUser } from '../slices/userSlice'; 
import { parseISO, isValid } from 'date-fns';


const TaskList = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks.tasks);
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false); 
  const [filter, setFilter] = useState('all'); 
  const [filteredTasks, setFilteredTasks] = useState([]); 

  useEffect(() => {
    console.log(user);
    const fetchTasks = async () => {
      if (!user) {
        console.error('User is not authenticated');
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken(); // Get Firebase Auth token
        const response = await axios.get('https://api-onesxgtt4q-uc.a.run.app/tasks', {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        });

        console.log('Tasks from API:', response.data);
        dispatch(setTasks(response.data)); // Set tasks in Redux store
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setError('Failed to load tasks. Please try again.');
        
        
        if (error.response && error.response.status === 403) {
          dispatch(clearUser());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, dispatch]);

  const handleDateConversion = (dueDate) => {
    if (!dueDate) return null;
  
    // Check if it's a Firestore Timestamp
    if (dueDate && typeof dueDate === 'object' && '_seconds' in dueDate) {
      // Convert Firestore Timestamp to JavaScript Date
      return new Date(dueDate._seconds * 1000);
    }
  
    // Ensure dueDate is a string before parsing
    if (typeof dueDate === 'string') {
      const parsedDate = parseISO(dueDate);
      return isValid(parsedDate) ? parsedDate : null;
    }
  
    console.warn("Due date is not a valid string:", dueDate); // Log invalid dueDate
    return null; // Return null if dueDate is not a valid type
  };

  useEffect(() => {
    let filtered = [...tasks];
    if (filter === 'status-pending') {
      filtered = filtered.filter(task => task.status === 'Pending');
    } else if (filter === 'status-inprogress') {
      filtered = filtered.filter(task => task.status === 'In Progress');
    } else if (filter === 'status-completed') {
      filtered = filtered.filter(task => task.status === 'Completed');
    }  else if (filter === 'due-asc') {
      filtered.sort((a, b) => handleDateConversion(a.dueDate) - handleDateConversion(b.dueDate));
    } else if (filter === 'due-desc') {
      filtered.sort((a, b) => handleDateConversion(b.dueDate) - handleDateConversion(a.dueDate));
    }
    setFilteredTasks(filtered);
  }, [tasks, filter]);

  if (loading) return <p>Loading tasks...</p>; 
  if (error) return <p>{error}</p>;

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
    dispatch(deleteTask(id));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark', !darkMode);
  };

  

  return (
    <div className={`task-list ${darkMode ? 'dark' : ''}`}>
      <h2>Your Tasks</h2>
      <div className="action-buttons">
        <Link to="/tasks/add">
          <button>Add Task</button> {/* Add button to navigate to Add Task */}
        </Link>
        <div className="head-right">
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>{darkMode ? 'Light Mode' : 'Dark Mode'}</button>
        </div>
      </div>

      {/* Filter Dropdown */}
      <div className="filter-container">
        <label htmlFor="filter">Filter by:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="status-pending">Status: To Do</option>
          <option value="status-inprogress">Status: In Progress</option>
          <option value="status-completed">Status: Completed</option>
          <option value="due-asc">Due Date: Ascending</option>
          <option value="due-desc">Due Date: Descending</option>
        </select>
      </div>

      <ul>
        {filteredTasks.length === 0 ? (
          <p>No tasks available.</p>
        ) : (
          filteredTasks.map(task => {
            console.log("Task received:", task);
            const dueDate = handleDateConversion(task.dueDate); 
      return ( 
            <li key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Status: {task.status}</p>
              <p> 
              Due Date: {dueDate ? dueDate.toLocaleDateString() : 'Invalid Date'}
              </p>
              <button onClick={() => handleDelete(task.id)}>Delete</button>
              <Link to={`/tasks/edit/${task.id}`}>
                <button style={{ marginLeft: '10px' }}>Edit</button> {/* Add Edit button */}
              </Link>
            </li>
          );
        })
      )}
      </ul>
    </div>
  );
};

export default TaskList;
