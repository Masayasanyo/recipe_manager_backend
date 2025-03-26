import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import accountsRoutes from "./routes/accounts.js";
import recipesRoutes from "./routes/recipes.js";

dotenv.config();

const app = express();
app.use(express.json()); 
app.use(cors());
app.use("/accounts", accountsRoutes);
app.use("/recipes", recipesRoutes);

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})








// import express from 'express';
// import cors from 'cors';
// import pkg from 'pg';
// import dotenv from 'dotenv';
// import multer from 'multer';
// import path from 'path';
// import fs from "fs";
// import { fileURLToPath } from "url";

// dotenv.config();

// const { Pool } = pkg;
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL, 
// });

// const app = express();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
// 		const uploadPath = path.resolve(__dirname, "./public/recipe_images");

// 		if (!fs.existsSync(uploadPath)) {
// 			fs.mkdirSync(uploadPath, { recursive: true });
// 		}

// 		cb(null, uploadPath);
// 	},
//   filename: (req, file, cb) => {
// 		const uniqueSuffix = Math.random().toString(26).substring(4, 10);
// 		cb(null, `${Date.now()}-${uniqueSuffix}-${file.originalname}`);
// 	},
// });
// const upload = multer({ storage: storage });

// const port = process.env.PORT;

// app.use(express.json()); 
// app.use(cors());
// app.use("/public", express.static(path.join(__dirname, "./public/")));

// app.get('/recipe/all', async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT * FROM recipe",
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "No recipes found." });
//     }

//     res.status(200).json({ 
//       message: "Recipes retrieved successfully.", 
//       data: result.rows 
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

// app.post('/recipe/detail', async (req, res) => {
//   const { recipeId } = req.body;

//   if (!recipeId) {
//     return res.status(400).json({ error: "Reicpe id is required." });
//   }

//   try {
//     const result = await pool.query(
//       `SELECT * FROM recipe WHERE id = $1`,
//       [recipeId]
//     );

//     res.status(200).json({ 
//       message: "Recipe retrieved successfully.", 
//       data: result.rows[0] 
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

// app.post('/recipe/add', async (req, res) => {
//   const { imageUrl, title, ingredient, step } = req.body;

//   if (!title) {
//     return res.status(400).json({ error: "Reicpe title is required." });
//   }

//   try {
//     const result = await pool.query(
//       `INSERT INTO 
//         recipe (image_url, title, ingredient, step) 
//       VALUES 
//         ($1, $2, $3, $4) 
//       RETURNING 
//         id, image_url, title, ingredient, step, created_at
//       `,
//       [imageUrl, title, ingredient, step]
//     );

//     res.status(201).json({ message: "Registration successful.", data: result.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

// app.post('/recipe/edit', async (req, res) => {
//   const { id, title, ingredient, step } = req.body;

//   if (!id || !title) {
//     return res.status(400).json({ error: "Reicpe id and title are required." });
//   }

//   try {
//     const result = await pool.query(
//       `UPDATE  
//         recipe 
//       SET 
//         (title, ingredient, step) = ($1, $2, $3) 
//       WHERE
//         id = $4 
//       RETURNING 
//         id, title, ingredient, step, created_at
//       `,
//       [title, ingredient, step, id]
//     );

//     res.status(200).json({ message: "Update successful.", data: result.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

// app.delete('/recipe/delete', async (req, res) => {
//   const { recipeId } = req.body;

//   if (!recipeId) {
//     return res.status(400).json({ error: "Reicpe id is required." });
//   }

//   try {
//     const result = await pool.query(
//       `DELETE FROM 
//         recipe 
//       WHERE 
//         id = $1 
//       RETURNING 
//         id, title, ingredient, step, created_at
//       `,
//       [recipeId]
//     );

//     res.status(200).json({ message: "Delete a recipe successful.", data: result.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

// app.post('/recipe/add/upload', upload.single('file'), function (req, res) {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded." });
//   }

//   res.status(201).json({ message: "File upload successful.", url: req.file.filename});
// })

// app.listen(port, () => {
//   console.log(`Server is listening on port ${port}`)
// })