---
title: Your First Game
description: Build a complete game with sprite movement, collision, and game logic
---

# Your First Game

Now that you've completed the [Quick Start](quickstart.md), let's build a complete game from scratch. We'll create a simple but fun game where you control a player sprite, avoid obstacles, and collect coins.

## What You'll Build

By the end of this tutorial, you'll have:

- ✅ A movable player sprite
- ✅ Obstacle collision detection
- ✅ Collectible coins
- ✅ Score tracking
- ✅ Game over logic
- ✅ Proper scene lifecycle management
- ✅ Particle effects
- ✅ Smooth movement physics

**Estimated time:** 20-30 minutes

## Prerequisites

- Completed the [Quick Start](quickstart.md) guide
- Basic understanding of C# and OOP
- .NET 10 SDK installed

## Step 1: Project Setup

Create a new console application:

```bash
dotnet new console -n CoinCollector
cd CoinCollector
```

Add the Brine2D.Desktop package:

```bash
dotnet add package Brine2D.Desktop
```

## Step 2: Create the Game Scene

Replace `Program.cs` with this code:

```csharp
using Brine2D.Core;
using Brine2D.Engine;
using Brine2D.Hosting;
using Brine2D.Input;
using Brine2D.Input.SDL;
using Brine2D.Rendering;
using Brine2D.Rendering.SDL;
using Microsoft.Extensions.Logging;
using System.Numerics;

// Create builder
var builder = GameApplication.CreateBuilder(args);

// Configure services
builder.Services.AddSDL3Rendering(options =>
{
    options.WindowTitle = "Coin Collector";
    options.WindowWidth = 800;
    options.WindowHeight = 600;
    options.VSync = true;
});

builder.Services.AddSDL3Input();
builder.Services.AddScene<GameScene>();

// Build and run
var game = builder.Build();
await game.RunAsync<GameScene>();

// Game Scene
public class GameScene : Scene
{
    private readonly IRenderer _renderer;
    private readonly IInputService _input;
    private readonly IGameContext _gameContext;

    // Game state
    private Vector2 _playerPosition;
    private float _playerSpeed = 200f;
    private int _score = 0;
    private bool _isGameOver = false;

    // Game objects
    private readonly List<Vector2> _obstacles = new();
    private readonly List<Vector2> _coins = new();

    public GameScene(
        IRenderer renderer,
        IInputService input,
        IGameContext gameContext,
        ILogger<GameScene> logger
    ) : base(logger)
    {
        _renderer = renderer;
        _input = input;
        _gameContext = gameContext;
        _playerPosition = new Vector2(400, 300);
    }

    protected override void OnInitialize()
    {
        Logger.LogInformation("Coin Collector initialized!");
        
        // Create obstacles
        _obstacles.Add(new Vector2(200, 150));
        _obstacles.Add(new Vector2(600, 200));
        _obstacles.Add(new Vector2(300, 400));
        _obstacles.Add(new Vector2(500, 450));

        // Create coins
        _coins.Add(new Vector2(100, 100));
        _coins.Add(new Vector2(700, 100));
        _coins.Add(new Vector2(100, 500));
        _coins.Add(new Vector2(700, 500));
        _coins.Add(new Vector2(400, 50));
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        if (_isGameOver)
        {
            // Press R to restart
            if (_input.IsKeyPressed(Keys.R))
            {
                RestartGame();
            }

            if (_input.IsKeyPressed(Keys.Escape))
            {
                _gameContext.RequestExit();
            }
            return;
        }

        var deltaTime = (float)gameTime.DeltaTime;

        // Player movement
        var movement = Vector2.Zero;
        if (_input.IsKeyDown(Keys.W)) movement.Y -= 1;
        if (_input.IsKeyDown(Keys.S)) movement.Y += 1;
        if (_input.IsKeyDown(Keys.A)) movement.X -= 1;
        if (_input.IsKeyDown(Keys.D)) movement.X += 1;

        if (movement != Vector2.Zero)
        {
            movement = Vector2.Normalize(movement);
            _playerPosition += movement * _playerSpeed * deltaTime;

            // Keep player in bounds
            _playerPosition.X = Math.Clamp(_playerPosition.X, 20, 780);
            _playerPosition.Y = Math.Clamp(_playerPosition.Y, 20, 580);
        }

        // Check collision with obstacles
        foreach (var obstacle in _obstacles)
        {
            if (CheckCollision(_playerPosition, obstacle, 20, 30))
            {
                _isGameOver = true;
                Logger.LogInformation("Game Over! Final Score: {Score}", _score);
                return;
            }
        }

        // Check collision with coins
        for (int i = _coins.Count - 1; i >= 0; i--)
        {
            if (CheckCollision(_playerPosition, _coins[i], 20, 15))
            {
                _coins.RemoveAt(i);
                _score += 10;
                Logger.LogInformation("Coin collected! Score: {Score}", _score);

                // Win condition
                if (_coins.Count == 0)
                {
                    Logger.LogInformation("You Win! Final Score: {Score}", _score);
                    _isGameOver = true;
                }
            }
        }

        // Exit
        if (_input.IsKeyPressed(Keys.Escape))
        {
            _gameContext.RequestExit();
        }
    }

    protected override void OnRender(GameTime gameTime)
    {
        _renderer.Clear(new Color(20, 20, 30)); // Dark blue background
        _renderer.BeginFrame();

        if (!_isGameOver)
        {
            // Draw obstacles (red squares)
            foreach (var obstacle in _obstacles)
            {
                _renderer.DrawRectangle(
                    obstacle.X - 15, 
                    obstacle.Y - 15, 
                    30, 
                    30, 
                    new Color(200, 50, 50)
                );
            }

            // Draw coins (yellow circles - using squares for now)
            foreach (var coin in _coins)
            {
                _renderer.DrawRectangle(
                    coin.X - 7, 
                    coin.Y - 7, 
                    15, 
                    15, 
                    new Color(255, 215, 0)
                );
            }

            // Draw player (blue square)
            _renderer.DrawRectangle(
                _playerPosition.X - 10, 
                _playerPosition.Y - 10, 
                20, 
                20, 
                new Color(50, 150, 255)
            );

            // Draw score
            _renderer.DrawText($"Score: {_score}", 10, 10, Color.White);
            _renderer.DrawText($"Coins: {_coins.Count}", 10, 30, Color.White);
        }
        else
        {
            // Game over screen
            if (_coins.Count == 0)
            {
                _renderer.DrawText("YOU WIN!", 300, 250, new Color(0, 255, 0));
            }
            else
            {
                _renderer.DrawText("GAME OVER", 280, 250, new Color(255, 0, 0));
            }

            _renderer.DrawText($"Final Score: {_score}", 300, 300, Color.White);
            _renderer.DrawText("Press R to Restart", 270, 350, Color.White);
            _renderer.DrawText("Press ESC to Exit", 280, 380, Color.White);
        }

        _renderer.EndFrame();
    }

    private bool CheckCollision(Vector2 pos1, Vector2 pos2, float radius1, float radius2)
    {
        var distance = Vector2.Distance(pos1, pos2);
        return distance < (radius1 + radius2);
    }

    private void RestartGame()
    {
        _playerPosition = new Vector2(400, 300);
        _score = 0;
        _isGameOver = false;

        // Reset coins
        _coins.Clear();
        _coins.Add(new Vector2(100, 100));
        _coins.Add(new Vector2(700, 100));
        _coins.Add(new Vector2(100, 500));
        _coins.Add(new Vector2(700, 500));
        _coins.Add(new Vector2(400, 50));

        Logger.LogInformation("Game restarted!");
    }
}
```

