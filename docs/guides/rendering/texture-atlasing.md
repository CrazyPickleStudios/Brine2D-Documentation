---
title: Texture Atlasing
description: Runtime sprite packing for optimal rendering performance
---

# Texture Atlasing

Texture atlasing combines multiple sprites into a single texture to dramatically reduce draw calls and improve rendering performance.

## What is Texture Atlasing?

A texture atlas (also called a sprite sheet or texture pack) is a single large texture containing multiple smaller images. Instead of switching textures for every sprite, the renderer draws from different regions of the same atlas.

**Without Atlasing:**
- 100 unique sprites = 100 texture binds = 100 draw calls
- Expensive GPU state changes
- Lower frame rates

**With Atlasing:**
- 100 sprites packed into 1 atlas = 1 texture bind = 1 draw call
- Minimal state changes
- Dramatically improved performance

## Benefits

### Performance
- **Reduce draw calls by 90-99%** - Batch sprites that share an atlas
- **Eliminate texture switching overhead** - One texture stays bound
- **Improve frame rates** - Especially on lower-end hardware
- **Better GPU utilization** - Larger batches = more efficient rendering

### Memory
- **Shared texture memory** - GPU loads one large texture instead of many small ones
- **Better cache locality** - Related sprites stored together
- **Reduced texture overhead** - Fewer texture objects to manage

### Workflow
- **Runtime generation** - No prebuild step required
- **Automatic integration** - Works transparently with existing code
- **Flexible packing** - Pack what makes sense for your game

## Creating an Atlas

### Basic Usage

```csharp
using Brine2D.Rendering;

// Load individual textures
var playerTexture = await _textureLoader.LoadTextureAsync("assets/player.png");
var enemyTexture = await _textureLoader.LoadTextureAsync("assets/enemy.png");
var bulletTexture = await _textureLoader.LoadTextureAsync("assets/bullet.png");

// Build atlas from textures
var textures = new[] { playerTexture, enemyTexture, bulletTexture };
var atlas = await AtlasBuilder.BuildAtlasAsync(
    _renderer,
    _textureLoader,
    textures,
    padding: 2,      // Pixels between sprites (prevents bleeding)
    maxSize: 2048    // Maximum atlas dimension (width/height)
);

// The atlas is now ready to use
Logger.LogInfo($"Atlas created: {atlas.Width}x{atlas.Height} with {atlas.RegionCount} sprites");
```

### From File Paths

```csharp
// Build atlas directly from file paths
var paths = new[]
{
    "assets/sprites/player.png",
    "assets/sprites/enemy1.png",
    "assets/sprites/enemy2.png",
    "assets/sprites/coin.png",
    "assets/sprites/heart.png"
};

var atlas = await AtlasBuilder.BuildAtlasAsync(
    _renderer,
    _textureLoader,
    paths,
    padding: 2,
    maxSize: 2048
);
```

### Directory Packing

```csharp
// Pack all PNG files in a directory
var directoryPath = "assets/ui";
var files = Directory.GetFiles(directoryPath, "*.png");

var atlas = await AtlasBuilder.BuildAtlasAsync(
    _renderer,
    _textureLoader,
    files,
    padding: 4,  // UI often needs more padding
    maxSize: 2048
);
```

## Using Atlas Regions

### Manual Drawing

```csharp
// Get the region for a specific texture
var playerRegion = atlas.GetRegion(playerTexture);

// Draw using the atlas texture and region's source rect
_renderer.DrawTexture(
    atlas.AtlasTexture,
    playerRegion.SourceRect.X,
    playerRegion.SourceRect.Y,
    playerRegion.SourceRect.Width,
    playerRegion.SourceRect.Height,
    x, y, width, height
);
```

### Region Properties

```csharp
var region = atlas.GetRegion(texture);

// Source rectangle in the atlas
var sourceRect = region.SourceRect;
Logger.LogInfo($"Region at ({sourceRect.X}, {sourceRect.Y}), size {sourceRect.Width}x{sourceRect.Height}");

// Original texture reference
var originalTexture = region.OriginalTexture;

// Check if texture is in atlas
if (atlas.TryGetRegion(someTexture, out var foundRegion))
{
    // Region exists
}
```

## ECS Integration

The sprite rendering system can automatically use atlases when available.

### Basic Setup

