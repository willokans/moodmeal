const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "mood-recipe-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  })
);
app.use(express.static("public"));

// Initialize SQLite database
const db = new sqlite3.Database("./recipes.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");
    initializeDatabase();
  }
});

// Create tables and populate with sample data
function initializeDatabase() {
  // Create recipes table
  db.run(
    `CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mood TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    prepTime TEXT NOT NULL,
    servings INTEGER NOT NULL,
    image TEXT,
    active INTEGER DEFAULT 1
  )`,
    (err) => {
      if (err) {
        console.error("Error creating table:", err);
      } else {
        // Check if active column exists, if not add it
        db.all("PRAGMA table_info(recipes)", (err, columns) => {
          const hasActiveColumn = columns.some((col) => col.name === "active");

          if (!hasActiveColumn) {
            db.run(
              "ALTER TABLE recipes ADD COLUMN active INTEGER DEFAULT 1",
              (err) => {
                if (err) {
                  console.error("Error adding active column:", err);
                } else {
                  console.log("Active column added to recipes table");
                  // Set all existing recipes to active
                  db.run("UPDATE recipes SET active = 1 WHERE active IS NULL");
                }
              }
            );
          }
        });

        // Check if we need to populate
        db.get("SELECT COUNT(*) as count FROM recipes", (err, row) => {
          if (row.count === 0) {
            populateRecipes();
          }
        });
      }
    }
  );

  // Create users table
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
    (err) => {
      if (err) {
        console.error("Error creating users table:", err);
      } else {
        // Check if test user exists, if not create it
        db.get(
          "SELECT * FROM users WHERE email = ?",
          ["test@user.com"],
          (err, row) => {
            if (!row) {
              // Create test user with hashed password
              bcrypt.hash("test", 10, (err, hash) => {
                if (err) {
                  console.error("Error hashing password:", err);
                } else {
                  db.run(
                    "INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)",
                    ["test@user.com", hash, 0],
                    (err) => {
                      if (err) {
                        console.error("Error creating test user:", err);
                      } else {
                        console.log("Test user created: test@user.com / test");
                      }
                    }
                  );
                }
              });
            }
          }
        );

        // Check if admin user exists, if not create it
        db.get(
          "SELECT * FROM users WHERE email = ?",
          ["admin@user.com"],
          (err, row) => {
            if (!row) {
              // Create admin user with hashed password
              bcrypt.hash("admin", 10, (err, hash) => {
                if (err) {
                  console.error("Error hashing password:", err);
                } else {
                  db.run(
                    "INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)",
                    ["admin@user.com", hash, 1],
                    (err) => {
                      if (err) {
                        console.error("Error creating admin user:", err);
                      } else {
                        console.log(
                          "Admin user created: admin@user.com / admin"
                        );
                      }
                    }
                  );
                }
              });
            }
          }
        );
      }
    }
  );
}

