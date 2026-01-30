---
title: Your First Game
description: Build a complete game with sprites, audio, collision detection, and scoring
---

# Your First Game

Build a complete game from scratch in 30 minutes. You'll create an asteroid dodging game with sprites, audio, collision detection, and scoring.

## What You'll Build

**Asteroid Dodge** - A simple but complete game where you:
- Control a spaceship with WASD or arrow keys
- Dodge incoming asteroids
- Collect power-ups for bonus points
- Compete for a high score

**What you'll learn:**
- Loading and displaying sprites
- Handling player input
- Collision detection
- Playing sound effects
- Score tracking
- Game state management

---

## Prerequisites

Before starting:

- ✅ Completed [Quick Start](quickstart.md)
- ✅ Basic C# knowledge
- ✅ 30 minutes

---

## Step 1: Project Setup

Create a new project:

~~~sh
dotnet new console -n AsteroidDodge
cd AsteroidDodge
dotnet add package Brine2D --version 0.9.0-beta
dotnet add package Brine2D.SDL --version 0.9.0-beta
~~~

Create folder structure:

~~~sh
mkdir Assets
mkdir Assets/Sprites
mkdir Assets/Sounds
~~~

**Download assets** (or create your own):
- `player.png` - 32x32 spaceship sprite
- `asteroid.png` - 32x32 asteroid sprite
- `powerup.png` - 32x32 star sprite
- `explosion.wav` - Collision sound effect
- `collect.wav` - Power-up collection sound

---

## Step 2: Program Setup

Replace `Program.cs`:

~~~csharp
using Brine2D.Hosting;
using Brine2D.SDL;

var builder = GameApplication.CreateBuilder(args);

builder.Services.AddBrine2D(options =>
{
    options.WindowTitle = "Asteroid Dodge";
    options.WindowWidth = 800;
    options.WindowHeight = 600;
});

// Register our game scene
builder.Services.AddScene<GameScene>();

var game = builder.Build();
await game.RunAsync<GameScene>();
~~~

---

## Step 3: Game State Service

Create `GameState.cs` - a **singleton service** for persistent data:

~~~csharp
public class GameState
{
    public int Score { get; set; }
    public int HighScore { get; set; }
    public bool IsGameOver { get; set; }
    
    public void Reset()
    {
        Score = 0;
        IsGameOver = false;
    }
    
    public void AddScore(int points)
    {
        Score += points;
        if (Score > HighScore)
        {
            HighScore = Score;
        }
    }
}
~~~

Register it in `Program.cs`:

~~~csharp
// Add this after AddBrine2D
builder.Services.AddSingleton<GameState>();
~~~

**Why singleton?** The game state persists across scenes (menu → game → game over), so it needs to survive scene changes.

---

## Step 4: Game Scene

Create `GameScene.cs`:

~~~csharp
using System.Numerics;
using Brine2D.Core;
using Brine2D.ECS;
using Brine2D.ECS.Components;
using Brine2D.Engine;
using Brine2D.Input;
using Brine2D.Audio;

public class GameScene : Scene
{
    // YOUR services (injected via constructor)
    private readonly IInputContext _input;
    private readonly IAudioService _audio;
    private readonly GameState _gameState;
    
    // Framework properties available automatically:
    // - Logger
    // - World (scoped per scene!)
    // - Renderer
    
    // Game state
    private Entity? _player;
    private readonly List<Entity> _asteroids = new();
    private readonly List<Entity> _powerups = new();
    
    private ITexture? _playerTexture;
    private ITexture? _asteroidTexture;
    private ITexture? _powerupTexture;
    
    private ISoundEffect? _explosionSound;
    private ISoundEffect? _collectSound;
    
    private readonly Random _random = new();
    private float _spawnTimer = 0f;
    private const float SpawnInterval = 1.5f;

    // ✅ Clean! Only inject YOUR dependencies
    public GameScene(
        IInputContext input,
        IAudioService audio,
        GameState gameState)
    {
        _input = input;
        _audio = audio;
        _gameState = gameState;
    }

