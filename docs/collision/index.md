---
title: Collision Detection
description: Collision detection and physics response in Brine2D games
---

# Collision Detection

Learn how to detect collisions between game objects and implement physics responses in your Brine2D games.

---

## Quick Start

```csharp
using Brine2D.Collision;

public class CollisionScene : Scene
{
    private readonly CollisionSystem _collisionSystem;
    private BoxCollider _playerCollider;
    private List<BoxCollider> _walls = new();
    
    public CollisionScene(CollisionSystem collisionSystem)
    {
        _collisionSystem = collisionSystem;
    }
    
    protected override Task OnLoadAsync(CancellationToken ct)
    {
        // Create player collider
        _playerCollider = new BoxCollider(400, 300, 50, 50)
        {
            Tag = "Player"
        };
        
        // Create walls
        _walls.Add(new BoxCollider(0, 0, 800, 10) { Tag = "Wall" });    // Top
        _walls.Add(new BoxCollider(0, 590, 800, 10) { Tag = "Wall" }); // Bottom
        _walls.Add(new BoxCollider(0, 0, 10, 600) { Tag = "Wall" });   // Left
        _walls.Add(new BoxCollider(790, 0, 10, 600) { Tag = "Wall" }); // Right
        
        return Task.CompletedTask;
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Move player
        var moveX = 0f;
        var moveY = 0f;
        
        if (_input.IsKeyDown(Key.W)) moveY -= 200;
        if (_input.IsKeyDown(Key.S)) moveY += 200;
        if (_input.IsKeyDown(Key.A)) moveX -= 200;
        if (_input.IsKeyDown(Key.D)) moveX += 200;
        
        var deltaTime = (float)gameTime.DeltaTime;
        _playerCollider.X += moveX * deltaTime;
        _playerCollider.Y += moveY * deltaTime;
        
        // Check collisions
        foreach (var wall in _walls)
        {
            if (_collisionSystem.CheckCollision(_playerCollider, wall))
            {
                // Simple collision response - push back
                var penetration = _collisionSystem.GetPenetration(_playerCollider, wall);
                _playerCollider.X -= penetration.X;
                _playerCollider.Y -= penetration.Y;
            }
        }
    }
}
```

---

## Topics

### Getting Started

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Collision System](system.md)** | Using CollisionSystem for detection | ⭐ Beginner |
| **[Colliders](colliders.md)** | Box and circle colliders | ⭐ Beginner |

---

## Key Concepts

### Collision System

The `CollisionSystem` provides collision detection and response:

```csharp
public class CollisionSystem
{
    // Check if two colliders intersect
    bool CheckCollision(ICollider a, ICollider b);
    
    // Get all collisions for a collider
    IEnumerable<ICollider> GetCollisions(ICollider collider);
    
    // Get penetration depth (for resolution)
    Vector2 GetPenetration(ICollider a, ICollider b);
    
    // Register/unregister colliders
    void Register(ICollider collider);
    void Unregister(ICollider collider);
}
```

**Register as scoped service** (per-scene):

```csharp
builder.Services.AddCollisionSystem();
```

[:octicons-arrow-right-24: Full guide: Collision System](system.md)

---

### Collider Types

Brine2D supports two collider types:

| Type | Shape | Best For |
|------|-------|----------|
| **BoxCollider** | Rectangle (AABB) | Walls, platforms, most objects |
| **CircleCollider** | Circle | Balls, explosions, round objects |

```csharp
// Box collider (x, y, width, height)
var box = new BoxCollider(100, 100, 50, 50);

// Circle collider (x, y, radius)
var circle = new CircleCollider(200, 200, 25);
```

[:octicons-arrow-right-24: Full guide: Colliders](colliders.md)

---

## Common Tasks

### Player vs Walls (Blocking)

```csharp
// Try to move
var newPosition = _playerPosition + moveVector;
_playerCollider.Position = newPosition;

// Check collisions
var collisions = _collisionSystem.GetCollisions(_playerCollider);
if (collisions.Any(c => c.Tag == "Wall"))
{
    // Hit wall - revert movement
    _playerCollider.Position = _playerPosition;
}
else
{
    // No collision - update position
    _playerPosition = newPosition;
}
```

---

### Sliding Along Walls

```csharp
// Try full movement
_playerCollider.Position = _playerPosition + moveVector;

if (_collisionSystem.GetCollisions(_playerCollider).Any(c => c.Tag == "Wall"))
{
    // Try X-only movement
    _playerCollider.Position = _playerPosition + new Vector2(moveVector.X, 0);
    if (!_collisionSystem.GetCollisions(_playerCollider).Any(c => c.Tag == "Wall"))
    {
        _playerPosition = _playerCollider.Position;
    }
    else
    {
        // Try Y-only movement
        _playerCollider.Position = _playerPosition + new Vector2(0, moveVector.Y);
        if (!_collisionSystem.GetCollisions(_playerCollider).Any(c => c.Tag == "Wall"))
        {
            _playerPosition = _playerCollider.Position;
        }
        else
        {
            // Blocked both directions
            _playerCollider.Position = _playerPosition;
        }
    }
}
else
{
    _playerPosition = _playerCollider.Position;
}
```

---

### Collectibles (Triggers)

```csharp
private List<CircleCollider> _coins = new();

// Check player vs coins
var collectedCoins = _coins.Where(coin => 
    _collisionSystem.CheckCollision(_playerCollider, coin)
).ToList();

foreach (var coin in collectedCoins)
{
    _coins.Remove(coin);
    _score += 10;
    _audio.PlaySound(_collectSound);
    
    Logger.LogInformation("Collected coin! Score: {Score}", _score);
}
```

