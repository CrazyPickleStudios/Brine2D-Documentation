---
title: Particle System
description: Create stunning particle effects with Brine2D's pooled particle system
---

# Particle System

Create fire, explosions, smoke, and other visual effects with Brine2D's high-performance particle system featuring automatic object pooling and zero GC pressure.

## Overview

Brine2D's particle system uses object pooling to render thousands of particles without allocating memory. Particles are reused from a pool, ensuring smooth performance even with complex effects.

~~~mermaid
graph LR
    A[ParticleEmitterComponent] --> B[ObjectPool]
    B --> C[Particle Instance]
    C --> D[Update Position]
    C --> E[Update Color]
    C --> F[Update Size]
    D --> G{Expired?}
    E --> G
    F --> G
    G -->|Yes| H[Return to Pool]
    G -->|No| I[Render]
    H --> B
~~~

---

## Quick Start

### Basic Particle Emitter

Create a simple particle effect:

~~~csharp
using Brine2D.ECS;
using Brine2D.ECS.Components;
using Brine2D.Rendering.ECS;
using System.Numerics;

public class GameScene : Scene
{
    private readonly IEntityWorld _world;
    
    protected override void OnInitialize()
    {
        // Create entity with particle emitter
        var fireEffect = _world.CreateEntity("Fire");
        
        var transform = fireEffect.AddComponent<TransformComponent>();
        transform.Position = new Vector2(400, 300);
        
        var emitter = fireEffect.AddComponent<ParticleEmitterComponent>();
        emitter.IsEmitting = true;
        emitter.EmissionRate = 50f; // 50 particles per second
        emitter.MaxParticles = 200;
        emitter.ParticleLifetime = 2f; // Seconds
        
        // Appearance
        emitter.StartColor = new Color(255, 200, 0, 255); // Bright yellow
        emitter.EndColor = new Color(255, 50, 0, 0); // Dark red, transparent
        emitter.StartSize = 8f;
        emitter.EndSize = 2f;
        
        // Physics
        emitter.InitialVelocity = new Vector2(0, -50); // Upward
        emitter.VelocitySpread = 30f; // Random angle variance
        emitter.Gravity = new Vector2(0, 100); // Pull down
    }
}
~~~

That's it! The `ParticleSystem` will automatically update and render particles.

---

## Particle Properties

### Emission Properties

Control how particles are spawned:

~~~csharp
var emitter = entity.AddComponent<ParticleEmitterComponent>();

// Basic emission
emitter.IsEmitting = true; // Toggle emission on/off
emitter.EmissionRate = 50f; // Particles per second
emitter.MaxParticles = 200; // Pool size (max concurrent particles)
emitter.ParticleLifetime = 2f; // How long each particle lives (seconds)

// Spawn area
emitter.SpawnRadius = 10f; // Random spawn within radius (0 = point source)
~~~

**Emission Patterns:**

~~~csharp
// Point source (SpawnRadius = 0)
emitter.SpawnRadius = 0f;

// Area emitter (SpawnRadius > 0)
emitter.SpawnRadius = 20f;

// One-shot burst
emitter.IsEmitting = false;
emitter.EmitBurst(50); // Emit 50 particles immediately
~~~

---

### Visual Properties

Control particle appearance:

~~~csharp
// Color interpolation (start → end over lifetime)
emitter.StartColor = new Color(255, 200, 0, 255); // Bright yellow, opaque
emitter.EndColor = new Color(255, 50, 0, 0); // Dark red, transparent

// Size interpolation (start → end over lifetime)
emitter.StartSize = 8f; // pixels
emitter.EndSize = 2f; // Shrink over time
~~~

**Color Tricks:**

~~~csharp
// Fade out (keep color, reduce alpha)
emitter.StartColor = new Color(255, 255, 255, 255); // White, opaque
emitter.EndColor = new Color(255, 255, 255, 0); // White, transparent

// Color shift (red → blue)
emitter.StartColor = new Color(255, 0, 0, 255); // Red
emitter.EndColor = new Color(0, 0, 255, 255); // Blue

// Constant color
emitter.StartColor = Color.White;
emitter.EndColor = Color.White; // No change
~~~

---

### Physics Properties

Control particle movement:

~~~csharp
// Initial velocity (pixels per second)
emitter.InitialVelocity = new Vector2(0, -100); // Upward

// Velocity spread (random angle variance in degrees)
emitter.VelocitySpread = 45f; // ±45° cone

// Gravity (acceleration, pixels per second²)
emitter.Gravity = new Vector2(0, 200); // Pull down

// No gravity (floating particles)
emitter.Gravity = Vector2.Zero;
~~~

**Velocity Spread Visualization:**

~~~
VelocitySpread = 0°       VelocitySpread = 45°      VelocitySpread = 180°
       ↑                      ╱ ↑ ╲                    ← ↑ →
       ↑                    ╱   ↑   ╲                  ↓ ↑ ↓
       ↑                  ╱     ↑     ╲
  (all same)         (cone shape)            (all directions)
~~~

---

## Preset Effects

### Fire Effect

