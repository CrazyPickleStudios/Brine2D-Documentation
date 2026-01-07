---
title: Scene Transitions
description: Smooth transitions between scenes with fade effects and loading screens
---

# Scene Transitions

Scene transitions make your game feel polished by smoothly fading between scenes instead of abruptly switching. Brine2Dintroduces a powerful transition system with built-in effects and custom loading screens.

## Why Use Transitions?

**Transitions provide:**

- Smooth visual experience
- Time to load heavy scenes
- Professional polish
- Progress feedback to players

---

## Quick Start

### Basic Fade Transition

~~~csharp
using Brine2D.Engine;
using Brine2D.Engine.Transitions;

public class MenuScene : Scene
{
    private readonly ISceneManager _sceneManager;
    
    public MenuScene(ISceneManager sceneManager, ILogger<MenuScene> logger) : base(logger)
    {
        _sceneManager = sceneManager;
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        if (_input.IsKeyPressed(Keys.Enter))
        {
            // Fade to game scene
            await _sceneManager.LoadSceneAsync<GameScene>(
                new FadeTransition(duration: 0.5f, color: Color.Black)
            );
        }
    }
}
~~~

That's it! The scene will fade out, load, and fade in automatically.

---

## FadeTransition

The `FadeTransition` is the built-in transition effect that fades to a solid color.

### Basic Usage

~~~csharp
// Black fade, 500ms
var transition = new FadeTransition(duration: 0.5f, color: Color.Black);

await _sceneManager.LoadSceneAsync<GameScene>(transition);
~~~

### Constructor Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `duration` | `float` | Total fade time (seconds) | Required |
| `color` | `Color` | Fade color | Required |

### Fade Colors

Choose a fade color that matches your game's aesthetic:

~~~csharp
// Black fade (classic)
new FadeTransition(0.5f, Color.Black)

// White fade (bright/dreamy)
new FadeTransition(0.5f, Color.White)

// Color fade (thematic)
new FadeTransition(0.5f, new Color(50, 0, 100)) // Dark purple

// Custom alpha (transparent fade)
new FadeTransition(0.5f, new Color(0, 0, 0, 128)) // Semi-transparent
~~~

### Timing

Adjust duration based on scene complexity:

~~~csharp
// Quick transition (UI screens)
new FadeTransition(0.3f, Color.Black)

// Standard transition (most scenes)
new FadeTransition(0.5f, Color.Black)

// Slow transition (dramatic moments)
new FadeTransition(1.0f, Color.Black)

// Very slow (cinematic)
new FadeTransition(2.0f, Color.Black)
~~~

---

## Loading Screens

For scenes that take time to load, show a loading screen with progress feedback.

### Basic Loading Screen

~~~csharp
public class SimpleLoadingScreen : LoadingScene
{
    protected override void OnRender(GameTime gameTime)
    {
        // Progress is 0.0 to 1.0
        _renderer.DrawText($"Loading... {Progress:P0}", 500, 300, Color.White);
    }
}

// Use the loading screen
await _sceneManager.LoadSceneAsync<GameScene>(
    loadingScreen: new SimpleLoadingScreen(),
    transition: new FadeTransition(0.5f, Color.Black)
);
~~~

### Advanced Loading Screen

Show detailed progress with a progress bar:

~~~csharp
public class GameLoadingScreen : LoadingScene
{
    protected override void OnRender(GameTime gameTime)
    {
        var centerX = 640;
        var centerY = 360;
        
        // Title
        _renderer.DrawText("Loading Game...", centerX - 80, centerY - 50, Color.White);
        
        // Progress percentage
        _renderer.DrawText($"{Progress:P0}", centerX - 20, centerY, Color.White);
        
        // Progress bar background
        _renderer.DrawRectangleFilled(
            centerX - 200, centerY + 40,
            400, 30,
            new Color(50, 50, 50)
        );
        
        // Progress bar fill
        _renderer.DrawRectangleFilled(
            centerX - 200, centerY + 40,
            400 * Progress, 30,
            new Color(0, 200, 0)
        );
        
        // Progress bar outline
        _renderer.DrawRectangleOutline(
            centerX - 200, centerY + 40,
            400, 30,
            Color.White, 2f
        );
        
        // Loading tip
        _renderer.DrawText("Tip: Press F1 for help", centerX - 100, centerY + 100, Color.Gray);
    }
}
~~~