    protected override Task OnInitializeAsync(CancellationToken ct)
    {
        // Reset game state
        _gameState.Reset();
        
        Logger.LogInformation("Game scene initialized");
        return Task.CompletedTask;
    }

    protected override async Task OnLoadAsync(CancellationToken ct)
    {
        // Load textures
        _playerTexture = await LoadTextureAsync("Assets/Sprites/player.png", ct);
        _asteroidTexture = await LoadTextureAsync("Assets/Sprites/asteroid.png", ct);
        _powerupTexture = await LoadTextureAsync("Assets/Sprites/powerup.png", ct);
        
        // Load sounds
        _explosionSound = await _audio.LoadSoundAsync("Assets/Sounds/explosion.wav", ct);
        _collectSound = await _audio.LoadSoundAsync("Assets/Sounds/collect.wav", ct);
        
        // Create player entity
        CreatePlayer();
        
        Logger.LogInformation("Assets loaded, {EntityCount} entities created", 
            World.Entities.Count);
    }

    private void CreatePlayer()
    {
        // World is available automatically (scoped per scene!)
        _player = World.CreateEntity("Player");
        
        var transform = _player.AddComponent<TransformComponent>();
        transform.Position = new Vector2(400, 300);
        
        var sprite = _player.AddComponent<SpriteComponent>();
        sprite.Texture = _playerTexture;
        sprite.Width = 32;
        sprite.Height = 32;
        
        _player.AddTag("Player");
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        if (_gameState.IsGameOver)
        {
            // Handle game over input
            if (_input.IsKeyPressed(Key.R))
            {
                _gameState.Reset();
                RestartGame();
            }
            return;
        }

        var deltaTime = (float)gameTime.DeltaTime;
        
        // Update player
        UpdatePlayer(deltaTime);
        
        // Update asteroids
        UpdateAsteroids(deltaTime);
        
        // Update power-ups
        UpdatePowerups(deltaTime);
        
        // Spawn new objects
        UpdateSpawning(deltaTime);
        
        // Check collisions
        CheckCollisions();
    }

    private void UpdatePlayer(float deltaTime)
    {
        if (_player == null) return;
        
        var transform = _player.GetComponent<TransformComponent>();
        if (transform == null) return;
        
        const float speed = 300f;
        var movement = Vector2.Zero;
        
        if (_input.IsKeyDown(Key.W) || _input.IsKeyDown(Key.Up))
            movement.Y -= 1;
        if (_input.IsKeyDown(Key.S) || _input.IsKeyDown(Key.Down))
            movement.Y += 1;
        if (_input.IsKeyDown(Key.A) || _input.IsKeyDown(Key.Left))
            movement.X -= 1;
        if (_input.IsKeyDown(Key.D) || _input.IsKeyDown(Key.Right))
            movement.X += 1;
        
        if (movement != Vector2.Zero)
        {
            movement = Vector2.Normalize(movement);
            transform.Position += movement * speed * deltaTime;
        }
        
        // Clamp to screen bounds
        transform.Position = new Vector2(
            Math.Clamp(transform.Position.X, 16, Renderer.Width - 16),
            Math.Clamp(transform.Position.Y, 16, Renderer.Height - 16)
        );
    }

    private void UpdateAsteroids(float deltaTime)
    {
        for (int i = _asteroids.Count - 1; i >= 0; i--)
        {
            var asteroid = _asteroids[i];
            var transform = asteroid.GetComponent<TransformComponent>();
            
            // Move downward
            transform.Position += new Vector2(0, 200f * deltaTime);
            
            // Remove if off-screen
            if (transform.Position.Y > Renderer.Height + 32)
            {
                World.DestroyEntity(asteroid);
                _asteroids.RemoveAt(i);
            }
        }
    }

    private void UpdatePowerups(float deltaTime)
    {
        for (int i = _powerups.Count - 1; i >= 0; i--)
        {
            var powerup = _powerups[i];
            var transform = powerup.GetComponent<TransformComponent>();
            
            // Move downward slower
            transform.Position += new Vector2(0, 150f * deltaTime);
            
            // Remove if off-screen
            if (transform.Position.Y > Renderer.Height + 32)
            {
                World.DestroyEntity(powerup);
                _powerups.RemoveAt(i);
            }
        }
    }

