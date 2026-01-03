---
title: Moving Sprites Tutorial
description: Learn to load textures, draw sprites, and create smooth movement in Brine2D
---

# Moving Sprites

**Difficulty:** Beginner | **Time:** 15 minutes

In this tutorial, you'll learn the fundamentals of rendering and moving sprites in Brine2D. By the end, you'll have a player character that smoothly moves across the screen using keyboard input.

## What You'll Build

A simple game scene with:
- A sprite loaded from an image file
- Smooth keyboard-controlled movement
- Frame-rate independent motion using delta time
- Proper boundary checking

## Prerequisites

- Completed [Quick Start](../getting-started/quickstart.md)
- Basic understanding of C# and classes
- A sprite image (or use the included placeholder)

---

## Step 1: Project Setup

First, create a new scene for your moving sprite demo.

### Create the Scene Class

Create a new file `MovingSpriteScene.cs`:

```csharp
using Brine2D.Core;
using Brine2D.Input;
using Brine2D.Rendering;
using Microsoft.Extensions.Logging;
using System.Numerics;

namespace MyGame;

public class MovingSpriteScene : Scene
{
    private readonly IRenderer _renderer;
    private readonly IInputService _input;
    private readonly ITextureLoader _textureLoader;
    private readonly IGameContext _gameContext;

    public MovingSpriteScene
    (
        IRenderer renderer,
        IInputService input,
        ITextureLoader textureLoader,
        IGameContext gameContext,
        ILogger<MovingSpriteScene> logger
    ) : base(logger)
    {
        _renderer = renderer;
        _input = input;
        _textureLoader = textureLoader;
        _gameContext = gameContext;
    }

    protected override void OnInitialize()
    {
        Logger.LogInformation("Moving Sprite Scene initialized!");
    }
}
```

**What's happening here:**

- We're using **constructor injection** to get dependencies (just like ASP.NET!)
- `IRenderer` - draws things on screen
- `IInputService` - handles keyboard/mouse input
- `ITextureLoader` - loads images from disk
- `IGameContext` - controls game state (exit, pause, etc.)

---

## Step 2: Loading a Sprite

Now let's load a texture (sprite image) when the scene loads.

### Add Texture Fields

Add these fields to your scene class:

```csharp
private ITexture? _playerTexture;
private Vector2 _playerPosition = new Vector2(400, 300);
private float _speed = 200f; // pixels per second
```

### Load the Texture

Override `OnLoadAsync` to load your sprite:

```csharp
protected override async Task OnLoadAsync(CancellationToken cancellationToken)
{
    Logger.LogInformation("Loading player sprite...");

    var spritePath = "assets/sprites/player.png";

    if (File.Exists(spritePath))
    {
        _playerTexture = await _textureLoader.LoadTextureAsync
        (
            spritePath,
            TextureScaleMode.Nearest, // Use Nearest for pixel art, Linear for smooth art
            cancellationToken
        );
        
        Logger.LogInformation("Sprite loaded: {Width}x{Height}",
            _playerTexture.Width, _playerTexture.Height);
    }
    else
    {
        Logger.LogWarning("Sprite not found at: {Path}", Path.GetFullPath(spritePath));
        
        // Create a placeholder texture if file doesn't exist
        _playerTexture = _textureLoader.CreateTexture(32, 32, TextureScaleMode.Nearest);
    }
}
```

**Key Points:**

- `LoadTextureAsync` is **async** - it won't block your game while loading
- `TextureScaleMode.Nearest` is perfect for pixel art (no blurring)
- `TextureScaleMode.Linear` is better for high-res sprites (smooth scaling)
- We provide a fallback if the file doesn't exist

---

## Step 3: Drawing the Sprite

Now let's draw the sprite on screen.

### Implement OnRender

```csharp
protected override void OnRender(GameTime gameTime)
{
    // Clear the screen with a background color
    _renderer.Clear(new Color(40, 40, 40)); // Dark gray
    
    _renderer.BeginFrame();

    // Draw the player sprite if loaded
    if (_playerTexture != null)
    {
        _renderer.DrawTexture
        (
            _playerTexture,
            _playerPosition.X,
            _playerPosition.Y
        );
    }

    _renderer.EndFrame();
}
```

**What's happening:**

