import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser, clearUser } from './slices/userSlice';
import Auth from './components/Auth';
import TaskList from './components/TaskList';
import AddTask from './components/AddTask';
import EditTask from './components/EditTask';
import ProtectedRoute from './ProtectedRoute';
//import './styles.css';
//import './components/Auth.css'
import './tasks.css'

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user); // Get user from Redux

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({
          uid: user.uid,
          displayName: user.displayName || user.email,
          photoURL: user.photoURL,
        }));
      } else {
        console.log("No user signed in.");
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleSignOut = async () => {
    try {
      await auth.signOut(); // Sign out the user
      dispatch(clearUser()); // Clear user from state
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <Router>
      <>
        <header className="app-header">
          <div className="header-left">
          {user && (
            <>
              <button className="sign-out" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          )}
        </div>
        <h1 className="task-title">Task Master</h1> {/* Center title */}
        <div className="header-right">
          {user ? (
            <>
              <img
                src={user.photoURL}
                alt="Profile"
                className="profile-image"
              />
              <span className="welcome-text">
                Welcome, {user.displayName || user.email}!
              </span>
            </>
          ) : (
            <Link to="/"></Link>
          )}
        </div>
        </header>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/tasks" element={
              <ProtectedRoute>
                <TaskList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/add"
            element={
              <ProtectedRoute>
                <AddTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/edit/:id"
            element={
              <ProtectedRoute>
                <EditTask />
              </ProtectedRoute>
            }
          />
        </Routes>
      </>
    </Router>
  );
};

export default App;