    private void UpdateSpawning(float deltaTime)
    {
        _spawnTimer += deltaTime;
        
        if (_spawnTimer >= SpawnInterval)
        {
            _spawnTimer = 0f;
            
            // 70% chance asteroid, 30% chance power-up
            if (_random.NextDouble() < 0.7)
                SpawnAsteroid();
            else
                SpawnPowerup();
        }
    }

    private void SpawnAsteroid()
    {
        var asteroid = World.CreateEntity("Asteroid");
        
        var transform = asteroid.AddComponent<TransformComponent>();
        transform.Position = new Vector2(
            _random.Next(32, Renderer.Width - 32),
            -32
        );
        
        var sprite = asteroid.AddComponent<SpriteComponent>();
        sprite.Texture = _asteroidTexture;
        sprite.Width = 32;
        sprite.Height = 32;
        
        asteroid.AddTag("Asteroid");
        _asteroids.Add(asteroid);
    }

    private void SpawnPowerup()
    {
        var powerup = World.CreateEntity("Powerup");
        
        var transform = powerup.AddComponent<TransformComponent>();
        transform.Position = new Vector2(
            _random.Next(32, Renderer.Width - 32),
            -32
        );
        
        var sprite = powerup.AddComponent<SpriteComponent>();
        sprite.Texture = _powerupTexture;
        sprite.Width = 32;
        sprite.Height = 32;
        
        powerup.AddTag("Powerup");
        _powerups.Add(powerup);
    }

    private void CheckCollisions()
    {
        if (_player == null) return;
        
        var playerTransform = _player.GetComponent<TransformComponent>();
        if (playerTransform == null) return;
        
        // Check asteroid collisions
        foreach (var asteroid in _asteroids.ToList())
        {
            var asteroidTransform = asteroid.GetComponent<TransformComponent>();
            
            if (CheckCircleCollision(
                playerTransform.Position, 16,
                asteroidTransform.Position, 16))
            {
                // Game over!
                _audio.PlaySound(_explosionSound);
                _gameState.IsGameOver = true;
                Logger.LogInformation("Game Over! Final Score: {Score}", _gameState.Score);
                return;
            }
        }
        
        // Check power-up collisions
        for (int i = _powerups.Count - 1; i >= 0; i--)
        {
            var powerup = _powerups[i];
            var powerupTransform = powerup.GetComponent<TransformComponent>();
            
            if (CheckCircleCollision(
                playerTransform.Position, 16,
                powerupTransform.Position, 16))
            {
                // Collect power-up
                _audio.PlaySound(_collectSound);
                _gameState.AddScore(10);
                
                World.DestroyEntity(powerup);
                _powerups.RemoveAt(i);
            }
        }
        
        // Increase score for surviving
        _gameState.AddScore(1);
    }

    private bool CheckCircleCollision(Vector2 pos1, float radius1, Vector2 pos2, float radius2)
    {
        var distance = Vector2.Distance(pos1, pos2);
        return distance < radius1 + radius2;
    }

    private void RestartGame()
    {
        // Clear all entities manually for restart
        foreach (var asteroid in _asteroids.ToList())
        {
            World.DestroyEntity(asteroid);
        }
        _asteroids.Clear();
        
        foreach (var powerup in _powerups.ToList())
        {
            World.DestroyEntity(powerup);
        }
        _powerups.Clear();
        
        // Recreate player
        if (_player != null)
        {
            World.DestroyEntity(_player);
        }
        CreatePlayer();
        
        _spawnTimer = 0f;
    }