## Step 3: Run Your Game

Build and run:

```bash
dotnet run
```

You should see:
- A blue square (player) in the center
- Red squares (obstacles) scattered around
- Yellow squares (coins) to collect
- Score counter at the top

### Controls:
- **WASD** - Move player
- **R** - Restart (when game over)
- **ESC** - Exit game

## Understanding the Code

Let's break down what we built:

### 1. Game State

```csharp
private Vector2 _playerPosition;
private float _playerSpeed = 200f;
private int _score = 0;
private bool _isGameOver = false;

private readonly List<Vector2> _obstacles = new();
private readonly List<Vector2> _coins = new();
```

We track the player's position, speed, score, and game state. Lists hold obstacle and coin positions.

### 2. Initialization

```csharp
protected override void OnInitialize()
{
    Logger.LogInformation("Coin Collector initialized!");
    
    // Create obstacles
    _obstacles.Add(new Vector2(200, 150));
    // ... more obstacles
    
    // Create coins
    _coins.Add(new Vector2(100, 100));
    // ... more coins
}
```

`OnInitialize()` runs once when the scene loads. We set up our game world here.

### 3. Update Loop

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    var deltaTime = (float)gameTime.DeltaTime;
    
    // Player movement
    var movement = Vector2.Zero;
    if (_input.IsKeyDown(Keys.W)) movement.Y -= 1;
    // ... handle input
    
    _playerPosition += movement * _playerSpeed * deltaTime;
    
    // Check collisions
    // ... collision logic
}
```

`OnUpdate()` runs every frame. We:

1. Get input
2. Move the player
3. Check collisions
4. Update game state

**Key concept:** We multiply movement by `deltaTime` to make it frame-rate independent.

### 4. Render Loop

```csharp
protected override void OnRender(GameTime gameTime)
{
    _renderer.Clear(new Color(20, 20, 30));
    _renderer.BeginFrame();
    
    // Draw game objects
    _renderer.DrawRectangle(...);
    
    _renderer.EndFrame();
}
```

`OnRender()` draws everything. Always call:

1. `Clear()` - Clear the screen
2. `BeginFrame()` - Start drawing
3. Draw your stuff
4. `EndFrame()` - Present to screen

### 5. Collision Detection

```csharp
private bool CheckCollision(Vector2 pos1, Vector2 pos2, float radius1, float radius2)
{
    var distance = Vector2.Distance(pos1, pos2);
    return distance < (radius1 + radius2);
}
```

Simple circle-circle collision using distance between centers.

## Step 4: Enhance Your Game

Now let's make it better! We'll add particle effects, a timer, and smooth movement physics.

### Add Particle Effects on Coin Collection

Add this `Particle` class after the `GameScene` class:

```csharp
public class Particle
{
    public Vector2 Position;
    public Vector2 Velocity;
    public float Lifetime;
    public Color Color;
}
```

In the `GameScene` class, add a field to track particles:

```csharp
private readonly List<Particle> _particles = new();
```

Update the coin collection code in `OnUpdate()`:

```csharp
// Check collision with coins
for (int i = _coins.Count - 1; i >= 0; i--)
{
    if (CheckCollision(_playerPosition, _coins[i], 20, 15))
    {
        // Spawn particles
        for (int p = 0; p < 5; p++)
        {
            _particles.Add(new Particle
            {
                Position = _coins[i],
                Velocity = new Vector2(
                    Random.Shared.NextSingle() * 100 - 50,
                    Random.Shared.NextSingle() * 100 - 50
                ),
                Lifetime = 1.0f,
                Color = new Color(255, 215, 0)
            });
        }
        
        _coins.RemoveAt(i);
        _score += 10;
        Logger.LogInformation("Coin collected! Score: {Score}", _score);

        // Win condition
        if (_coins.Count == 0)
        {
            Logger.LogInformation("You Win! Final Score: {Score}", _score);
            _isGameOver = true;
        }
    }
}
```

Add particle update logic in `OnUpdate()` (after player movement):

```csharp
// Update particles
for (int i = _particles.Count - 1; i >= 0; i--)
{
    var p = _particles[i];
    p.Position += p.Velocity * deltaTime;
    p.Lifetime -= deltaTime;
    
    if (p.Lifetime <= 0)
    {
        _particles.RemoveAt(i);
    }
}
```

Add particle rendering in `OnRender()` (after drawing coins):

```csharp
// Draw particles
foreach (var p in _particles)
{
    var alpha = (byte)(255 * (p.Lifetime / 1.0f));
    _renderer.DrawRectangle(
        p.Position.X - 2, 
        p.Position.Y - 2, 
        4, 
        4, 
        new Color(p.Color.R, p.Color.G, p.Color.B, alpha)
    );
}
```

### Add a Timer

Add a field to track game time:

```csharp
private double _gameTime = 0;
```

In `OnUpdate()`, add this before checking input (when not game over):

```csharp
_gameTime += gameTime.DeltaTime;
```

In `OnRender()`, add this after drawing the coins count:

```csharp
_renderer.DrawText($"Time: {(int)_gameTime}s", 10, 50, Color.White);
```

Don't forget to reset the timer in `RestartGame()`:

```csharp
_gameTime = 0;
```

### Add Smooth Movement

Add fields for velocity-based movement:

```csharp
private Vector2 _velocity = Vector2.Zero;
private float _acceleration = 500f;
private float _friction = 0.9f;
```

Replace the player movement code in `OnUpdate()`:

```csharp
// Player movement with physics
var input = Vector2.Zero;
if (_input.IsKeyDown(Keys.W)) input.Y -= 1;
if (_input.IsKeyDown(Keys.S)) input.Y += 1;
if (_input.IsKeyDown(Keys.A)) input.X -= 1;
if (_input.IsKeyDown(Keys.D)) input.X += 1;