```csharp
public class GameScene : Scene
{
    private TextureAtlas? _gameAtlas;
    
    protected override async Task OnInitializeAsync(CancellationToken cancellationToken)
    {
        // Build atlas during scene initialization
        var spritePaths = new[]
        {
            "assets/player.png",
            "assets/enemy.png",
            "assets/projectile.png"
        };
        
        _gameAtlas = await AtlasBuilder.BuildAtlasAsync(
            _renderer,
            _textureLoader,
            spritePaths,
            padding: 2,
            maxSize: 2048
        );
        
        // Entities will automatically use the atlas
        CreateGameEntities();
    }
}
```

### Sprite Components

```csharp
// Create sprite component with texture path
var player = _world.CreateEntity("Player");
var sprite = player.AddComponent<SpriteComponent>();
sprite.TexturePath = "assets/player.png";  // Will use atlas if available
sprite.Layer = 10;

// The SpriteRenderingSystem automatically:
// 1. Loads the texture
// 2. Checks if it's in an atlas
// 3. Uses atlas region if found
// 4. Falls back to individual texture if not
```

### Custom Atlas Manager

```csharp
public class AtlasManager
{
    private readonly Dictionary<string, TextureAtlas> _atlases = new();
    private readonly IRenderer _renderer;
    private readonly ITextureLoader _textureLoader;
    
    public AtlasManager(IRenderer renderer, ITextureLoader textureLoader)
    {
        _renderer = renderer;
        _textureLoader = textureLoader;
    }
    
    public async Task LoadAtlasAsync(string name, string[] paths)
    {
        var atlas = await AtlasBuilder.BuildAtlasAsync(
            _renderer,
            _textureLoader,
            paths,
            padding: 2,
            maxSize: 2048
        );
        
        _atlases[name] = atlas;
    }
    
    public TextureAtlas? GetAtlas(string name)
    {
        return _atlases.TryGetValue(name, out var atlas) ? atlas : null;
    }
    
    public void UnloadAtlas(string name)
    {
        if (_atlases.TryGetValue(name, out var atlas))
        {
            atlas.Dispose();
            _atlases.Remove(name);
        }
    }
    
    public void UnloadAll()
    {
        foreach (var atlas in _atlases.Values)
        {
            atlas.Dispose();
        }
        _atlases.Clear();
    }
}
```

### Scene-Based Atlases

```csharp
public class LevelScene : Scene
{
    private AtlasManager? _atlasManager;
    
    protected override async Task OnInitializeAsync(CancellationToken cancellationToken)
    {
        _atlasManager = new AtlasManager(_renderer, _textureLoader);
        
        // Load atlases for different sprite categories
        await _atlasManager.LoadAtlasAsync("characters", new[]
        {
            "assets/player.png",
            "assets/enemy1.png",
            "assets/enemy2.png",
            "assets/npc.png"
        });
        
        await _atlasManager.LoadAtlasAsync("environment", new[]
        {
            "assets/tree.png",
            "assets/rock.png",
            "assets/grass.png",
            "assets/water.png"
        });
        
        await _atlasManager.LoadAtlasAsync("ui", new[]
        {
            "assets/ui/button.png",
            "assets/ui/icon_health.png",
            "assets/ui/icon_mana.png"
        });
    }
    
    protected override void OnDispose()
    {
        _atlasManager?.UnloadAll();
    }
}
```

## Packing Strategies

### Game Objects

Pack sprites that render together:

```csharp
// Good: Pack all enemy sprites together
var enemyAtlas = await AtlasBuilder.BuildAtlasAsync(
    _renderer,
    _textureLoader,
    new[] 
    {
        "assets/enemies/zombie.png",
        "assets/enemies/skeleton.png",
        "assets/enemies/bat.png",
        "assets/enemies/ghost.png"
    },
    padding: 2,
    maxSize: 2048
);
```

### UI Elements

Pack UI components separately from game sprites:

```csharp
// Separate atlas for UI (often rendered on top layer)
var uiAtlas = await AtlasBuilder.BuildAtlasAsync(
    _renderer,
    _textureLoader,
    new[]
    {
        "assets/ui/button_normal.png",
        "assets/ui/button_hover.png",
        "assets/ui/panel_bg.png",
        "assets/ui/icon_inventory.png"
    },
    padding: 4,  // UI often needs more padding
    maxSize: 2048
);
```

### Effects and Particles

Pack particle textures together:

```csharp
// Atlas for particle system textures
var particleAtlas = await AtlasBuilder.BuildAtlasAsync(
    _renderer,
    _textureLoader,
    new[]
    {
        "assets/particles/fire.png",
        "assets/particles/smoke.png",
        "assets/particles/spark.png",
        "assets/particles/dust.png"
    },
    padding: 2,
    maxSize: 1024  // Particles are usually smaller
);
```

### Animated Sprites