1. `Clear()` fills the screen with a background color
2. `BeginFrame()` starts a new frame (required before drawing)
3. `DrawTexture()` draws the sprite at the specified position
4. `EndFrame()` finishes the frame and presents it to the screen

### Test It!

Run your game now. You should see your sprite on screen (or a placeholder square if the image didn't load).

---

## Step 4: Adding Movement

Let's make the sprite move with keyboard input.

### Implement OnUpdate

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    var deltaTime = (float)gameTime.DeltaTime;

    // Exit on Escape key
    if (_input.IsKeyPressed(Keys.Escape))
    {
        _gameContext.RequestExit();
    }

    // Move with arrow keys
    if (_input.IsKeyDown(Keys.Left))
    {
        _playerPosition.X -= _speed * deltaTime;
    }
    
    if (_input.IsKeyDown(Keys.Right))
    {
        _playerPosition.X += _speed * deltaTime;
    }
    
    if (_input.IsKeyDown(Keys.Up))
    {
        _playerPosition.Y -= _speed * deltaTime;
    }
    
    if (_input.IsKeyDown(Keys.Down))
    {
        _playerPosition.Y += _speed * deltaTime;
    }
}
```

**Understanding Delta Time:**

```csharp
movement = _speed * deltaTime;
```

- `deltaTime` is the time (in seconds) since the last frame
- At 60 FPS, `deltaTime` ≈ 0.0166 seconds
- At 30 FPS, `deltaTime` ≈ 0.0333 seconds

This ensures the sprite moves at the **same real-world speed** regardless of frame rate!

**Without delta time:**
- 60 FPS: moves 60 pixels/second
- 30 FPS: moves 30 pixels/second (half as fast!)

**With delta time:**
- 60 FPS: moves 200 pixels/second
- 30 FPS: moves 200 pixels/second (consistent!)

---

## Step 5: Better Movement (8-Directional)

Let's improve movement to support diagonal motion.

### Replace Movement Code

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    var deltaTime = (float)gameTime.DeltaTime;

    if (_input.IsKeyPressed(Keys.Escape))
    {
        _gameContext.RequestExit();
    }

    // Calculate movement direction
    var movement = Vector2.Zero;

    if (_input.IsKeyDown(Keys.Left))
    {
        movement.X -= 1;
    }

    if (_input.IsKeyDown(Keys.Right))
    {
        movement.X += 1;
    }

    if (_input.IsKeyDown(Keys.Up))
    {
        movement.Y -= 1;
    }

    if (_input.IsKeyDown(Keys.Down))
    {
        movement.Y += 1;
    }

    // Normalize for consistent diagonal speed
    if (movement != Vector2.Zero)
    {
        movement = Vector2.Normalize(movement);
        _playerPosition += movement * _speed * deltaTime;
    }
}
```

**Why Normalize?**

Without normalization:

- Moving right: speed = 200 px/s
- Moving diagonally (right + up): speed = 282 px/s (√2 faster!)

With `Vector2.Normalize()`:

- All directions: speed = 200 px/s (consistent!)

---

## Step 6: Boundary Checking

Keep the sprite on screen by clamping its position.

