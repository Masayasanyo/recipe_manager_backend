import express from 'express';
import { supabase } from "../index.js";
import { decode } from "base64-arraybuffer";
import multer from 'multer';

const router = express.Router();

// Send all recipes
router.get('/all', async (req, res) => {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user.id) {
    return;
  }

  const accountId = user.id;

  const { data, error } = await supabase
    .from('recipes')
    .select(` 
      id, 
      name, 
      image_url, 
      account_id, 
      ingredients ( 
        name, 
        amount 
      ), 
      steps (
        name, 
        order 
      )
      section_id
    `)
    .eq('account_id', accountId);
  
  if (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
  }

  res.status(200).json({ message: "Recipes retrieved successfully.", data: data });
});

// Send recipes filtered by name
router.post('/search/name', async (req, res) => {
  const { data: { user } } = await supabase.auth.getUser()

  const accountId = user.id;

  const { keyword } = req.body;

  const { data, error } = await supabase
    .from('recipes')
    .select(` 
      id, 
      name, 
      image_url, 
      account_id, 
      ingredients ( 
        name, 
        amount 
      ), 
      steps (
        name, 
        order 
      )
      section_id
    `)
    .eq('account_id', accountId)
    .ilike('name', `%${keyword}%`);
  
  if (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
  }

  res.status(200).json({ message: "Recipes retrieved successfully.", data: data });
});

// Send recipes filtered by ingredient
router.post('/search/ingredient', async (req, res) => {
  const { data: { user } } = await supabase.auth.getUser()

  const accountId = user.id;

  const { keyword } = req.body;

  const { data, error } = await supabase
    .from('recipes')
    .select(` 
      id, 
      name, 
      image_url, 
      account_id, 
      ingredients ( 
        name, 
        amount 
      ), 
      steps (
        name, 
        order 
      )
      section_id
    `)
    .eq('account_id', accountId);
    
  if (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
  }

  res.status(200).json({ message: "Recipes retrieved successfully.", data: data });
});

// Send a recipe information
router.post('/detail', async (req, res) => {
  const { recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ error: "Reicpe id is required." });
  }

  const { data, error } = await supabase
    .from('recipes')
    .select(` 
      id, 
      name, 
      image_url, 
      account_id, 
      ingredients ( 
        name, 
        amount 
      ), 
      steps (
        name, 
        order 
      )
      section_id
    `)
    .eq('id', recipeId);
  
  if (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
  }

  res.status(200).json({ message: "Recipes retrieved successfully.", data: data });
});

// Add a new recipe
router.post('/add', async (req, res) => {
  const { imageUrl, title, ingredient, step } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Reicpe title is required." });
  }

  const { data: { user } } = await supabase.auth.getUser()

  const accountId = user.id;

  const { data: recipeData, error: recipeError } = await supabase
    .from('recipes')
    .insert({ name: title, image_url: imageUrl, account_id: accountId })
    .select()

  if (recipeError) {
    console.error(recipeError);
    res.status(500).json({ recipeError: "Internal server error." });
  }
  const recipeId = recipeData[0].id;

  for (let i = 0; i < ingredient.length; i++){
    const { data: ingData, error: ingError } = await supabase
      .from('ingredients')
      .insert({ recipe_id: recipeId, name: ingredient[i].name, amount: ingredient[i].amount })
      .select()

    if (ingError) {
      console.error(ingError);
      res.status(500).json({ ingError: "Internal server error." });
    }
  }

  for (let i = 0; i < step.length; i++){
    const { data: stepData, error: stepError } = await supabase
      .from('steps')
      .insert({ recipe_id: recipeId, name: step[i].name, order: step[i].order })
      .select()

    if (stepError) {
      console.error(stepError);
      res.status(500).json({ stepError: "Internal server error." });
    }
  }

  res.status(201).json({ message: "Recipe upload successful."});
});