### Animated Loading Screen

Add animation for visual interest:

~~~csharp
public class AnimatedLoadingScreen : LoadingScene
{
    private float _rotation = 0f;
    
    protected override void OnUpdate(GameTime gameTime)
    {
        base.OnUpdate(gameTime);
        _rotation += (float)gameTime.DeltaTime * 2f; // Rotate spinner
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        var centerX = 640;
        var centerY = 360;
        
        // Draw spinning circle segments (pseudo-spinner)
        for (int i = 0; i < 8; i++)
        {
            var angle = _rotation + (i * MathF.PI / 4);
            var x = centerX + MathF.Cos(angle) * 50;
            var y = centerY + MathF.Sin(angle) * 50;
            var alpha = (byte)(255 * (i / 8f));
            
            _renderer.DrawCircleFilled(x, y, 5, new Color(255, 255, 255, alpha));
        }
        
        // Progress text
        _renderer.DrawText($"Loading... {Progress:P0}", centerX - 80, centerY + 80, Color.White);
    }
}
~~~

### Loading Screen with Assets

Load and display images/textures:

~~~csharp
public class BrandedLoadingScreen : LoadingScene
{
    private ITexture? _logoTexture;
    
    protected override async Task OnLoadAsync(CancellationToken cancellationToken)
    {
        // Load logo texture
        _logoTexture = await _textureLoader.LoadTextureAsync(
            "assets/logo.png",
            TextureScaleMode.Nearest,
            cancellationToken
        );
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        // Draw logo
        if (_logoTexture != null)
        {
            _renderer.DrawTexture(_logoTexture, 540, 200, 200, 100);
        }
        
        // Progress bar
        var barWidth = 400 * Progress;
        _renderer.DrawRectangleFilled(440, 350, barWidth, 20, Color.Green);
        _renderer.DrawRectangleOutline(440, 350, 400, 20, Color.White, 2f);
        
        _renderer.DrawText($"{Progress:P0}", 620, 380, Color.White);
    }
}
~~~

---

## Scene Chaining

Transition through multiple scenes in sequence.

### Manual Chaining

~~~csharp
public class IntroScene : Scene
{
    protected override async void OnUpdate(GameTime gameTime)
    {
        if (_input.IsKeyPressed(Keys.Enter))
        {
            // Intro → Tutorial → Game
            await _sceneManager.LoadSceneAsync<TutorialScene>(
                new FadeTransition(0.5f, Color.Black)
            );
        }
    }
}

public class TutorialScene : Scene
{
    protected override async void OnUpdate(GameTime gameTime)
    {
        if (_tutorialComplete)
        {
            await _sceneManager.LoadSceneAsync<GameScene>(
                new FadeTransition(0.5f, Color.Black)
            );
        }
    }
}
~~~

### Automatic Chaining

Create a scene that auto-progresses:

~~~csharp
public class SplashScreenScene : Scene
{
    private float _timer = 0f;
    private const float DisplayTime = 3f;
    
    protected override async void OnUpdate(GameTime gameTime)
    {
        _timer += (float)gameTime.DeltaTime;
        
        if (_timer >= DisplayTime)
        {
            // Automatically transition after 3 seconds
            await _sceneManager.LoadSceneAsync<MenuScene>(
                new FadeTransition(0.5f, Color.Black)
            );
        }
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        _renderer.DrawText("Studio Logo Here", 500, 300, Color.White);
    }
}
~~~

### Circular Chaining

Loop through scenes (A → B → C → A):

~~~csharp
public class SceneA : Scene
{
    protected override async void OnUpdate(GameTime gameTime)
    {
        if (_input.IsKeyPressed(Keys.Enter))
        {
            await _sceneManager.LoadSceneAsync<SceneB>(
                new FadeTransition(0.5f, Color.Black)
            );
        }
    }
}

public class SceneB : Scene
{
    protected override async void OnUpdate(GameTime gameTime)
    {
        if (_input.IsKeyPressed(Keys.Enter))
        {
            await _sceneManager.LoadSceneAsync<SceneC>(
                new FadeTransition(0.5f, Color.Blue)
            );
        }
    }
}