// Populate database with mood-based recipes
function populateRecipes() {
  const recipes = [
    // Happy mood recipes
    {
      name: "Rainbow Veggie Pasta",
      mood: "happy",
      ingredients:
        "Pasta, Bell peppers (red, yellow, orange), Cherry tomatoes, Zucchini, Olive oil, Garlic, Parmesan cheese, Fresh basil",
      instructions:
        "1. Cook pasta according to package directions. 2. Sauté colorful vegetables in olive oil with garlic. 3. Toss pasta with vegetables. 4. Top with parmesan and fresh basil.",
      prepTime: "25 minutes",
      servings: 4,
      image: "🌈🍝",
    },
    {
      name: "Sunshine Smoothie Bowl",
      mood: "happy",
      ingredients:
        "Frozen mango, Banana, Orange juice, Greek yogurt, Granola, Fresh berries, Coconut flakes",
      instructions:
        "1. Blend mango, banana, orange juice, and yogurt until smooth. 2. Pour into a bowl. 3. Top with granola, berries, and coconut flakes.",
      prepTime: "10 minutes",
      servings: 2,
      image: "🌞🥣",
    },
    {
      name: "Celebration Cupcakes",
      mood: "happy",
      ingredients:
        "Flour, Sugar, Butter, Eggs, Vanilla extract, Baking powder, Milk, Colorful frosting, Sprinkles",
      instructions:
        "1. Mix dry ingredients. 2. Beat butter, sugar, and eggs. 3. Combine and add milk. 4. Bake at 350°F for 18-20 minutes. 5. Cool and frost with colorful frosting and sprinkles.",
      prepTime: "45 minutes",
      servings: 12,
      image: "🧁✨",
    },
    // Sad mood recipes
    {
      name: "Comfort Mac & Cheese",
      mood: "sad",
      ingredients:
        "Elbow macaroni, Butter, Flour, Milk, Cheddar cheese, Mozzarella, Salt, Pepper, Breadcrumbs",
      instructions:
        "1. Cook macaroni. 2. Make cheese sauce with butter, flour, milk, and cheeses. 3. Mix pasta with sauce. 4. Top with breadcrumbs and bake at 350°F for 20 minutes.",
      prepTime: "40 minutes",
      servings: 6,
      image: "🧀🍝",
    },
    {
      name: "Warm Chocolate Chip Cookies",
      mood: "sad",
      ingredients:
        "Butter, Brown sugar, White sugar, Eggs, Vanilla, Flour, Baking soda, Salt, Chocolate chips",
      instructions:
        "1. Cream butter and sugars. 2. Add eggs and vanilla. 3. Mix in dry ingredients. 4. Fold in chocolate chips. 5. Bake at 375°F for 10-12 minutes.",
      prepTime: "30 minutes",
      servings: 24,
      image: "🍪❤️",
    },
    {
      name: "Chicken Noodle Soup",
      mood: "sad",
      ingredients:
        "Chicken breast, Egg noodles, Carrots, Celery, Onion, Chicken broth, Garlic, Bay leaf, Parsley",
      instructions:
        "1. Sauté vegetables in pot. 2. Add chicken broth and bring to boil. 3. Add chicken and simmer 20 minutes. 4. Shred chicken, return to pot with noodles. 5. Cook until noodles are tender.",
      prepTime: "45 minutes",
      servings: 6,
      image: "🍲💛",
    },
    // Energetic mood recipes
    {
      name: "Power Protein Bowl",
      mood: "energetic",
      ingredients:
        "Quinoa, Grilled chicken, Avocado, Chickpeas, Spinach, Cherry tomatoes, Lemon tahini dressing",
      instructions:
        "1. Cook quinoa. 2. Grill and slice chicken. 3. Arrange quinoa, chicken, chickpeas, and vegetables in bowl. 4. Drizzle with tahini dressing.",
      prepTime: "30 minutes",
      servings: 2,
      image: "💪🥗",
    },
    {
      name: "Energy Breakfast Burrito",
      mood: "energetic",
      ingredients:
        "Whole wheat tortillas, Scrambled eggs, Black beans, Avocado, Salsa, Cheese, Bell peppers, Onions",
      instructions:
        "1. Scramble eggs with peppers and onions. 2. Warm tortillas. 3. Layer eggs, beans, avocado, cheese, and salsa. 4. Roll up and enjoy!",
      prepTime: "15 minutes",
      servings: 2,
      image: "🌯⚡",
    },
    {
      name: "Spicy Thai Stir-Fry",
      mood: "energetic",
      ingredients:
        "Rice noodles, Shrimp or tofu, Bell peppers, Snap peas, Thai basil, Soy sauce, Chili paste, Garlic, Ginger",
      instructions:
        "1. Cook noodles. 2. Stir-fry protein with garlic and ginger. 3. Add vegetables and sauce. 4. Toss with noodles and basil.",
      prepTime: "25 minutes",
      servings: 4,
      image: "🍜🔥",
    },
    // Relaxed mood recipes
    {
      name: "Lavender Honey Tea",
      mood: "relaxed",
      ingredients: "Water, Dried lavender, Honey, Lemon, Fresh mint",
      instructions:
        "1. Boil water and steep lavender for 5 minutes. 2. Strain into cup. 3. Add honey and lemon. 4. Garnish with mint.",
      prepTime: "10 minutes",
      servings: 1,
      image: "🍵💜",
    },
    {
      name: "Mediterranean Mezze Platter",
      mood: "relaxed",
      ingredients:
        "Hummus, Pita bread, Cucumber, Cherry tomatoes, Olives, Feta cheese, Tzatziki, Grapes",
      instructions:
        "1. Arrange hummus and tzatziki in small bowls. 2. Cut vegetables and pita. 3. Arrange everything on a large platter. 4. Enjoy slowly!",
      prepTime: "15 minutes",
      servings: 4,
      image: "🫒🧘",
    },
    {
      name: "Herb Roasted Salmon",
      mood: "relaxed",
      ingredients:
        "Salmon fillets, Dill, Lemon, Olive oil, Garlic, Asparagus, White wine",
      instructions:
        "1. Season salmon with herbs, garlic, and lemon. 2. Arrange asparagus around salmon. 3. Drizzle with olive oil and wine. 4. Bake at 400°F for 15-18 minutes.",
      prepTime: "25 minutes",
      servings: 4,
      image: "🐟🌿",
    },
    // Adventurous mood recipes
    {
      name: "Korean BBQ Tacos",
      mood: "adventurous",
      ingredients:
        "Beef bulgogi, Corn tortillas, Kimchi, Sesame seeds, Green onions, Sriracha mayo, Cilantro",
      instructions:
        "1. Marinate and grill beef bulgogi. 2. Warm tortillas. 3. Fill with beef, kimchi, and toppings. 4. Drizzle with sriracha mayo.",
      prepTime: "35 minutes",
      servings: 4,
      image: "🌮🎉",
    },
    {
      name: "Moroccan Tagine",
      mood: "adventurous",
      ingredients:
        "Lamb or chicken, Chickpeas, Apricots, Onions, Tomatoes, Cumin, Cinnamon, Coriander, Couscous",
      instructions:
        "1. Brown meat with spices. 2. Add vegetables and dried fruit. 3. Simmer 1 hour until tender. 4. Serve over couscous.",
      prepTime: "90 minutes",
      servings: 6,
      image: "🍲🌍",
    },
    {
      name: "Sushi Roll Bowl",
      mood: "adventurous",
      ingredients:
        "Sushi rice, Nori sheets (crumbled), Salmon or tuna, Avocado, Cucumber, Edamame, Soy sauce, Wasabi, Pickled ginger",
      instructions:
        "1. Cook sushi rice and season. 2. Arrange rice in bowl. 3. Top with fish, vegetables, and nori. 4. Serve with soy sauce and wasabi.",
      prepTime: "30 minutes",
      servings: 2,
      image: "🍣🌊",
    },
    // More Happy recipes
    {
      name: "Unicorn Pancakes",
      mood: "happy",
      ingredients:
        "Pancake mix, Food coloring (pink, purple, blue), Whipped cream, Rainbow sprinkles, Mini marshmallows, Edible glitter",
      instructions:
        "1. Divide pancake batter into 3 bowls and color each. 2. Cook small colorful pancakes. 3. Stack them up alternating colors. 4. Top with whipped cream, sprinkles, marshmallows, and edible glitter.",
      prepTime: "20 minutes",
      servings: 3,
      image: "🦄🥞",
    },
    {
      name: "Tropical Paradise Poke Bowl",
      mood: "happy",
      ingredients:
        "Sushi rice, Fresh tuna, Mango chunks, Pineapple, Edamame, Sesame seeds, Ponzu sauce, Macadamia nuts, Crispy wontons",
      instructions:
        "1. Cook and season sushi rice. 2. Cube fresh tuna and marinate in ponzu. 3. Arrange rice, tuna, tropical fruits, and toppings in bowl. 4. Drizzle with extra ponzu and top with nuts.",
      prepTime: "25 minutes",
      servings: 2,
      image: "🌺🍚",
    },
    // More Sad recipes
    {
      name: "Grandma's Cinnamon Roll Bread Pudding",
      mood: "sad",
      ingredients:
        "Day-old cinnamon rolls, Eggs, Heavy cream, Vanilla, Nutmeg, Butter, Caramel sauce, Ice cream",
      instructions:
        "1. Cube cinnamon rolls. 2. Whisk eggs, cream, vanilla, and nutmeg. 3. Pour over bread, let soak 30 minutes. 4. Bake at 350°F for 45 minutes. 5. Serve warm with caramel sauce and ice cream.",
      prepTime: "90 minutes",
      servings: 8,
      image: "🥐💝",
    },
    {
      name: "Ultimate Grilled Cheese & Tomato Soup",
      mood: "sad",
      ingredients:
        "Sourdough bread, Gruyere cheese, Sharp cheddar, Butter, San Marzano tomatoes, Heavy cream, Basil, Garlic, Onion",
      instructions:
        "1. Make soup: sauté onion and garlic, add tomatoes and simmer 30 min, blend with cream and basil. 2. Grill sandwich with mixed cheeses on buttered bread until golden. 3. Cut sandwich into strips for dipping.",
      prepTime: "45 minutes",
      servings: 4,
      image: "🧀🍅",
    },
    // More Energetic recipes
    {
      name: "Dragon Fruit Açaí Power Smoothie",
      mood: "energetic",
      ingredients:
        "Frozen açaí, Dragon fruit, Banana, Spinach, Chia seeds, Almond butter, Protein powder, Coconut water, Bee pollen",
      instructions:
        "1. Blend açaí, dragon fruit, banana, spinach, and coconut water. 2. Add protein powder and almond butter. 3. Top with chia seeds and bee pollen. 4. Enjoy immediately!",
      prepTime: "10 minutes",
      servings: 2,
      image: "🐉💪",
    },
    {
      name: "Firecracker Shrimp Lettuce Wraps",
      mood: "energetic",
      ingredients:
        "Large shrimp, Butter lettuce, Sriracha, Honey, Lime juice, Garlic, Ginger, Bell peppers, Crushed peanuts, Cilantro",
      instructions:
        "1. Make firecracker sauce with sriracha, honey, and lime. 2. Stir-fry shrimp with garlic and ginger. 3. Toss with sauce and peppers. 4. Serve in lettuce cups with peanuts and cilantro.",
      prepTime: "20 minutes",
      servings: 4,
      image: "🔥🥬",
    },
    // More Relaxed recipes
    {
      name: "Zen Garden Buddha Bowl",
      mood: "relaxed",
      ingredients:
        "Brown rice, Roasted sweet potato, Edamame, Purple cabbage, Cucumber ribbons, Pickled ginger, Sesame dressing, Furikake seasoning",
      instructions:
        "1. Cook brown rice. 2. Roast sweet potato cubes with olive oil at 400°F for 25 min. 3. Arrange all ingredients in a bowl mindfully. 4. Drizzle with sesame dressing and sprinkle furikake.",
      prepTime: "35 minutes",
      servings: 2,
      image: "🧘🥗",
    },
    {
      name: "Tuscan White Bean Soup",
      mood: "relaxed",
      ingredients:
        "Cannellini beans, Kale, Garlic, Rosemary, Thyme, Vegetable broth, Parmesan rind, Olive oil, Crusty bread",
      instructions:
        "1. Sauté garlic and herbs in olive oil. 2. Add beans and broth with parmesan rind. 3. Simmer 30 minutes. 4. Stir in chopped kale until wilted. 5. Serve with crusty bread and good olive oil.",
      prepTime: "45 minutes",
      servings: 6,
      image: "🫘🌿",
    },
    // More Adventurous recipes
    {
      name: "Miso Butter Ramen Burger",
      mood: "adventurous",
      ingredients:
        "Ramen noodles, Ground beef, Miso paste, Butter, Nori sheets, Soft-boiled egg, Japanese mayo, Sriracha, Green onions",
      instructions:
        "1. Form cooked ramen into buns and pan-fry until crispy. 2. Mix beef with miso and form patty. 3. Grill burger and top with miso butter. 4. Assemble with egg, mayo-sriracha, and green onions on ramen buns.",
      prepTime: "40 minutes",
      servings: 2,
      image: "🍜🍔",
    },
    {
      name: "Ethiopian Doro Wat with Injera",
      mood: "adventurous",
      ingredients:
        "Chicken thighs, Berbere spice, Red onions, Garlic, Ginger, Tomato paste, Hard-boiled eggs, Clarified butter, Injera flatbread",
      instructions:
        "1. Sauté onions until caramelized. 2. Add berbere, garlic, ginger, and tomato paste. 3. Add chicken and simmer 45 minutes. 4. Add peeled hard-boiled eggs and cook 10 more minutes. 5. Serve on injera.",
      prepTime: "90 minutes",
      servings: 4,
      image: "🇪🇹🍛",
    },
    {
      name: "Matcha Tiramisu",
      mood: "adventurous",
      ingredients:
        "Ladyfinger cookies, Mascarpone cheese, Eggs, Sugar, Matcha powder, Strong espresso, Cocoa powder, White chocolate shavings",
      instructions:
        "1. Whip egg yolks with sugar, fold in mascarpone. 2. Beat egg whites to stiff peaks and fold in. 3. Mix matcha with espresso. 4. Layer dipped ladyfingers with cream mixture. 5. Dust with matcha and cocoa, top with white chocolate.",
      prepTime: "30 minutes + chill time",
      servings: 8,
      image: "🍵🍰",
    },
  ];

  const stmt = db.prepare(
    "INSERT INTO recipes (name, mood, ingredients, instructions, prepTime, servings, image) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  recipes.forEach((recipe) => {
    stmt.run(
      recipe.name,
      recipe.mood,
      recipe.ingredients,
      recipe.instructions,
      recipe.prepTime,
      recipe.servings,
      recipe.image
    );
  });

  stmt.finalize();
  console.log("Database populated with recipes");
}

