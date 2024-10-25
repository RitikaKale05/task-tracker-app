import React, { useState, useEffect } from 'react'; // Ensure only one import
import { auth } from '../firebase/config';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '../slices/userSlice';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import '../tasks.css'
const Auth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const user = useSelector((state) => state.user.user);

  const [error, setError] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is signed in
        dispatch(setUser(currentUser)
          /*uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,*/
        );
        navigate('/tasks'); // Redirect to tasks
      } else {
        // User is signed out
        dispatch(clearUser()); // Clear user state
        navigate('/'); // Redirect to sign-in page
      }
    });

    // Cleanup subscription 
    return () => unsubscribe();
  }, [dispatch, navigate]);


  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    // Force Google to show account selection every time
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      console.log("Attempting sign-in...");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();
        console.log('Firebase ID Token:', token); // Use this token for your API requests

      console.log("Sign-in successful:", result);
      dispatch(setUser(user));
      navigate('/tasks');
    } catch (error) {
      console.error("Error signing in: ", error);
      setError(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("Attempting sign-out...");
      await signOut(auth);
      dispatch(clearUser());
      navigate('/'); // Redirect to the sign-in page
    } catch (error) {
      console.error("Error signing out: ", error);
      setError(error.message);
    }
  };

  return (
    <>
    <div>
    <div className="auth-container">
       <h2>{user ? `Welcome, ${user.displayName}` : 'Sign In'}</h2>
      {user ? (
        <div className ="profile-info">
          <img src={user.photoURL} alt={user.displayName} width={50} height={50} />
          <p className="welcome-text">{user.displayName}</p>
          <button className="button signout-button" onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <button className="button" onClick={handleSignIn}>Sign in with Google</button>
      )}
      {error && <p>{error}</p>}
    </div>
    <p className="tagline">Your tasks, organized and on track!</p>
    </div>
    </>
  );
};

export default Auth;