public class SceneC : Scene
{
    protected override async void OnUpdate(GameTime gameTime)
    {
        if (_input.IsKeyPressed(Keys.Enter))
        {
            // Back to A
            await _sceneManager.LoadSceneAsync<SceneA>(
                new FadeTransition(0.5f, Color.Red)
            );
        }
    }
}
~~~

---

## Transition Lifecycle

Understanding what happens during a transition:

~~~mermaid
sequenceDiagram
    participant Current Scene
    participant Transition (Fade Out)
    participant Loading Screen
    participant New Scene
    participant Transition (Fade In)
    
    Current Scene->>Transition (Fade Out): LoadSceneAsync called
    Transition (Fade Out)->>Transition (Fade Out): Fade to color (duration/2)
    Transition (Fade Out)->>Loading Screen: Show loading screen
    Loading Screen->>New Scene: Load scene async
    Note over Loading Screen,New Scene: OnLoadAsync runs
    New Scene-->>Loading Screen: Loading complete
    Loading Screen->>Transition (Fade In): Hide loading screen
    Transition (Fade In)->>Transition (Fade In): Fade from color (duration/2)
    Transition (Fade In)->>New Scene: Transition complete
    Note over New Scene: OnInitialize runs
~~~

### Phase Breakdown

| Phase | Duration | What Happens |
|-------|----------|--------------|
| **Fade Out** | `duration / 2` | Current scene fades to transition color |
| **Load** | Variable | New scene's `OnLoadAsync` executes |
| **Loading Screen** | During load | Progress updates, renders loading UI |
| **Fade In** | `duration / 2` | New scene fades in from transition color |
| **Complete** | — | New scene's `OnInitialize` runs |

---

## Common Patterns

### Return to Menu

~~~csharp
public class GameScene : Scene
{
    protected override async void OnUpdate(GameTime gameTime)
    {
        if (_input.IsKeyPressed(Keys.Escape))
        {
            // Show confirmation dialog
            var confirmed = await ShowConfirmDialog("Return to menu?");
            
            if (confirmed)
            {
                await _sceneManager.LoadSceneAsync<MainMenuScene>(
                    new FadeTransition(0.5f, Color.Black)
                );
            }
        }
    }
}
~~~

### Death Screen

~~~csharp
public class GameScene : Scene
{
    protected override async void OnUpdate(GameTime gameTime)
    {
        if (_player.IsDead)
        {
            // Slow dramatic fade to death screen
            await _sceneManager.LoadSceneAsync<DeathScene>(
                new FadeTransition(2.0f, Color.Red)
            );
        }
    }
}
~~~

### Level Progression

~~~csharp
public class Level1Scene : Scene
{
    protected override async void OnUpdate(GameTime gameTime)
    {
        if (_levelComplete)
        {
            await _sceneManager.LoadSceneAsync<Level2Scene>(
                loadingScreen: new LevelLoadingScreen("Level 2"),
                transition: new FadeTransition(0.5f, Color.Black)
            );
        }
    }
}
~~~

### Save and Quit

~~~csharp
public class GameScene : Scene
{
    protected override async void OnUpdate(GameTime gameTime)
    {
        if (_saveAndQuitRequested)
        {
            // Save game state
            await SaveGameAsync();
            
            // Return to menu with slow fade
            await _sceneManager.LoadSceneAsync<MainMenuScene>(
                loadingScreen: new SavingScreen(),
                transition: new FadeTransition(1.0f, Color.Black)
            );
        }
    }
}
~~~

---

## Best Practices

### Do's

✅ **Use transitions for all scene changes** - Consistency matters

~~~csharp
// Good - always use transitions
await _sceneManager.LoadSceneAsync<GameScene>(
    new FadeTransition(0.5f, Color.Black)
);
~~~

✅ **Match transition duration to load time**

~~~csharp
// Quick load → short transition
await _sceneManager.LoadSceneAsync<MenuScene>(
    new FadeTransition(0.3f, Color.Black)
);

// Heavy load → use loading screen
await _sceneManager.LoadSceneAsync<GameScene>(
    loadingScreen: new GameLoadingScreen(),
    transition: new FadeTransition(0.5f, Color.Black)
);
~~~

✅ **Use thematic colors**

~~~csharp
// Red fade for danger/death
new FadeTransition(1.0f, Color.Red)