// Authentication Middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Admin Middleware
function requireAdmin(req, res, next) {
  if (req.session && req.session.userId && req.session.isAdmin) {
    return next();
  } else {
    res.status(403).json({ error: "Forbidden - Admin access required" });
  }
}

// Authentication Routes

// Login endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }

      if (match) {
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.isAdmin = user.is_admin === 1;
        res.json({
          success: true,
          email: user.email,
          isAdmin: user.is_admin === 1,
        });
      } else {
        res.status(401).json({ error: "Invalid email or password" });
      }
    });
  });
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    res.json({ success: true });
  });
});

// Check authentication status
app.get("/api/auth/status", (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      authenticated: true,
      email: req.session.userEmail,
      isAdmin: req.session.isAdmin || false,
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Admin Routes

// Get all recipes (admin only)
app.get("/api/admin/recipes", requireAdmin, (req, res) => {
  db.all("SELECT * FROM recipes ORDER BY mood, name", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new recipe (admin only)
app.post("/api/admin/recipes", requireAdmin, (req, res) => {
  const { name, mood, ingredients, instructions, prepTime, servings, image } =
    req.body;

  if (
    !name ||
    !mood ||
    !ingredients ||
    !instructions ||
    !prepTime ||
    !servings
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.run(
    "INSERT INTO recipes (name, mood, ingredients, instructions, prepTime, servings, image, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      mood,
      ingredients,
      instructions,
      prepTime,
      servings,
      image || "🍽️",
      1,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Error creating recipe" });
      }

      res.json({
        success: true,
        recipe: {
          id: this.lastID,
          name,
          mood,
          ingredients,
          instructions,
          prepTime,
          servings,
          image: image || "🍽️",
          active: 1,
        },
      });
    }
  );
});

// Update recipe (admin only)
app.put("/api/admin/recipes/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, mood, ingredients, instructions, prepTime, servings, image } =
    req.body;

  if (
    !name ||
    !mood ||
    !ingredients ||
    !instructions ||
    !prepTime ||
    !servings
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.run(
    "UPDATE recipes SET name = ?, mood = ?, ingredients = ?, instructions = ?, prepTime = ?, servings = ?, image = ? WHERE id = ?",
    [
      name,
      mood,
      ingredients,
      instructions,
      prepTime,
      servings,
      image || "🍽️",
      id,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Error updating recipe" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Recipe not found" });
      }

      res.json({
        success: true,
        recipe: {
          id: parseInt(id),
          name,
          mood,
          ingredients,
          instructions,
          prepTime,
          servings,
          image: image || "🍽️",
        },
      });
    }
  );
});

// Toggle recipe active status (admin only)
app.patch("/api/admin/recipes/:id/toggle", requireAdmin, (req, res) => {
  const { id } = req.params;

  // First get the current status
  db.get("SELECT active FROM recipes WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching recipe" });
    }

    if (!row) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Toggle the status
    const newStatus = row.active === 1 ? 0 : 1;

    db.run(
      "UPDATE recipes SET active = ? WHERE id = ?",
      [newStatus, id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: "Error updating recipe" });
        }

        res.json({
          success: true,
          active: newStatus,
          message: `Recipe ${
            newStatus === 1 ? "activated" : "deactivated"
          } successfully`,
        });
      }
    );
  });
});

