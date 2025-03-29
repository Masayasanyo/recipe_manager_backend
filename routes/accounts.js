import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from "../index.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Sign up
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const { data, error } = await supabase
      .from('accounts')
      .insert({ email: email, password: hashedPassword })
      .select('id, email')

  if (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }

  res.status(201).json({ message: "Registration Successful.", data: data })
});

// Log in
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const { data, error } = await supabase
    .from('accounts')
    .select('id, email, password')
    .eq('email', email)
    .single();

  if (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
  const passwordMatch = await bcrypt.compare(password, data.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: "Email or Password are wrong." });
  }
  const token = jwt.sign({ id: data.id, email: data.email }, JWT_SECRET, {
    expiresIn: '1h',
  });

  return res.status(200).json({ message: "Login Successful", token: token });
});

export default router;