~~~csharp
var fireEmitter = entity.AddComponent<ParticleEmitterComponent>();
fireEmitter.IsEmitting = true;
fireEmitter.EmissionRate = 50f;
fireEmitter.MaxParticles = 200;
fireEmitter.ParticleLifetime = 2f;

// Colors: yellow → red → transparent
fireEmitter.StartColor = new Color(255, 200, 0, 255);
fireEmitter.EndColor = new Color(255, 50, 0, 0);

// Size: shrink over time
fireEmitter.StartSize = 8f;
fireEmitter.EndSize = 2f;

// Physics: rise upward with slight spread
fireEmitter.InitialVelocity = new Vector2(0, -100);
fireEmitter.VelocitySpread = 30f;
fireEmitter.Gravity = new Vector2(0, 50); // Slight downward pull
fireEmitter.SpawnRadius = 10f;
~~~

---

### Explosion Effect

~~~csharp
var explosionEmitter = entity.AddComponent<ParticleEmitterComponent>();

// One-shot burst
explosionEmitter.IsEmitting = false;
explosionEmitter.EmitBurst(100); // 100 particles at once

explosionEmitter.MaxParticles = 100;
explosionEmitter.ParticleLifetime = 1f; // Short-lived

// Colors: white → orange → transparent
explosionEmitter.StartColor = new Color(255, 255, 255, 255);
explosionEmitter.EndColor = new Color(255, 100, 0, 0);

// Size: start large, shrink
explosionEmitter.StartSize = 12f;
explosionEmitter.EndSize = 2f;

// Physics: explode outward in all directions
explosionEmitter.InitialVelocity = new Vector2(0, -200); // Fast
explosionEmitter.VelocitySpread = 180f; // All directions
explosionEmitter.Gravity = new Vector2(0, 500); // Strong gravity
~~~

---

### Smoke Effect

~~~csharp
var smokeEmitter = entity.AddComponent<ParticleEmitterComponent>();
smokeEmitter.IsEmitting = true;
smokeEmitter.EmissionRate = 20f; // Slow emission
smokeEmitter.MaxParticles = 100;
smokeEmitter.ParticleLifetime = 3f; // Long-lived

// Colors: dark gray → light gray → transparent
smokeEmitter.StartColor = new Color(60, 60, 60, 200);
smokeEmitter.EndColor = new Color(150, 150, 150, 0);

// Size: grow over time
smokeEmitter.StartSize = 4f;
smokeEmitter.EndSize = 12f; // Expand

// Physics: rise slowly with spread
smokeEmitter.InitialVelocity = new Vector2(0, -30);
smokeEmitter.VelocitySpread = 20f;
smokeEmitter.Gravity = new Vector2(0, -10); // Slight upward drift
smokeEmitter.SpawnRadius = 5f;
~~~

---

### Sparkle Effect

~~~csharp
var sparkleEmitter = entity.AddComponent<ParticleEmitterComponent>();
sparkleEmitter.IsEmitting = true;
sparkleEmitter.EmissionRate = 30f;
sparkleEmitter.MaxParticles = 150;
sparkleEmitter.ParticleLifetime = 1.5f;

// Colors: bright → transparent (keep brightness)
sparkleEmitter.StartColor = new Color(255, 255, 200, 255);
sparkleEmitter.EndColor = new Color(255, 255, 200, 0);

// Size: constant
sparkleEmitter.StartSize = 3f;
sparkleEmitter.EndSize = 3f;

// Physics: float randomly
sparkleEmitter.InitialVelocity = new Vector2(0, -20);
sparkleEmitter.VelocitySpread = 180f; // All directions
sparkleEmitter.Gravity = Vector2.Zero; // No gravity (float)
sparkleEmitter.SpawnRadius = 15f;
~~~

---

### Trail Effect

~~~csharp
// Attach to moving entity (player, projectile, etc.)
var trailEmitter = entity.AddComponent<ParticleEmitterComponent>();
trailEmitter.IsEmitting = true;
trailEmitter.EmissionRate = 100f; // High rate for continuous trail
trailEmitter.MaxParticles = 200;
trailEmitter.ParticleLifetime = 0.5f; // Short-lived

// Colors: bright → fade out
trailEmitter.StartColor = new Color(100, 200, 255, 255);
trailEmitter.EndColor = new Color(100, 200, 255, 0);

// Size: shrink quickly
trailEmitter.StartSize = 6f;
trailEmitter.EndSize = 1f;

// Physics: no velocity (stay where spawned)
trailEmitter.InitialVelocity = Vector2.Zero;
trailEmitter.VelocitySpread = 0f;
trailEmitter.Gravity = Vector2.Zero;
trailEmitter.SpawnRadius = 0f; // Point source
~~~

---

## Advanced Techniques

### Burst Patterns

Create rhythmic effects:

~~~csharp
public class BurstEffectSystem : ECSSystem
{
    private float _burstTimer = 0f;
    private const float BURST_INTERVAL = 1f; // Once per second
    
    public override void Update(GameTime gameTime)
    {
        _burstTimer += (float)gameTime.DeltaTime;
        
        if (_burstTimer >= BURST_INTERVAL)
        {
            _burstTimer = 0f;
            
            // Emit burst
            var emitter = GetEmitter();
            emitter.EmitBurst(20);
        }
    }
}
~~~