// Create new user (admin only)
app.post("/api/admin/users", requireAdmin, (req, res) => {
  const { email, password, isAdmin } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Check if user already exists
  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }

      // Hash password and create user
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({ error: "Error creating user" });
        }

        db.run(
          "INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)",
          [email, hash, isAdmin ? 1 : 0],
          function (err) {
            if (err) {
              return res.status(500).json({ error: "Error creating user" });
            }

            res.json({
              success: true,
              user: {
                id: this.lastID,
                email: email,
                isAdmin: isAdmin ? true : false,
              },
            });
          }
        );
      });
    }
  );
});

// Get all users (admin only)
app.get("/api/admin/users", requireAdmin, (req, res) => {
  db.all(
    "SELECT id, email, is_admin, created_at FROM users ORDER BY created_at DESC",
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(
        rows.map((user) => ({
          ...user,
          isAdmin: user.is_admin === 1,
        }))
      );
    }
  );
});

// API Routes (Protected)

// Get a random recipe by mood (only active recipes)
app.get("/api/recipes/:mood", requireAuth, (req, res) => {
  const mood = req.params.mood;

  db.all(
    "SELECT * FROM recipes WHERE mood = ? AND active = 1 ORDER BY RANDOM()",
    [mood],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (rows.length === 0) {
        res.status(404).json({ error: "No recipes found for this mood" });
        return;
      }

      // Return the first random recipe
      res.json(rows[0]);
    }
  );
});

// Get all available moods (only from active recipes)
app.get("/api/moods", requireAuth, (req, res) => {
  db.all("SELECT DISTINCT mood FROM recipes WHERE active = 1", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map((row) => row.mood));
  });
});

// Serve login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Serve admin configuration page (admin only)
app.get("/admin", (req, res) => {
  if (req.session && req.session.userId && req.session.isAdmin) {
    res.sendFile(path.join(__dirname, "public", "admin.html"));
  } else if (req.session && req.session.userId) {
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

// Serve index.html for root route (protected)
app.get("/", (req, res) => {
  if (req.session && req.session.userId) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    res.redirect("/login");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Database connection closed");
    process.exit(0);
  });
});
