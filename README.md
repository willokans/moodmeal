# 🍽️ MoodMeal

A simple and beautiful web application that recommends recipes based on your current mood! Built with Express, SQLite, and vanilla JavaScript with Tailwind CSS.

**Production-Ready Features**: User authentication, admin panel, recipe management, and comprehensive test coverage.

## Features

- 🔐 **User Authentication**: Secure login system with encrypted passwords
- 👑 **Admin Panel**: Full admin interface for managing recipes and users
- 🎭 **5 Different Moods**: Happy, Sad, Energetic, Relaxed, and Adventurous
- 🎲 **Random Recipe Selection**: Get a different recipe each time
- 🔄 **Easy Navigation**: Request new recipes or change your mood
- 💅 **Beautiful UI**: Modern design with Tailwind CSS
- 📱 **Responsive**: Works great on all devices
- 🍽️ **26 Unique Recipes**: Diverse collection of creative recipes
- ⚙️ **User Management**: Admins can create new users and assign roles
- ✏️ **Recipe Management**: Full create, read, update functionality for recipes (admin only)
- 🔄 **Soft Delete**: Toggle recipes active/inactive instead of permanent deletion

## Tech Stack

- **Backend**: Node.js + Express
- **Authentication**: Express-session + Bcrypt
- **Database**: SQLite3
- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **No Build Tools**: Simple and straightforward setup

## Installation

1. **Clone or download this repository**

2. **Install dependencies**:

```bash
npm install
```

## Running the App

1. **Start the server**:

```bash
npm start
```

2. **Open your browser** and navigate to:

```
http://localhost:3000
```

That's it! The app will automatically:

- Create the SQLite database
- Create the users table
- Create a test account
- Populate it with 26 mood-based recipes
- Serve the frontend

## Running Tests

This project includes a comprehensive test suite with 74 unit tests covering all major functionality.

**Run all tests**:

```bash
npm test
```

**Run tests in watch mode**:

```bash
npm run test:watch
```

**Test coverage includes**:

- ✅ Authentication and authorization
- ✅ Recipe CRUD operations
- ✅ User management
- ✅ Active/inactive toggle functionality
- ✅ Data validation
- ✅ Error handling
- ✅ Session management
- ✅ Integration workflows

For more details about the test suite, see the [tests README](tests/README.md).

## Usage

### First Time Login

When you first access the app, you'll be directed to the login page.

**Test Account Credentials:**

Regular User:

- **Email**: test@user.com
- **Password**: test

Admin User:

- **Email**: admin@user.com
- **Password**: admin

### Using the App

**For Regular Users:**

1. **Login**: Enter your credentials on the login page
2. **Select Your Mood**: Click on one of the five mood cards (Happy, Sad, Energetic, Relaxed, or Adventurous)
3. **Get Recipe**: Click the "Get Recipe" button to receive a recipe recommendation
4. **Try Another**: Don't like the recipe? Click "Try Another Recipe" for a different one
5. **Change Mood**: Want to explore a different mood? Click "Change Mood" to go back
6. **Logout**: Click the "Logout" button in the header when you're done

**For Admin Users:**

1. **Access Admin Panel**: After logging in, click the "⚙️ Admin" button in the header
2. **Manage Recipes**:
   - **View All Recipes**: See all recipes organized by mood (both active and inactive)
   - **Create New Recipe**: Click "➕ Create New Recipe" button to add a new recipe
   - **Edit Recipe**: Click the "✏️ Edit" button on any recipe to modify it
   - **Toggle Active Status**: Use the checkbox in the "Active" column to activate/deactivate recipes
     - Active recipes (✓) are visible to all users
     - Inactive recipes (unchecked) are hidden from regular users but visible to admins
     - Inactive recipes appear dimmed with an "(Inactive)" label
3. **Add New Users**: Create new user accounts and assign admin privileges
4. **Manage Users**: View all existing users and their roles

## Database

The app uses SQLite with the following schema:

- **recipes** table:

  - id (INTEGER PRIMARY KEY)
  - name (TEXT)
  - mood (TEXT)
  - ingredients (TEXT)
  - instructions (TEXT)
  - prepTime (TEXT)
  - servings (INTEGER)
  - image (TEXT)
  - active (INTEGER, 1=active, 0=inactive)

- **users** table:
  - id (INTEGER PRIMARY KEY)
  - email (TEXT UNIQUE)
  - password (TEXT - bcrypt hashed)
  - created_at (DATETIME)

The database comes pre-populated with:

- 26 unique recipes (5+ per mood)
- 2 test accounts:
  - Regular user: test@user.com / test
  - Admin user: admin@user.com / admin

## API Endpoints

### Authentication Endpoints

- `POST /api/login` - Login with email and password
- `POST /api/logout` - Logout current user
- `GET /api/auth/status` - Check authentication status

### Recipe Endpoints (Protected)

- `GET /api/recipes/:mood` - Get a random recipe for a specific mood
- `GET /api/moods` - Get list of all available moods

### Admin Endpoints (Admin Only)

- `GET /api/admin/recipes` - Get all recipes (including inactive)
- `POST /api/admin/recipes` - Create a new recipe
- `PUT /api/admin/recipes/:id` - Update a recipe
- `PATCH /api/admin/recipes/:id/toggle` - Toggle recipe active status
- `POST /api/admin/users` - Create a new user
- `GET /api/admin/users` - Get all users

**Note**: Regular users only see recipes where `active = 1`

## Project Structure

```
moodmeal/
├── server.js           # Express server and API routes
├── package.json        # Dependencies and scripts
├── recipes.db          # SQLite database (created automatically)
├── public/
│   ├── index.html     # Main app HTML
│   ├── app.js         # Main app JavaScript
│   ├── login.html     # Login page HTML
│   ├── login.js       # Login page JavaScript
│   ├── admin.html     # Admin configuration page HTML
│   └── admin.js       # Admin page JavaScript
├── tests/              # Unit tests
│   ├── auth.test.js        # Authentication tests
│   ├── recipes.test.js     # Recipe CRUD tests
│   ├── users.test.js       # User management tests
│   ├── toggle.test.js      # Active/inactive toggle tests
│   ├── integration.test.js # Integration tests
│   └── README.md           # Test documentation
└── README.md          # This file
```

## Customization

### Adding More Recipes

You can add more recipes by modifying the `populateRecipes()` function in `server.js`. Each recipe should have:

```javascript
{
  name: 'Recipe Name',
  mood: 'happy|sad|energetic|relaxed|adventurous',
  ingredients: 'Comma-separated list of ingredients',
  instructions: '1. Step one. 2. Step two. 3. Step three.',
  prepTime: '30 minutes',
  servings: 4,
  image: '🍕' // Emoji representation
}
```

### Changing the Port

Modify the `PORT` variable in `server.js`:

```javascript
const PORT = 3000; // Change to your preferred port
```

## License

ISC

## Enjoy!

Have fun finding the perfect recipe for your mood! 😊