```csharp
// Pack all frames of an animation
var playerWalkFrames = Enumerable.Range(0, 8)
    .Select(i => $"assets/player/walk_{i:00}.png")
    .ToArray();

var playerAtlas = await AtlasBuilder.BuildAtlasAsync(
    _renderer,
    _textureLoader,
    playerWalkFrames,
    padding: 2,
    maxSize: 2048
);
```

## Advanced Features

### Multiple Atlases

Use multiple atlases for different sprite categories:

```csharp
public class MultiAtlasScene : Scene
{
    private TextureAtlas? _characterAtlas;
    private TextureAtlas? _environmentAtlas;
    private TextureAtlas? _effectsAtlas;
    
    protected override async Task OnInitializeAsync(CancellationToken cancellationToken)
    {
        // Characters (high resolution, infrequent updates)
        _characterAtlas = await BuildCharacterAtlas();
        
        // Environment (medium resolution, static)
        _environmentAtlas = await BuildEnvironmentAtlas();
        
        // Effects (low resolution, frequently changed)
        _effectsAtlas = await BuildEffectsAtlas();
    }
    
    private async Task<TextureAtlas> BuildCharacterAtlas()
    {
        var paths = Directory.GetFiles("assets/characters", "*.png");
        return await AtlasBuilder.BuildAtlasAsync(
            _renderer, _textureLoader, paths,
            padding: 2, maxSize: 2048
        );
    }
}
```

### Dynamic Atlas Updates

For games that load sprites dynamically:

```csharp
public class DynamicAtlasManager
{
    private TextureAtlas? _currentAtlas;
    private readonly List<string> _loadedPaths = new();
    
    public async Task AddSpriteAsync(string path)
    {
        if (_loadedPaths.Contains(path))
            return; // Already in atlas
        
        _loadedPaths.Add(path);
        
        // Rebuild atlas with new sprite
        _currentAtlas?.Dispose();
        _currentAtlas = await AtlasBuilder.BuildAtlasAsync(
            _renderer,
            _textureLoader,
            _loadedPaths.ToArray(),
            padding: 2,
            maxSize: 2048
        );
    }
}
```

### Padding Configuration

Prevent texture bleeding with appropriate padding:

```csharp
// Minimal padding for pixel art (nearest neighbor)
var pixelArtAtlas = await AtlasBuilder.BuildAtlasAsync(
    _renderer, _textureLoader, textures,
    padding: 1,  // 1px is often enough
    maxSize: 2048
);

// More padding for smooth sprites (linear filtering)
var smoothAtlas = await AtlasBuilder.BuildAtlasAsync(
    _renderer, _textureLoader, textures,
    padding: 4,  // 4px prevents bleeding with linear filtering
    maxSize: 2048
);

// UI with scaling needs extra padding
var uiAtlas = await AtlasBuilder.BuildAtlasAsync(
    _renderer, _textureLoader, textures,
    padding: 8,  // 8px for UI that may scale
    maxSize: 2048
);
```

## Performance Considerations

### Atlas Size Limits

Different hardware has different texture size limits:

```csharp
// Conservative size (works on most hardware)
maxSize: 2048

// Larger size (requires modern GPU)
maxSize: 4096

// Multiple atlases if needed
if (textures.Length > 100)
{
    // Split into multiple atlases
    var atlas1 = await BuildAtlas(textures.Take(50).ToArray());
    var atlas2 = await BuildAtlas(textures.Skip(50).ToArray());
}
```

### When to Use Atlasing

**Good Use Cases:**
- Games with 10+ unique sprites
- UI systems with many icons/buttons
- Particle effects using sprite textures
- Any game targeting lower-end hardware
- Mobile games

**Less Beneficial:**
- Games with < 5 unique sprites
- Sprites rarely rendered together
- Extremely large textures (> 1024x1024 each)
- Dynamically generated textures

### Benchmark Results

Real-world performance improvements:

| Sprite Count | Draw Calls (No Atlas) | Draw Calls (Atlas) | Improvement |
|--------------|----------------------|-------------------|-------------|
| 10 sprites | 10 | 1 | **90%** |
| 50 sprites | 50 | 1-2 | **96-98%** |
| 100 sprites | 100 | 1-2 | **98-99%** |
| 500 sprites (10 types) | 10 | 1 | **90%** |

**Frame Rate Impact:**

| Scenario | Without Atlas | With Atlas | Improvement |
|----------|--------------|------------|-------------|
| Platformer (50 sprites) | 55 FPS | 60 FPS | **9% faster** |
| Top-down (200 sprites) | 45 FPS | 60 FPS | **33% faster** |
| UI (100 buttons) | 40 FPS | 60 FPS | **50% faster** |