    protected override void OnRender(GameTime gameTime)
    {
        // Set background color
        Renderer.ClearColor = Color.FromArgb(10, 10, 20);
        
        // Draw UI
        if (_gameState.IsGameOver)
        {
            Renderer.DrawText("GAME OVER", Renderer.Width / 2 - 100, Renderer.Height / 2 - 40, 
                Color.Red, 32);
            Renderer.DrawText($"Final Score: {_gameState.Score}", Renderer.Width / 2 - 100, 
                Renderer.Height / 2, Color.White, 24);
            Renderer.DrawText($"High Score: {_gameState.HighScore}", Renderer.Width / 2 - 100, 
                Renderer.Height / 2 + 30, Color.Yellow, 24);
            Renderer.DrawText("Press R to Restart", Renderer.Width / 2 - 120, 
                Renderer.Height / 2 + 70, Color.White, 20);
        }
        else
        {
            Renderer.DrawText($"Score: {_gameState.Score}", 10, 10, Color.White, 20);
            Renderer.DrawText($"High Score: {_gameState.HighScore}", 10, 35, Color.Yellow, 16);
        }
        
        // Entities are rendered automatically by ECS rendering system!
    }

    protected override Task OnUnloadAsync(CancellationToken ct)
    {
        Logger.LogInformation("Game scene unloading");
        
        // ✅ No need to cleanup entities - World is disposed automatically!
        // All entities destroyed when scene ends
        
        return Task.CompletedTask;
    }
}
~~~

---

## Understanding the Code

### Property Injection Pattern

~~~csharp
public class GameScene : Scene
{
    // ✅ Only YOUR dependencies in constructor
    public GameScene(
        IInputContext input,
        IAudioService audio,
        GameState gameState)
    {
        _input = input;
        _audio = audio;
        _gameState = gameState;
    }
    
    protected override async Task OnLoadAsync(CancellationToken ct)
    {
        // ✅ Framework properties available automatically!
        Logger.LogInformation("Loading assets");
        var player = World.CreateEntity("Player");
        _texture = await LoadTextureAsync("player.png", ct);
    }
}
~~~

**Pattern:**
- Constructor: Inject **YOUR** services
- Lifecycle methods: Use **framework** properties (Logger, World, Renderer)

---

### Scoped World Pattern

~~~csharp
protected override async Task OnLoadAsync(CancellationToken ct)
{
    // World is fresh and empty when scene loads!
    var player = World.CreateEntity("Player");
    var enemy = World.CreateEntity("Enemy");
    
    Logger.LogInformation("Created {Count} entities", World.Entities.Count); // 2
}

protected override Task OnUnloadAsync(CancellationToken ct)
{
    // ✅ No cleanup needed!
    // When scene ends, World is disposed automatically
    // All entities destroyed, no memory leaks!
    
    return Task.CompletedTask;
}
~~~

**Benefits:**
- Fresh World per scene
- Automatic cleanup
- No memory leaks
- Impossible to forget cleanup

---

### Persistent Data Pattern

~~~csharp
// ❌ Wrong - entities don't persist across scenes
private static Entity? _player; // Dies when scene ends!

// ✅ Correct - singleton service persists
public class GameState
{
    public int Score { get; set; }
    public int HighScore { get; set; }
}

// Register as singleton
builder.Services.AddSingleton<GameState>();
~~~

**Pattern:**
- **Entities**: Temporary (scoped per scene)
- **Data**: Persistent (singleton service)

---

## Step 5: Run the Game

~~~sh
dotnet run
~~~

**You should see:**
- Player spaceship in the center
- Asteroids falling from top
- Power-ups falling occasionally
- Score increasing as you survive
- Game over when hit by asteroid
- Press R to restart

---

## Enhancements

### Add Difficulty Scaling

~~~csharp
private float GetSpawnInterval()
{
    // Spawn faster as score increases
    var baseInterval = 1.5f;
    var reduction = _gameState.Score / 100f * 0.1f;
    return Math.Max(0.3f, baseInterval - reduction);
}
~~~

### Add Player Lives

~~~csharp
public class GameState
{
    public int Lives { get; set; } = 3;
    
    public void Reset()
    {
        Score = 0;
        Lives = 3;
        IsGameOver = false;
    }
    
    public bool LoseLife()
    {
        Lives--;
        if (Lives <= 0)
        {
            IsGameOver = true;
            return true;
        }
        return false;
    }
}
~~~

### Add Particle Effects