if (input != Vector2.Zero)
{
    input = Vector2.Normalize(input);
    _velocity += input * _acceleration * deltaTime;
}

// Apply friction
_velocity *= _friction;

// Move player
_playerPosition += _velocity * deltaTime;

// Keep player in bounds
_playerPosition.X = Math.Clamp(_playerPosition.X, 20, 780);
_playerPosition.Y = Math.Clamp(_playerPosition.Y, 20, 580);
```

Reset velocity in `RestartGame()`:

```csharp
_velocity = Vector2.Zero;
```

## Complete Code with All Enhancements

Here's the full `Program.cs` with all enhancements integrated:

```csharp
using Brine2D.Core;
using Brine2D.Engine;
using Brine2D.Hosting;
using Brine2D.Input;
using Brine2D.Input.SDL;
using Brine2D.Rendering;
using Brine2D.Rendering.SDL;
using Microsoft.Extensions.Logging;
using System.Numerics;

// Create builder
var builder = GameApplication.CreateBuilder(args);

// Configure services
builder.Services.AddSDL3Rendering(options =>
{
    options.WindowTitle = "Coin Collector";
    options.WindowWidth = 800;
    options.WindowHeight = 600;
    options.VSync = true;
});

builder.Services.AddSDL3Input();
builder.Services.AddScene<GameScene>();