### Add Screen Bounds

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    var deltaTime = (float)gameTime.DeltaTime;

    if (_input.IsKeyPressed(Keys.Escape))
    {
        _gameContext.RequestExit();
    }

    // Calculate movement
    var movement = Vector2.Zero;
    if (_input.IsKeyDown(Keys.Left))
    {
        movement.X -= 1;
    }

    if (_input.IsKeyDown(Keys.Right))
    {
        movement.X += 1;
    }

    if (_input.IsKeyDown(Keys.Up))
    {
        movement.Y -= 1;
    }

    if (_input.IsKeyDown(Keys.Down))
    {
        movement.Y += 1;
    }

    if (movement != Vector2.Zero)
    {
        movement = Vector2.Normalize(movement);
        _playerPosition += movement * _speed * deltaTime;
    }

    // Keep player on screen (assuming 1280x720 window)
    const float screenWidth = 1280f;
    const float screenHeight = 720f;

    var spriteWidth = _playerTexture?.Width ?? 32;
    var spriteHeight = _playerTexture?.Height ?? 32;

    _playerPosition.X = Math.Clamp(_playerPosition.X, 0, screenWidth - spriteWidth);
    _playerPosition.Y = Math.Clamp(_playerPosition.Y, 0, screenHeight - spriteHeight);
}
```

**`Math.Clamp()` keeps the value within a range:**

- If `x < min`, returns `min`
- If `x > max`, returns `max`
- Otherwise, returns `x`

---

## Step 7: Center the Sprite

Right now, the sprite's **top-left corner** is at the position. Let's center it.

### Update OnRender

```csharp
protected override void OnRender(GameTime gameTime)
{
    _renderer.Clear(new Color(40, 40, 40));
    _renderer.BeginFrame();

    if (_playerTexture != null)
    {
        // Center the sprite on its position
        var drawX = _playerPosition.X - (_playerTexture.Width / 2f);
        var drawY = _playerPosition.Y - (_playerTexture.Height / 2f);

        _renderer.DrawTexture(_playerTexture, drawX, drawY);
    }

    _renderer.EndFrame();
}
```

Now `_playerPosition` represents the **center** of the sprite, which feels more natural for game logic.

---

## Step 8: Scaling the Sprite

Want to draw the sprite larger or smaller? Use the overload with width and height.

### Drawing at Custom Size

```csharp
protected override void OnRender(GameTime gameTime)
{
    _renderer.Clear(new Color(40, 40, 40));
    _renderer.BeginFrame();

    if (_playerTexture != null)
    {
        var scale = 2.0f; // Draw 2x larger
        var width = _playerTexture.Width * scale;
        var height = _playerTexture.Height * scale;

        var drawX = _playerPosition.X - (width / 2f);
        var drawY = _playerPosition.Y - (height / 2f);

        // DrawTexture with custom size
        _renderer.DrawTexture(
            _playerTexture,
            drawX, drawY,
            width, height
        );
    }

    _renderer.EndFrame();
}
```

---

## Complete Code

Here's the full `MovingSpriteScene.cs`:

```csharp
using System.Numerics;
using Brine2D.Core;
using Brine2D.Input;
using Brine2D.Rendering;
using Microsoft.Extensions.Logging;

namespace MyGame;

public class MovingSpriteScene : Scene
{
    private readonly IGameContext _gameContext;
    private readonly IInputService _input;
    private readonly IRenderer _renderer;
    private readonly ITextureLoader _textureLoader;
    private Vector2 _playerPosition = new(640, 360); // Center of 1280x720

    private ITexture? _playerTexture;
    private readonly float _speed = 200f;

    public MovingSpriteScene(
        IRenderer renderer,
        IInputService input,
        ITextureLoader textureLoader,
        IGameContext gameContext,
        ILogger<MovingSpriteScene> logger
    ) : base(logger)
    {
        _renderer = renderer;
        _input = input;
        _textureLoader = textureLoader;
        _gameContext = gameContext;
    }

    protected override void OnInitialize()
    {
        Logger.LogInformation("Moving Sprite Scene initialized!");
        Logger.LogInformation("Controls: Arrow Keys to move, Escape to exit");
    }

    protected override async Task OnLoadAsync(CancellationToken cancellationToken)
    {
        Logger.LogInformation("Loading player sprite...");

        var spritePath = "assets/sprites/player.png";

        if (File.Exists(spritePath))
        {
            _playerTexture = await _textureLoader.LoadTextureAsync(
                spritePath,
                TextureScaleMode.Nearest,
                cancellationToken
            );

            Logger.LogInformation("Sprite loaded: {Width}x{Height}",
                _playerTexture.Width, _playerTexture.Height);
        }
        else
        {
            Logger.LogWarning("Sprite not found, using placeholder");
            _playerTexture = _textureLoader.CreateTexture(32, 32, TextureScaleMode.Nearest);
        }
    }

    protected override void OnRender(GameTime gameTime)
    {
        _renderer.Clear(new Color(40, 40, 40));
        _renderer.BeginFrame();

        if (_playerTexture != null)
        {
            // Draw centered on position
            var drawX = _playerPosition.X - _playerTexture.Width / 2f;
            var drawY = _playerPosition.Y - _playerTexture.Height / 2f;

            _renderer.DrawTexture(_playerTexture, drawX, drawY);
        }

        _renderer.EndFrame();
    }