---

### Dynamic Colors

Change colors based on game state:

~~~csharp
public class DynamicParticleSystem : ECSSystem
{
    public override void Update(GameTime gameTime)
    {
        var emitter = GetEmitter();
        var health = GetPlayerHealth();
        
        // Red at low health, green at full health
        var healthPercent = health / 100f;
        
        emitter.StartColor = Color.Lerp(
            Color.Red,
            Color.Green,
            healthPercent
        );
    }
}
~~~

---

### Gravity Wells

Create attraction/repulsion effects:

~~~csharp
// Custom particle update (advanced)
public class GravityWellSystem : ECSSystem
{
    private readonly Vector2 _gravityWellPosition;
    private readonly float _gravityStrength = 500f;
    
    public override void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Get all particle emitters
        foreach (var entity in World.Query().With<ParticleEmitterComponent>().Execute())
        {
            var emitter = entity.GetComponent<ParticleEmitterComponent>();
            
            // Access internal particles (if exposed by API)
            foreach (var particle in emitter.Particles)
            {
                // Calculate gravity toward well
                var direction = _gravityWellPosition - particle.Position;
                var distance = direction.Length();
                
                if (distance > 0)
                {
                    direction /= distance; // Normalize
                    var force = _gravityStrength / (distance * distance);
                    particle.Velocity += direction * force * deltaTime;
                }
            }
        }
    }
}
~~~

---

## Performance

### Object Pooling

Particles use object pooling automatically - no GC allocations!

~~~csharp
// Under the hood (you don't need to do this):
public class ParticleEmitterComponent
{
    private readonly ObjectPool<Particle> _pool;
    
    private void EmitParticle()
    {
        var particle = _pool.Get(); // ✅ Reuse from pool
        // Configure particle...
    }
    
    private void KillParticle(Particle particle)
    {
        _pool.Return(particle); // ✅ Return to pool
    }
}
~~~

**Benefits:**
- Zero allocation per particle
- No GC pressure
- Thousands of particles at 60 FPS

---

### Performance Tips

~~~csharp
// ✅ GOOD: Reasonable particle counts
emitter.MaxParticles = 200; // ~200 particles = negligible cost

// ⚠️ ACCEPTABLE: Many particles
emitter.MaxParticles = 1000; // ~1000 particles = minor cost

// ❌ BAD: Too many particles
emitter.MaxParticles = 10000; // > 10k particles = significant cost

// ✅ SOLUTION: Use multiple smaller emitters
for (int i = 0; i < 10; i++)
{
    var smallEmitter = CreateEmitter();
    smallEmitter.MaxParticles = 100; // 10 x 100 = 1000 total
}
~~~

**Performance Guidelines:**
- **< 500 particles per emitter** - Excellent performance
- **500-1000 particles** - Good performance
- **> 1000 particles** - Consider splitting into multiple emitters

---

## Monitoring

### Check Particle Count

~~~csharp
var emitter = entity.GetComponent<ParticleEmitterComponent>();

Logger.LogDebug($"Active particles: {emitter.ParticleCount}/{emitter.MaxParticles}");

if (emitter.ParticleCount >= emitter.MaxParticles)
{
    Logger.LogWarning("Particle pool exhausted! Consider increasing MaxParticles.");
}
~~~

---

### Performance Stats

Use the performance overlay to monitor particle impact:

~~~csharp
// Enable performance monitoring
builder.Services.AddPerformanceMonitoring(options =>
{
    options.EnableOverlay = true;
    options.ShowDetailedStats = true;
});

// Check stats while particles are active
// Press F3 to toggle detailed stats
// Look for "Sprites" count (includes particles)
~~~

---

## Best Practices

### DO

✅ **Use pooling (automatic)**

Particles are automatically pooled - just create emitters!

✅ **Set reasonable MaxParticles**

~~~csharp
emitter.MaxParticles = 200; // Enough for most effects
~~~

✅ **Use bursts for one-shot effects**

~~~csharp
emitter.IsEmitting = false;
emitter.EmitBurst(50); // Explosion, impact, etc.
~~~

✅ **Disable when not visible**

~~~csharp
if (!IsVisible(emitter))
{
    emitter.IsEmitting = false;
}
~~~

### DON'T

❌ **Don't create too many emitters**

Each emitter has overhead - reuse when possible.

❌ **Don't set MaxParticles too high**

Start small (200), increase if needed.

❌ **Don't update particles manually**

Let the `ParticleSystem` handle updates.

---

## Next Steps

<div class="grid cards" markdown>

-   **Performance Optimization**

    ---

    Learn zero-allocation patterns

    [:octicons-arrow-right-24: Optimization Guide](../performance/optimization.md)

-   **Sprite Rendering**

    ---

    Master sprite batching

    [:octicons-arrow-right-24: Sprites Guide](sprites.md)

-   **Demo Scenes**

    ---

    See particles in action

    [:octicons-arrow-right-24: Feature Demos](../../samples/index.md)

</div>

---

**Remember:** Start simple, profile often, optimize when needed!