// Build and run
var game = builder.Build();
await game.RunAsync<GameScene>();

// Game Scene
public class GameScene : Scene
{
    private readonly IRenderer _renderer;
    private readonly IInputService _input;
    private readonly IGameContext _gameContext;

    // Game state
    private Vector2 _playerPosition;
    private Vector2 _velocity = Vector2.Zero;
    private float _playerSpeed = 200f;
    private float _acceleration = 500f;
    private float _friction = 0.9f;
    private int _score = 0;
    private double _gameTime = 0;
    private bool _isGameOver = false;

    // Game objects
    private readonly List<Vector2> _obstacles = new();
    private readonly List<Vector2> _coins = new();
    private readonly List<Particle> _particles = new();

    public GameScene(
        IRenderer renderer,
        IInputService input,
        IGameContext gameContext,
        ILogger<GameScene> logger
    ) : base(logger)
    {
        _renderer = renderer;
        _input = input;
        _gameContext = gameContext;
        _playerPosition = new Vector2(400, 300);
    }

    protected override void OnInitialize()
    {
        Logger.LogInformation("Coin Collector initialized!");
        
        // Create obstacles
        _obstacles.Add(new Vector2(200, 150));
        _obstacles.Add(new Vector2(600, 200));
        _obstacles.Add(new Vector2(300, 400));
        _obstacles.Add(new Vector2(500, 450));

        // Create coins
        _coins.Add(new Vector2(100, 100));
        _coins.Add(new Vector2(700, 100));
        _coins.Add(new Vector2(100, 500));
        _coins.Add(new Vector2(700, 500));
        _coins.Add(new Vector2(400, 50));
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        if (_isGameOver)
        {
            // Press R to restart
            if (_input.IsKeyPressed(Keys.R))
            {
                RestartGame();
            }

            if (_input.IsKeyPressed(Keys.Escape))
            {
                _gameContext.RequestExit();
            }
            return;
        }

        var deltaTime = (float)gameTime.DeltaTime;

        // Update game time
        _gameTime += gameTime.DeltaTime;

        // Player movement with physics
        var input = Vector2.Zero;
        if (_input.IsKeyDown(Keys.W)) input.Y -= 1;
        if (_input.IsKeyDown(Keys.S)) input.Y += 1;
        if (_input.IsKeyDown(Keys.A)) input.X -= 1;
        if (_input.IsKeyDown(Keys.D)) input.X += 1;

        if (input != Vector2.Zero)
        {
            input = Vector2.Normalize(input);
            _velocity += input * _acceleration * deltaTime;
        }

        // Apply friction
        _velocity *= _friction;

        // Move player
        _playerPosition += _velocity * deltaTime;

        // Keep player in bounds
        _playerPosition.X = Math.Clamp(_playerPosition.X, 20, 780);
        _playerPosition.Y = Math.Clamp(_playerPosition.Y, 20, 580);

        // Update particles
        for (int i = _particles.Count - 1; i >= 0; i--)
        {
            var p = _particles[i];
            p.Position += p.Velocity * deltaTime;
            p.Lifetime -= deltaTime;
            
            if (p.Lifetime <= 0)
            {
                _particles.RemoveAt(i);
            }
        }

        // Check collision with obstacles
        foreach (var obstacle in _obstacles)
        {
            if (CheckCollision(_playerPosition, obstacle, 20, 30))
            {
                _isGameOver = true;
                Logger.LogInformation("Game Over! Final Score: {Score}", _score);
                return;
            }
        }

        // Check collision with coins
        for (int i = _coins.Count - 1; i >= 0; i--)
        {
            if (CheckCollision(_playerPosition, _coins[i], 20, 15))
            {
                // Spawn particles
                for (int p = 0; p < 5; p++)
                {
                    _particles.Add(new Particle
                    {
                        Position = _coins[i],
                        Velocity = new Vector2(
                            Random.Shared.NextSingle() * 100 - 50,
                            Random.Shared.NextSingle() * 100 - 50
                        ),
                        Lifetime = 1.0f,
                        Color = new Color(255, 215, 0)
                    });
                }
                
                _coins.RemoveAt(i);
                _score += 10;
                Logger.LogInformation("Coin collected! Score: {Score}", _score);

                // Win condition
                if (_coins.Count == 0)
                {
                    Logger.LogInformation("You Win! Final Score: {Score}", _score);
                    _isGameOver = true;
                }
            }
        }

        // Exit
        if (_input.IsKeyPressed(Keys.Escape))
        {
            _gameContext.RequestExit();
        }
    }

