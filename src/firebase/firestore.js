// src/firebase/firestore.js
import { db } from './config';
import { collection, addDoc } from 'firebase/firestore';

// Function to add a task to Firestore
const addTask = async (task) => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), task);
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

export { addTask };