// Edit a recipe
router.post('/edit', async (req, res) => {
  const { recipeId, imageUrl, title, ingredient, step } = req.body;

  if (!recipeId || !imageUrl || !title) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Delete ingredients data
  const { data: deleteIngData, error: deleteIngError } = await supabase
    .from('ingredients')
    .delete()
    .eq('recipe_id', recipeId)
    .select()
  if (deleteIngError) {
    console.error(deleteIngError);
    res.status(500).json({ deleteIngError: "Internal server error." });
  }

  // Delete steps data
  const { data: deleteStepData, error: deleteStepError } = await supabase
    .from('steps')
    .delete()
    .eq('recipe_id', recipeId)
    .select()
  if (deleteStepError) {
    console.error(deleteStepError);
    res.status(500).json({ deleteStepError: "Internal server error." });
  }

  // upload ingredients data
  for (let i = 0; i < ingredient.length; i++){
    const { data: ingData, error: ingError } = await supabase
      .from('ingredients')
      .insert({ recipe_id: recipeId, name: ingredient[i].name, amount: ingredient[i].amount })
      .select()

    if (ingError) {
      console.error(ingError);
      res.status(500).json({ ingError: "Internal server error." });
    }
  }

  // Upload steps data
  for (let i = 0; i < step.length; i++){
    const { data: stepData, error: stepError } = await supabase
      .from('steps')
      .insert({ recipe_id: recipeId, name: step[i].name, order: step[i].order })
      .select()

    if (stepError) {
      console.error(stepError);
      res.status(500).json({ stepError: "Internal server error." });
    }
  }

  // Update recipe data
  const { data: updateRecipeData, error: updateRecipeError } = await supabase
    .from('recipes')
    .update({ name: title, image_url: imageUrl })
    .eq('id', recipeId)
    .select()
  if (updateRecipeError) {
    console.error(updateRecipeError);
    res.status(500).json({ updateRecipeError: "Internal server error." });
  }

  res.status(200).json({ message: "Update successful.", data: updateRecipeData });
});

// Delete a recipe
router.delete('/delete', async (req, res) => {
  const { recipeId, recipeUrl } = req.body;

  if (!recipeId) {
    return res.status(400).json({ error: "Reicpe id is required." });
  }

  if (recipeUrl) {
    console.log(recipeUrl);
    let splittedUrl = recipeUrl.split('/');
    let previousFileName = splittedUrl[splittedUrl.length - 1];
    
    const { data, error } = await supabase
      .storage
      .from('recipe-images')
      .remove([previousFileName])
  }

  const { data: deleteRecipeData, error: deleteRecipeError } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId)
    .select()
  if (deleteRecipeError) {
    console.error(deleteRecipeError);
    res.status(500).json({ deleteRecipeError: "Internal server error." });
  }

  res.status(200).json({ message: "Delete a recipe successful.", data: deleteRecipeData });
});

// Upload a recipe image
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/add/upload', upload.single('file'), async function (req, res) {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileBase64 = decode(file.buffer.toString("base64"));
        const uniqueSuffix = Math.random().toString(26).substring(4, 10);
        const fileName = `${Date.now()}-${uniqueSuffix}-${file.originalname}`;

        const { data, error } = await supabase.storage
            .from("recipe-images")
            .upload(fileName, fileBase64);

        if (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error." });
        }

        const { data: image } = supabase.storage
            .from("recipe-images")
            .getPublicUrl(data.path);

        res.status(200).json({ message: "Upload a recipe image successful.", url: image.publicUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Update recipe image files
router.post('/edit/upload', upload.single('file'), async function (req, res) {
  try {
      const file = req.file;
      const { recipeId, previousUrl } = req.body;

      if (!file) {
          return res.status(400).json({ message: "No file uploaded." });
      }

      if (previousUrl !== ''){
        let splittedUrl = previousUrl.split('/');
        let previousFileName = splittedUrl[splittedUrl.length - 1];
        const { data: deleteImgData, error: deleteImgError } = await supabase
          .storage
          .from('recipe-images')
          .remove([previousFileName]);
        if (deleteImgError) {
          console.error(deleteImgError);
          res.status(500).json({ deleteImgError: "Internal server error." });
        }
      }

      const fileBase64 = decode(file.buffer.toString("base64"));
      const uniqueSuffix = Math.random().toString(26).substring(4, 10);
      const fileName = `${Date.now()}-${uniqueSuffix}-${file.originalname}`;

      const { data, error } = await supabase.storage
          .from("recipe-images")
          .upload(fileName, fileBase64);

      if (error) {
          console.error(error);
          res.status(500).json({ error: "Internal server error." });
      }

      const { data: image } = supabase.storage
          .from("recipe-images")
          .getPublicUrl(data.path);

      res.status(200).json({ message: "Upload a recipe image successful.", url: image.publicUrl });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
  }
});

export default router;