    protected override void OnRender(GameTime gameTime)
    {
        _renderer.Clear(new Color(20, 20, 30)); // Dark blue background
        _renderer.BeginFrame();

        if (!_isGameOver)
        {
            // Draw obstacles (red squares)
            foreach (var obstacle in _obstacles)
            {
                _renderer.DrawRectangle(
                    obstacle.X - 15, 
                    obstacle.Y - 15, 
                    30, 
                    30, 
                    new Color(200, 50, 50)
                );
            }

            // Draw coins (yellow squares)
            foreach (var coin in _coins)
            {
                _renderer.DrawRectangle(
                    coin.X - 7, 
                    coin.Y - 7, 
                    15, 
                    15, 
                    new Color(255, 215, 0)
                );
            }

            // Draw particles
            foreach (var p in _particles)
            {
                var alpha = (byte)(255 * (p.Lifetime / 1.0f));
                _renderer.DrawRectangle(
                    p.Position.X - 2, 
                    p.Position.Y - 2, 
                    4, 
                    4, 
                    new Color(p.Color.R, p.Color.G, p.Color.B, alpha)
                );
            }

            // Draw player (blue square)
            _renderer.DrawRectangle(
                _playerPosition.X - 10, 
                _playerPosition.Y - 10, 
                20, 
                20, 
                new Color(50, 150, 255)
            );

            // Draw HUD
            _renderer.DrawText($"Score: {_score}", 10, 10, Color.White);
            _renderer.DrawText($"Coins: {_coins.Count}", 10, 30, Color.White);
            _renderer.DrawText($"Time: {(int)_gameTime}s", 10, 50, Color.White);
        }
        else
        {
            // Game over screen
            if (_coins.Count == 0)
            {
                _renderer.DrawText("YOU WIN!", 300, 250, new Color(0, 255, 0));
            }
            else
            {
                _renderer.DrawText("GAME OVER", 280, 250, new Color(255, 0, 0));
            }

            _renderer.DrawText($"Final Score: {_score}", 300, 300, Color.White);
            _renderer.DrawText($"Time: {(int)_gameTime}s", 320, 330, Color.White);
            _renderer.DrawText("Press R to Restart", 270, 380, Color.White);
            _renderer.DrawText("Press ESC to Exit", 280, 410, Color.White);
        }

        _renderer.EndFrame();
    }