---

### Damage on Contact

```csharp
// Check player vs enemies
foreach (var enemy in _enemies)
{
    if (_collisionSystem.CheckCollision(_playerCollider, enemy.Collider))
    {
        // Take damage
        _playerHealth -= 10;
        _audio.PlaySound(_hitSound);
        
        // Knockback
        var direction = (_playerPosition - enemy.Position).Normalized();
        _playerVelocity = direction * 300f;
        
        Logger.LogWarning("Hit by enemy! Health: {Health}", _playerHealth);
    }
}
```

---

### Physics Response (Bounce)

```csharp
// Ball bouncing off walls
foreach (var wall in _walls)
{
    if (_collisionSystem.CheckCollision(_ballCollider, wall))
    {
        var penetration = _collisionSystem.GetPenetration(_ballCollider, wall);
        
        // Resolve penetration
        _ballPosition -= penetration;
        _ballCollider.Position = _ballPosition;
        
        // Bounce velocity
        if (Math.Abs(penetration.X) > Math.Abs(penetration.Y))
        {
            _ballVelocity.X *= -1;  // Bounce horizontally
        }
        else
        {
            _ballVelocity.Y *= -1;  // Bounce vertically
        }
        
        // Apply damping (energy loss)
        _ballVelocity *= 0.8f;
    }
}
```

---

## Performance Tips

### Spatial Partitioning

```csharp
// For many colliders, use spatial partitioning
var grid = new SpatialGrid(cellSize: 100);

// Register colliders with grid
foreach (var collider in _colliders)
{
    grid.Add(collider);
}

// Check only nearby colliders
var nearbyColliders = grid.GetNearby(_playerCollider);
foreach (var collider in nearbyColliders)
{
    if (_collisionSystem.CheckCollision(_playerCollider, collider))
    {
        // Handle collision
    }
}
```

---

### Limit Collision Checks

```csharp
// Don't check every frame if not needed
private float _collisionCheckTimer = 0f;
private const float CollisionCheckInterval = 0.1f;  // 10 times per second

protected override void OnUpdate(GameTime gameTime)
{
    _collisionCheckTimer += (float)gameTime.DeltaTime;
    
    if (_collisionCheckTimer >= CollisionCheckInterval)
    {
        _collisionCheckTimer = 0f;
        
        // Check collisions
        CheckCollisions();
    }
}
```

---

## Best Practices

### ✅ DO

1. **Use appropriate collider shapes** - Box for most, circle for round
2. **Register collision system as scoped** - Per-scene instance
3. **Use tags for filtering** - Identify collider types
4. **Separate movement and collision** - Update position, then resolve
5. **Apply damping for physics** - Energy loss on bounce

```csharp
// ✅ Good pattern
var newPosition = _position + _velocity * deltaTime;
_collider.Position = newPosition;

// Check and resolve collisions
foreach (var collision in _collisionSystem.GetCollisions(_collider))
{
    // Handle collision
    var penetration = _collisionSystem.GetPenetration(_collider, collision);
    _collider.Position -= penetration;
    _position = _collider.Position;
}
```

---

### ❌ DON'T

1. **Don't update collider every frame** - Only when position changes
2. **Don't check all vs all** - Use spatial partitioning
3. **Don't forget to unregister** - Memory leaks
4. **Don't use collision for rendering** - Colliders are for physics only
5. **Don't make colliders too small** - Hard to debug

```csharp
// ❌ Bad pattern
protected override void OnUpdate(GameTime gameTime)
{
    // Checking all vs all - O(n²)
    foreach (var a in _allColliders)
    {
        foreach (var b in _allColliders)
        {
            if (a != b && _collisionSystem.CheckCollision(a, b))
            {
                // Very slow!
            }
        }
    }
}
```

---

## Troubleshooting

### Collisions Not Detected

**Symptom:** Objects pass through each other

**Solutions:**

1. **Check colliders are registered:**

```csharp
_collisionSystem.Register(_playerCollider);
```

2. **Verify positions are updated:**

```csharp
_collider.Position = _entityPosition;  // Keep in sync
```

3. **Check collider sizes:**

```csharp
Logger.LogDebug("Collider: X={X}, Y={Y}, W={W}, H={H}", 
    _collider.X, _collider.Y, _collider.Width, _collider.Height);
```

---

### Jittery Movement

**Symptom:** Object stutters when colliding

**Cause:** Repeatedly entering/exiting collision state

**Solution:** Add small buffer or use velocity damping

```csharp
// Add small buffer to prevent re-entry
var penetration = _collisionSystem.GetPenetration(_collider, wall);
_collider.Position -= penetration * 1.1f;  // 10% extra buffer
```

---

### Poor Performance

**Symptom:** FPS drops with many colliders

**Solutions:**

1. **Use spatial partitioning:**

```csharp
var grid = new SpatialGrid(100);  // 100x100 cells
grid.Add(_colliders);
var nearby = grid.GetNearby(_player);
```

2. **Reduce check frequency:**

```csharp
// Check every 0.1 seconds instead of every frame
if (_timer > 0.1f)
{
    CheckCollisions();
    _timer = 0f;
}
```

---

## Related Topics

- [Collision System](system.md) - System details
- [Colliders](colliders.md) - Collider types
- [Tutorials: Collision Detection](../tutorials/collision.md) - Step-by-step tutorial
- [Performance Optimization](../performance/optimization.md) - Optimize collision detection

---

**Ready to add collisions?** Start with [Collision System](system.md)!