// Blue fade for water levels
new FadeTransition(0.5f, new Color(0, 100, 200))

// White fade for bright/happy moments
new FadeTransition(0.5f, Color.White)
~~~

✅ **Show progress for long loads**

~~~csharp
await _sceneManager.LoadSceneAsync<GameScene>(
    loadingScreen: new DetailedLoadingScreen(),
    transition: new FadeTransition(0.5f, Color.Black)
);
~~~

### Don'ts

❌ **Don't make transitions too fast**

~~~csharp
// Bad - too jarring
new FadeTransition(0.1f, Color.Black) // Feels broken
~~~

❌ **Don't make transitions too slow**

~~~csharp
// Bad - frustrating for players
new FadeTransition(5.0f, Color.Black) // Way too long
~~~

❌ **Don't skip transitions for important moments**

~~~csharp
// Bad - no transition for game over
await _sceneManager.LoadSceneAsync<GameOverScene>(); // Jarring
~~~

❌ **Don't load heavy assets in loading screen**

~~~csharp
// Bad - defeats the purpose
public class LoadingScreen : LoadingScene
{
    protected override async Task OnLoadAsync(CancellationToken ct)
    {
        // DON'T load heavy assets here!
        await LoadGiantTextureAsync(); // Wrong place!
    }
}
~~~

---

## Performance Tips

### Optimize Scene Loading

~~~csharp
public class GameScene : Scene
{
    protected override async Task OnLoadAsync(CancellationToken ct)
    {
        // Load critical assets first (shown during loading screen)
        await LoadEssentialAssetsAsync(ct);
        
        // Load optional assets after scene is visible
        _ = Task.Run(async () =>
        {
            await LoadOptionalAssetsAsync(ct);
        });
    }
}
~~~

### Preload Next Scene

~~~csharp
public class MenuScene : Scene
{
    protected override async Task OnLoadAsync(CancellationToken ct)
    {
        // Preload game scene in background
        _ = Task.Run(async () =>
        {
            await PreloadAssetsForScene<GameScene>(ct);
        });
    }
}
~~~

### Unload Previous Scene Assets

~~~csharp
public class GameScene : Scene
{
    protected override async Task OnUnloadAsync(CancellationToken ct)
    {
        // Clean up to free memory
        UnloadTextures();
        UnloadSounds();
        
        await base.OnUnloadAsync(ct);
    }
}
~~~

---

## See It In Action

Check out the **Scene Transitions Demo** in FeatureDemos!

~~~bash
cd samples/FeatureDemos
dotnet run
# Select "4" for Scene Transitions Demo
~~~

The demo shows:
- Basic fade transitions
- Scene chaining (A → B → C → A)
- Loading screen example
- Different fade colors
- Transition timing

---

## API Reference

### ISceneManager.LoadSceneAsync

~~~csharp
Task LoadSceneAsync<TScene>(
    ITransition? transition = null,
    LoadingScene? loadingScreen = null
) where TScene : Scene
~~~

**Parameters:**
- `transition` - Transition effect (e.g., `FadeTransition`)
- `loadingScreen` - Loading screen scene (optional)

**Returns:** `Task` that completes when transition finishes

### FadeTransition Constructor

~~~csharp
public FadeTransition(float duration, Color color)
~~~

**Parameters:**
- `duration` - Total fade time in seconds (both fade out and in)
- `color` - Color to fade to/from

### LoadingScene

Base class for custom loading screens:

~~~csharp
public abstract class LoadingScene : Scene
{
    protected float Progress { get; } // 0.0 to 1.0
    
    protected override void OnRender(GameTime gameTime)
    {
        // Draw loading UI
    }
}
~~~

---

## Next Steps

<div class="grid cards" markdown>

-   **Scene Lifecycle**

    ---

    Understanding scene lifecycle methods

    [:octicons-arrow-right-24: Lifecycle Guide](lifecycle.md)

-   **Lifecycle Hooks**

    ---

    Automatic vs manual scene control

    [:octicons-arrow-right-24: Hooks Guide](lifecycle-hooks.md)

-   **FeatureDemos**

    ---

    See transitions in action

    [:octicons-arrow-right-24: View Demos](../../samples/index.md)

</div>

---

**Remember:** Good transitions make your game feel polished and professional. Use them everywhere!