    private bool CheckCollision(Vector2 pos1, Vector2 pos2, float radius1, float radius2)
    {
        var distance = Vector2.Distance(pos1, pos2);
        return distance < (radius1 + radius2);
    }

    private void RestartGame()
    {
        _playerPosition = new Vector2(400, 300);
        _velocity = Vector2.Zero;
        _score = 0;
        _gameTime = 0;
        _isGameOver = false;

        // Reset coins
        _coins.Clear();
        _coins.Add(new Vector2(100, 100));
        _coins.Add(new Vector2(700, 100));
        _coins.Add(new Vector2(100, 500));
        _coins.Add(new Vector2(700, 500));
        _coins.Add(new Vector2(400, 50));

        // Clear particles
        _particles.Clear();

        Logger.LogInformation("Game restarted!");
    }
}

// Particle class
public class Particle
{
    public Vector2 Position;
    public Vector2 Velocity;
    public float Lifetime;
    public Color Color;
}
```

## What You've Learned

✅ **Scene lifecycle** - `OnInitialize()`, `OnUpdate()`, `OnRender()`  
✅ **Input handling** - Keyboard input with `IInputService`  
✅ **Game state** - Managing player, obstacles, and collectibles  
✅ **Collision detection** - Simple circle-based collision  
✅ **Game flow** - Win/lose conditions and restart logic  
✅ **Delta time** - Frame-rate independent movement  
✅ **Rendering** - Drawing shapes and text  
✅ **Logging** - Using `ILogger<T>` for debugging  
✅ **Particle systems** - Simple particle effects  
✅ **Physics** - Velocity-based movement with friction  

## Next Steps

Now that you have a complete game, you can:

- [Learn about Sprites](../guides/rendering/sprites-and-textures.md) - Replace shapes with actual graphics
- [Add Animations](../guides/rendering/animation.md) - Animate your player character
- [Use the Collision System](../guides/collision/basics.md) - More robust collision detection
- [Add Audio](../guides/audio/basics.md) - Sound effects and music

---

**Congratulations!** You've built your first complete game with Brine2D. You now understand the core concepts and are ready to build more complex games.