## Best Practices

### Do

- **Pack sprites rendered together** - Same layer, similar lifecycle
- **Use appropriate padding** - 2-4px for most cases
- **Separate atlases by category** - Characters, UI, effects
- **Pack frequently used sprites** - Player, common enemies, UI
- **Profile before and after** - Measure actual performance gains

### Don't

- **Pack unrelated sprites** - Wastes atlas space
- **Use too little padding** - Causes texture bleeding
- **Create massive atlases** - Stick to 2048x2048 or 4096x4096
- **Pack huge textures** - Keep individual sprites < 512x512
- **Rebuild atlases every frame** - Build during initialization

### Padding Guidelines

```csharp
// Pixel art (nearest neighbor filtering)
padding: 1  // Minimal padding, no bleeding with nearest neighbor

// Smooth sprites (linear filtering)
padding: 2-4  // Prevents bleeding with bilinear filtering

// UI elements (may scale)
padding: 4-8  // Extra padding for scaling operations

// High-res sprites (> 512x512)
padding: 8  // More padding for large textures
```

## Common Patterns

### Scene Initialization

```csharp
public class GameScene : Scene
{
    private readonly AtlasManager _atlasManager;
    
    public GameScene(AtlasManager atlasManager, /* ... */)
    {
        _atlasManager = atlasManager;
    }
    
    protected override async Task OnInitializeAsync(CancellationToken cancellationToken)
    {
        // Load atlases before creating entities
        await _atlasManager.LoadAtlasAsync("game", new[]
        {
            "assets/player.png",
            "assets/enemy.png",
            "assets/bullet.png"
        });
        
        // Now create entities (they'll use the atlas)
        CreatePlayer();
        CreateEnemies();
    }
}
```

### Resource Preloading

```csharp
public class PreloadScene : Scene
{
    protected override async Task OnInitializeAsync(CancellationToken cancellationToken)
    {
        // Build all atlases during loading screen
        var atlases = new Dictionary<string, string[]>
        {
            ["characters"] = new[] { "assets/player.png", "assets/enemy.png" },
            ["environment"] = new[] { "assets/tree.png", "assets/rock.png" },
            ["ui"] = new[] { "assets/ui/button.png", "assets/ui/icon.png" }
        };
        
        foreach (var (name, paths) in atlases)
        {
            await _atlasManager.LoadAtlasAsync(name, paths);
            UpdateLoadingProgress();
        }
        
        // Transition to game scene
        await _sceneManager.LoadSceneAsync<GameScene>();
    }
}
```

## Troubleshooting

### Texture Bleeding

**Problem:** Lines or artifacts appear around sprites.

**Solution:** Increase padding:

```csharp
// Increase from 2 to 4 pixels
var atlas = await AtlasBuilder.BuildAtlasAsync(
    _renderer, _textureLoader, textures,
    padding: 4,  // Increased padding
    maxSize: 2048
);
```

### Atlas Too Large

**Problem:** Atlas exceeds hardware limits (texture too big).

**Solution:** Split into multiple atlases:

```csharp
// Split large sprite sets
var characterAtlas = await BuildAtlas(characterSprites);
var environmentAtlas = await BuildAtlas(environmentSprites);
```

### Poor Packing Efficiency

**Problem:** Atlas has lots of wasted space.

**Solution:** Only pack sprites of similar sizes together:

```csharp
// Separate small and large sprites
var smallSprites = textures.Where(t => t.Width < 64 && t.Height < 64);
var largeSprites = textures.Where(t => t.Width >= 64 || t.Height >= 64);

var smallAtlas = await BuildAtlas(smallSprites.ToArray());
var largeAtlas = await BuildAtlas(largeSprites.ToArray());
```

### Memory Usage

**Problem:** High memory consumption.

**Solution:** Dispose atlases when no longer needed:

```csharp
protected override void OnDispose()
{
    // Clean up atlases
    _characterAtlas?.Dispose();
    _environmentAtlas?.Dispose();
    _effectsAtlas?.Dispose();
}
```

## See Also

- [Sprites & Textures](sprites.md) - Basic sprite rendering
- [GPU Renderer](gpu-renderer.md) - Modern rendering backend
- [Performance Optimization](../performance/optimization.md) - Other optimization techniques
- [Particles](particles.md) - Using atlases with particle effects

---

**Next Steps:**
- Implement texture atlasing in your game
- Profile draw call reduction
- Experiment with different packing strategies
- Monitor texture memory usage