~~~csharp
private void CreateExplosion(Vector2 position)
{
    for (int i = 0; i < 10; i++)
    {
        var particle = World.CreateEntity("Particle");
        var transform = particle.AddComponent<TransformComponent>();
        transform.Position = position;
        
        var emitter = particle.AddComponent<ParticleEmitterComponent>();
        emitter.EmissionRate = 50f;
        emitter.ParticleLifetime = 0.5f;
        emitter.InitialVelocity = GetRandomDirection() * 200f;
    }
}
~~~

---

## Complete Project Structure

~~~
AsteroidDodge/
├── Assets/
│   ├── Sprites/
│   │   ├── player.png
│   │   ├── asteroid.png
│   │   └── powerup.png
│   └── Sounds/
│       ├── explosion.wav
│       └── collect.wav
├── GameState.cs
├── GameScene.cs
├── Program.cs
└── AsteroidDodge.csproj
~~~

---

## Key Takeaways

### 1. Property Injection

~~~csharp
// ✅ Clean constructor - only YOUR services
public GameScene(IInputContext input, IAudioService audio)
{
    _input = input;
    _audio = audio;
}

// ✅ Framework properties available in lifecycle methods
protected override Task OnLoadAsync(CancellationToken ct)
{
    Logger.LogInfo("Loading");
    var entity = World.CreateEntity("Player");
    Renderer.ClearColor = Color.Black;
}
~~~

### 2. Scoped World

~~~csharp
// ✅ World is scoped per scene - automatic cleanup!
protected override Task OnUnloadAsync(CancellationToken ct)
{
    // All entities destroyed automatically
    return Task.CompletedTask;
}
~~~

### 3. Persistent Data

~~~csharp
// ✅ Use singleton service for data that survives scene changes
builder.Services.AddSingleton<GameState>();
~~~

### 4. Asset Loading

~~~csharp
// ✅ Load assets in OnLoadAsync
protected override async Task OnLoadAsync(CancellationToken ct)
{
    _texture = await LoadTextureAsync("player.png", ct);
    _sound = await _audio.LoadSoundAsync("jump.wav", ct);
}
~~~

---

## Troubleshooting

### Problem: Entities from previous game still visible after restart

**Cause:** Not clearing entity lists.

**Solution:**

~~~csharp
private void RestartGame()
{
    // Clear entity references
    foreach (var asteroid in _asteroids.ToList())
    {
        World.DestroyEntity(asteroid);
    }
    _asteroids.Clear();
    
    // Recreate player
    if (_player != null)
    {
        World.DestroyEntity(_player);
    }
    CreatePlayer();
}
~~~

---

### Problem: Score resets between restarts

**Cause:** GameState.Reset() called on restart.

**Solution:**

~~~csharp
// Keep high score, only reset current game
public void Reset()
{
    Score = 0;
    Lives = 3;
    IsGameOver = false;
    // Don't reset HighScore!
}
~~~

---

### Problem: NullReferenceException when accessing World in constructor

**Cause:** World not set yet during construction.

**Solution:**

~~~csharp
// ❌ Wrong - World is null in constructor!
public GameScene()
{
    var player = World.CreateEntity("Player"); // NullReferenceException!
}

// ✅ Correct - Use OnInitializeAsync or OnLoadAsync
protected override Task OnLoadAsync(CancellationToken ct)
{
    var player = World.CreateEntity("Player"); // Works!
    return Task.CompletedTask;
}
~~~

---

## Next Steps

Now that you've built a complete game, explore more features:

- **[Project Structure](project-structure.md)** - Organize larger projects
- **[ECS Deep Dive](../guides/ecs/getting-started.md)** - Advanced entity patterns
- **[Particle Systems](../guides/rendering/particles.md)** - Add visual effects
- **[Audio Guide](../guides/audio/getting-started.md)** - Music and spatial audio
- **[Scene Transitions](../guides/scenes/transitions.md)** - Smooth scene changes

---

**Congratulations!** You've built a complete game with Brine2D. You now understand:
- Property injection pattern
- Scoped EntityWorld
- Persistent data management
- Asset loading
- Collision detection
- Game state management

Ready to build something bigger? Check out our [Tutorials](../tutorials/index.md) and [Samples](../samples/index.md)!