    protected override Task OnUnloadAsync(CancellationToken cancellationToken)
    {
        // Clean up the texture when scene unloads
        if (_playerTexture != null)
        {
            _textureLoader.UnloadTexture(_playerTexture);
        }

        return Task.CompletedTask;
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;

        if (_input.IsKeyPressed(Keys.Escape))
        {
            _gameContext.RequestExit();
        }

        // Calculate movement direction
        var movement = Vector2.Zero;
        if (_input.IsKeyDown(Keys.Left))
        {
            movement.X -= 1;
        }

        if (_input.IsKeyDown(Keys.Right))
        {
            movement.X += 1;
        }

        if (_input.IsKeyDown(Keys.Up))
        {
            movement.Y -= 1;
        }

        if (_input.IsKeyDown(Keys.Down))
        {
            movement.Y += 1;
        }

        // Apply movement
        if (movement != Vector2.Zero)
        {
            movement = Vector2.Normalize(movement);
            _playerPosition += movement * _speed * deltaTime;
        }

        // Keep player on screen
        const float screenWidth = 1280f;
        const float screenHeight = 720f;

        var spriteWidth = _playerTexture?.Width ?? 32;
        var spriteHeight = _playerTexture?.Height ?? 32;

        _playerPosition.X = Math.Clamp(_playerPosition.X, spriteWidth / 2f, screenWidth - spriteWidth / 2f);
        _playerPosition.Y = Math.Clamp(_playerPosition.Y, spriteHeight / 2f, screenHeight - spriteHeight / 2f);
    }
}
```

### Register the Scene in Program.cs

```csharp
using Brine2D.Hosting;
using Brine2D.Input.SDL;
using Brine2D.Rendering.SDL;
using MyGame;

var builder = GameApplication.CreateBuilder(args);

builder.Services.AddSDL3Rendering(options =>
{
    options.WindowTitle = "Moving Sprites Tutorial";
    options.WindowWidth = 1280;
    options.WindowHeight = 720;
    options.VSync = true;
});

builder.Services.AddSDL3Input();
builder.Services.AddScene<MovingSpriteScene>();

var game = builder.Build();
await game.RunAsync<MovingSpriteScene>();
```

---

## Challenges

Now that you've completed the tutorial, try these extensions:

### Easy

1. **Change the speed** - Make the sprite move faster or slower
2. **Different keys** - Use WASD instead of arrow keys
3. **Background color** - Try different clear colors

### Medium

4. **Multiple sprites** - Load and move 2-3 sprites independently
5. **Wrap-around** - When the sprite leaves one edge, appear on the opposite edge
6. **Speed boost** - Hold Shift to move 2x faster

### Hard

7. **Smooth acceleration** - Gradually speed up/slow down instead of instant movement
8. **Mouse follow** - Make the sprite move toward the mouse cursor
9. **Rotation** - Rotate the sprite to face the direction of movement

---

## What You Learned

✅ **Loading textures** with `ITextureLoader.LoadTextureAsync()`  
✅ **Drawing sprites** with `IRenderer.DrawTexture()`  
✅ **Keyboard input** with `IInputService.IsKeyDown()`  
✅ **Delta time** for frame-rate independent movement  
✅ **Vector math** with `Vector2.Normalize()`  
✅ **Boundary checking** with `Math.Clamp()`  
✅ **Scene lifecycle** - Initialize, Load, Update, Render, Unload

---

## Next Steps

Ready for more? Check out:

- **[Animation System](animations.md)** - Make your sprite come alive with animations
- **[Collision Detection](collision.md)** - Add walls and interactive objects
- **[Input Guide](../guides/input/keyboard-mouse.md)** - Master all input types
- **[Rendering Guide](../guides/rendering/sprites.md)** - Advanced sprite rendering

---

## Common Issues

### Sprite not showing?

- Check if the file path is correct (`File.Exists()` returns true)
- Make sure `assets/sprites/` folder is being copied to output (check `.csproj`)
- Verify you called `BeginFrame()` before and `EndFrame()` after drawing

### Movement feels sluggish?

- Check your `_speed` value (200 is a good default for pixels/second)
- Make sure you're multiplying by `deltaTime`
- Verify VSync is enabled for consistent frame rate

### Sprite is blurry?

- Use `TextureScaleMode.Nearest` for pixel art
- Make sure you're not scaling the sprite too much

---

Great job! You've mastered the basics of sprite rendering and movement in Brine2D.