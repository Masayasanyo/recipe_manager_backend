import express from 'express';
import { supabase } from "../index.js";

const router = express.Router();

// Check session
router.get('/session', async (req, res) => {
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error.", isLoggedIn: false });
  }

  if (user) {
    return res.status(200).json({ 
      message: "User is logged in.", 
      isLoggedIn: true 
    });
  } else {
    return res.status(200).json({ 
      message: "User is not logged in.", 
      isLoggedIn: false 
    });
  }
});

// Sign up
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  await supabase.auth.signOut();

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }

  res.status(201).json({ 
    message: "Sign up successful.", 
    data: data
  });
});

// Log in
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  await supabase.auth.signOut();

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });  

  if (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }

  res.status(200).json({ 
    message: "Login successful.", 
    data: data
  });
});

// Sign out
router.post('/signout', async (req, res) => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }

  res.status(200).json({ 
    message: "Sign out successful." 
  });
});

export default router;