---
title: Spatial Audio
description: 2D positional audio with distance attenuation and stereo panning
---

# Spatial Audio

Spatial audio simulates sound positioning in 2D space, making your game world feel more immersive with distance-based volume attenuation and stereo panning.

## What is Spatial Audio?

Spatial audio (also called positional audio) adjusts sound based on the distance and direction between a sound source and an audio listener. As entities move in your game world, sounds automatically fade, pan left/right, and change volume to match their spatial relationships.

**Key Features:**
- **Distance attenuation** - Sounds fade as they move away from the listener
- **Stereo panning** - Sounds pan left/right based on horizontal position
- **Real-time updates** - Audio adjusts every frame as entities move
- **Configurable curves** - Linear, quadratic, or custom falloff
- **ECS integration** - Component-based audio sources and listeners

## Basic Concepts

### Audio Listener

The listener represents the "ears" in your game world - typically attached to the player or camera.

**Properties:**

- `GlobalSpatialVolume` - Master volume for all spatial audio (0.0 to 10.0)
- `IsEnabled` - Toggle spatial audio processing

### Audio Source

A positioned sound emitter in your game world - enemies, pickups, environmental effects, etc.

**Properties:**

- `MinDistance` - Full volume within this radius
- `MaxDistance` - Silent beyond this radius
- `RolloffFactor` - How quickly sound fades (1.0 = linear, 2.0 = quadratic)
- `SpatialBlend` - Stereo effect strength (0.0 = mono, 1.0 = full stereo)
- `Volume` - Base volume before spatial processing
- `EnableSpatialAudio` - Toggle spatial audio for this source

### Distance Attenuation

Sound volume decreases with distance from the listener:

```
Volume = BaseVolume × AttenuationFactor

Where:
- AttenuationFactor = 1.0 (full volume) within MinDistance
- AttenuationFactor = 0.0 (silent) beyond MaxDistance
- AttenuationFactor = calculated curve between Min/Max
```

### Stereo Panning

Sound position affects left/right speaker balance:

```
Pan = -1.0 (full left) to +1.0 (full right)

Calculated from:
- Direction vector from listener to source
- X component determines pan (-1 = left, +1 = right)
- SpatialBlend controls strength of effect
```

## Setup

### Register AudioSystem

AudioSystem processes spatial audio every frame:

```csharp
builder.Services.ConfigureSystemPipelines(pipelines =>
{
    pipelines.AddSystem<AudioSystem>();  // Update order: 300
});
```

### Create Audio Listener

Typically attached to the player or camera:

```csharp
using Brine2D.Audio.ECS;

// Create player with audio listener
var player = _world.CreateEntity("Player");

var transform = player.AddComponent<TransformComponent>();
transform.Position = new Vector2(640, 360);

var listener = player.AddComponent<AudioListenerComponent>();
listener.GlobalSpatialVolume = 1.0f;  // Master spatial audio volume
listener.IsEnabled = true;
```

### Create Audio Source

Attach to any entity that should emit sound:

```csharp
// Create enemy with spatial audio
var enemy = _world.CreateEntity("Enemy");

var transform = enemy.AddComponent<TransformComponent>();
transform.Position = new Vector2(200, 300);

var audioSource = enemy.AddComponent<AudioSourceComponent>();
audioSource.SoundEffect = enemyGrowlSound;
audioSource.EnableSpatialAudio = true;

// Distance settings
audioSource.MinDistance = 100f;   // Full volume within 100 pixels
audioSource.MaxDistance = 500f;   // Silent beyond 500 pixels
audioSource.RolloffFactor = 1.0f; // Linear falloff

// Stereo settings
audioSource.SpatialBlend = 1.0f;  // Full stereo panning

// Playback
audioSource.Volume = 0.7f;
audioSource.Loop = true;
audioSource.LoopCount = -1;
audioSource.PlayOnEnable = true;
```

## Distance Attenuation

### Linear Falloff

Sound decreases evenly with distance (most natural):

```csharp
audioSource.RolloffFactor = 1.0f;  // Linear

// Volume decreases smoothly from Min to Max distance
// Example: At 50% distance, volume is ~50%
```

### Quadratic Falloff

Sound decreases rapidly, then slowly (dramatic):

```csharp
audioSource.RolloffFactor = 2.0f;  // Quadratic

// Volume drops quickly near source, gradually far away
// Example: At 50% distance, volume is ~25%
```

### Custom Falloff

Use intermediate values for custom curves:

```csharp
audioSource.RolloffFactor = 1.5f;  // Exponential-ish

// Smoother curve between linear and quadratic
// Useful for fine-tuning specific sound types
```

### No Falloff

Constant volume within range (on/off):

```csharp
audioSource.RolloffFactor = 0f;  // No falloff

// Full volume from MinDistance to MaxDistance
// Useful for ambient zones or music triggers
```

### Distance Configuration

Typical distance ranges for different sound types:

```csharp
// Small sound (coins, footsteps)
audioSource.MinDistance = 50f;
audioSource.MaxDistance = 200f;

// Medium sound (weapon fire, enemy attacks)
audioSource.MinDistance = 100f;
audioSource.MaxDistance = 500f;

// Large sound (explosions, boss roars)
audioSource.MinDistance = 150f;
audioSource.MaxDistance = 800f;

// Environmental ambient (waterfalls, wind)
audioSource.MinDistance = 200f;
audioSource.MaxDistance = 1000f;
```

## Stereo Panning

### Full Stereo

Sounds pan completely left/right:

```csharp
audioSource.SpatialBlend = 1.0f;  // Full stereo

// Sound to the left plays in left speaker
// Sound to the right plays in right speaker
// Maximum spatial awareness
```

### Partial Stereo

Balanced between center and stereo:

```csharp
audioSource.SpatialBlend = 0.5f;  // 50% stereo

// Sound is partially centered
// Subtle left/right positioning
// Good for background sounds
```

### Mono (Center)

No panning, always centered:

```csharp
audioSource.SpatialBlend = 0.0f;  // Mono

// Sound plays equally in both speakers
// No directional information
// Good for UI sounds or ambient background
```

### Panning Examples

```csharp
// Directional effects (footsteps, movement)
audioSource.SpatialBlend = 1.0f;  // Full stereo for clear direction

// Ambient sounds (wind, water)
audioSource.SpatialBlend = 0.6f;  // Some stereo, mostly centered

// Important sounds (pickups, objectives)
audioSource.SpatialBlend = 0.8f;  // Strong stereo, easy to locate

// Background music triggers
audioSource.SpatialBlend = 0.3f;  // Mostly centered, subtle panning
```

## Complete Examples

### Enemy Audio

Enemy that growls when nearby:

```csharp
public void CreateEnemy(Vector2 position, ISoundEffect growlSound)
{
    var enemy = _world.CreateEntity("Enemy");
    
    // Position
    var transform = enemy.AddComponent<TransformComponent>();
    transform.Position = position;
    
    // Spatial audio
    var audio = enemy.AddComponent<AudioSourceComponent>();
    audio.SoundEffect = growlSound;
    audio.EnableSpatialAudio = true;
    
    // Threatening medium-distance sound
    audio.MinDistance = 80f;
    audio.MaxDistance = 400f;
    audio.RolloffFactor = 1.5f;  // Drops off faster than linear
    audio.SpatialBlend = 0.9f;   // Strong directional cue
    audio.Volume = 0.6f;
    
    // Loop continuously
    audio.Loop = true;
    audio.LoopCount = -1;
    audio.PlayOnEnable = true;
}
```

### Collectible Coin

Coin that jingles when player is near:

```csharp
public void CreateCoin(Vector2 position, ISoundEffect jingleSound)
{
    var coin = _world.CreateEntity("Coin");
    
    // Position
    var transform = coin.AddComponent<TransformComponent>();
    transform.Position = position;
    
    // Spatial audio
    var audio = coin.AddComponent<AudioSourceComponent>();
    audio.SoundEffect = jingleSound;
    audio.EnableSpatialAudio = true;
    
    // Short-range, clear positioning
    audio.MinDistance = 40f;
    audio.MaxDistance = 200f;
    audio.RolloffFactor = 1.0f;  // Linear
    audio.SpatialBlend = 1.0f;   // Full stereo for easy location
    audio.Volume = 0.5f;
    
    // Loop at low rate for presence
    audio.Loop = true;
    audio.LoopCount = -1;
    audio.PlayOnEnable = true;
}
```

### Explosion Effect

One-shot explosion with spatial positioning:

```csharp
public void CreateExplosion(Vector2 position, ISoundEffect explosionSound)
{
    var explosion = _world.CreateEntity("Explosion");
    
    // Position
    var transform = explosion.AddComponent<TransformComponent>();
    transform.Position = position;
    
    // Spatial audio
    var audio = explosion.AddComponent<AudioSourceComponent>();
    audio.SoundEffect = explosionSound;
    audio.EnableSpatialAudio = true;
    
    // Long-range, dramatic falloff
    audio.MinDistance = 150f;
    audio.MaxDistance = 800f;
    audio.RolloffFactor = 2.0f;  // Quadratic - loud up close
    audio.SpatialBlend = 0.8f;   // Mostly directional
    audio.Volume = 0.9f;
    
    // One-shot sound
    audio.Loop = false;
    audio.TriggerPlay = true;
    
    // Destroy entity after sound finishes
    explosion.AddComponent<LifetimeComponent>().Lifetime = 3f;
}
```

### Environmental Ambient

Waterfall sound that gets louder as player approaches:

```csharp
public void CreateWaterfall(Vector2 position, ISoundEffect waterfallSound)
{
    var waterfall = _world.CreateEntity("Waterfall");
    
    // Position
    var transform = waterfall.AddComponent<TransformComponent>();
    transform.Position = position;
    
    // Spatial audio
    var audio = waterfall.AddComponent<AudioSourceComponent>();
    audio.SoundEffect = waterfallSound;
    audio.EnableSpatialAudio = true;
    
    // Large ambient range
    audio.MinDistance = 200f;
    audio.MaxDistance = 1000f;
    audio.RolloffFactor = 1.2f;  // Slightly faster than linear
    audio.SpatialBlend = 0.5f;   // Subtle panning (omni-directional)
    audio.Volume = 0.4f;
    
    // Continuous ambient loop
    audio.Loop = true;
    audio.LoopCount = -1;
    audio.PlayOnEnable = true;
}
```

## Runtime Control

### Dynamic Playback

Control audio sources at runtime:

```csharp
// Start playing
audioSource.TriggerPlay = true;

// Stop playing
audioSource.TriggerStop = true;

// Toggle on/off
audioSource.IsEnabled = !audioSource.IsEnabled;

// Check state
if (audioSource.IsPlaying)
{
    Logger.LogInfo("Sound is playing");
}
```

### Adjust Properties

Modify spatial properties dynamically:

```csharp
// Change volume based on game state
if (playerInCombat)
{
    ambientAudio.Volume = 0.2f;  // Quieter during combat
}
else
{
    ambientAudio.Volume = 0.5f;  // Louder when calm
}

// Change distance based on power-up
if (playerHasEnhancedHearing)
{
    audio.MaxDistance = 800f;  // Hear further
}
else
{
    audio.MaxDistance = 500f;  // Normal hearing
}

// Change panning for underwater effect
if (playerUnderwater)
{
    audio.SpatialBlend = 0.3f;  // Sounds more muffled/centered
}
else
{
    audio.SpatialBlend = 1.0f;  // Normal stereo
}
```

### Observe Spatial Values

Read calculated spatial properties:

```csharp
// Get current spatial volume (after attenuation)
var spatialVolume = audioSource.SpatialVolume;
Logger.LogInfo($"Current volume: {spatialVolume:F2}");

// Get current pan value
var pan = audioSource.SpatialPan;
Logger.LogInfo($"Pan: {pan:F2} ({(pan < 0 ? "left" : "right")})");

// Calculate distance to listener
var sourcePos = entity.GetComponent<TransformComponent>().Position;
var listenerPos = listenerEntity.GetComponent<TransformComponent>().Position;
var distance = Vector2.Distance(sourcePos, listenerPos);
Logger.LogInfo($"Distance: {distance:F0}");
```

## Multiple Listeners

Only one listener is active at a time (first enabled listener found):

```csharp
// Player listener
var playerListener = player.AddComponent<AudioListenerComponent>();
playerListener.IsEnabled = true;  // Active

// Camera listener (for spectator mode)
var cameraListener = camera.AddComponent<AudioListenerComponent>();
cameraListener.IsEnabled = false;  // Inactive

// Switch to camera listener
playerListener.IsEnabled = false;
cameraListener.IsEnabled = true;
```

## Advanced Techniques

### Audio Zones

Create zones that affect audio properties:

```csharp
public class AudioZoneComponent : Component
{
    public float VolumeMultiplier { get; set; } = 1.0f;
    public float MaxDistanceMultiplier { get; set; } = 1.0f;
}

// System to apply zone effects
public class AudioZoneSystem : IUpdateSystem
{
    public void Update(GameTime gameTime)
    {
        var zones = _world.GetEntitiesWithComponent<AudioZoneComponent>();
        var sources = _world.GetEntitiesWithComponent<AudioSourceComponent>();
        
        foreach (var source in sources)
        {
            var audioSource = source.GetComponent<AudioSourceComponent>();
            var sourcePos = source.GetComponent<TransformComponent>().Position;
            
            // Check if source is in any zone
            foreach (var zone in zones)
            {
                var zoneData = zone.GetComponent<AudioZoneComponent>();
                var zoneTransform = zone.GetComponent<TransformComponent>();
                
                if (IsInZone(sourcePos, zoneTransform, zoneData))
                {
                    // Apply zone effects
                    audioSource.Volume *= zoneData.VolumeMultiplier;
                    audioSource.MaxDistance *= zoneData.MaxDistanceMultiplier;
                }
            }
        }
    }
}
```

### Occlusion

Simple audio occlusion using raycasts:

```csharp
public class AudioOcclusionSystem : IUpdateSystem
{
    public void Update(GameTime gameTime)
    {
        var listener = FindListener();
        var sources = _world.GetEntitiesWithComponent<AudioSourceComponent>();
        
        foreach (var source in sources)
        {
            var audioSource = source.GetComponent<AudioSourceComponent>();
            if (!audioSource.EnableSpatialAudio) continue;
            
            var sourcePos = source.GetComponent<TransformComponent>().Position;
            var listenerPos = listener.GetComponent<TransformComponent>().Position;
            
            // Raycast to check line of sight
            if (IsOccluded(sourcePos, listenerPos))
            {
                // Reduce volume when occluded
                audioSource.Volume *= 0.5f;
            }
        }
    }
}
```

### Distance-Based Playback

Only play sounds when listener is in range:

```csharp
public void UpdateAudioSources(GameTime gameTime)
{
    var listenerPos = _listener.GetComponent<TransformComponent>().Position;
    
    foreach (var entity in _audioSources)
    {
        var audio = entity.GetComponent<AudioSourceComponent>();
        var transform = entity.GetComponent<TransformComponent>();
        
        var distance = Vector2.Distance(transform.Position, listenerPos);
        
        // Enable/disable based on max distance
        if (distance > audio.MaxDistance * 1.2f)  // 20% buffer
        {
            // Too far, stop playing to save CPU
            audio.IsEnabled = false;
        }
        else if (distance < audio.MaxDistance)
        {
            // In range, ensure playing
            audio.IsEnabled = true;
        }
    }
}
```

### Priority System

Limit concurrent sounds with priority:

```csharp
public class AudioPriorityComponent : Component
{
    public int Priority { get; set; } = 0;  // Higher = more important
}

public class AudioPrioritySystem : IUpdateSystem
{
    private const int MaxConcurrentSounds = 32;
    
    public void Update(GameTime gameTime)
    {
        var sources = _world.GetEntitiesWithComponent<AudioSourceComponent>()
            .Where(e => e.GetComponent<AudioSourceComponent>().IsPlaying)
            .OrderByDescending(e => e.GetComponent<AudioPriorityComponent>()?.Priority ?? 0)
            .ToList();
        
        // Disable low-priority sounds if over limit
        for (int i = MaxConcurrentSounds; i < sources.Count; i++)
        {
            sources[i].GetComponent<AudioSourceComponent>().IsEnabled = false;
        }
    }
}
```

## Performance Optimization

### Update Frequency

Spatial audio updates every frame, but you can reduce frequency for distant sources:

```csharp
public class OptimizedAudioSystem : IUpdateSystem
{
    private float _updateTimer = 0f;
    private const float DistantUpdateInterval = 0.1f;  // 10 updates/second
    
    public void Update(GameTime gameTime)
    {
        _updateTimer += (float)gameTime.DeltaTime;
        
        var listener = FindListener();
        var listenerPos = listener.GetComponent<TransformComponent>().Position;
        
        foreach (var entity in _audioSources)
        {
            var audio = entity.GetComponent<AudioSourceComponent>();
            var sourcePos = entity.GetComponent<TransformComponent>().Position;
            var distance = Vector2.Distance(sourcePos, listenerPos);
            
            // Update near sources every frame
            if (distance < audio.MaxDistance * 0.5f)
            {
                UpdateSpatialAudio(audio, entity, listener);
            }
            // Update distant sources less frequently
            else if (_updateTimer >= DistantUpdateInterval)
            {
                UpdateSpatialAudio(audio, entity, listener);
            }
        }
        
        if (_updateTimer >= DistantUpdateInterval)
        {
            _updateTimer = 0f;
        }
    }
}
```

### Culling Distant Sources

Disable sources beyond a threshold:

```csharp
// In AudioSourceComponent configuration
audioSource.MaxDistance = 500f;  // Audible range

// Disable if beyond 1.5x max distance
var cullDistance = audioSource.MaxDistance * 1.5f;
if (distance > cullDistance)
{
    audioSource.IsEnabled = false;
}
```

### Spatial Audio Overhead

Typical performance impact:

| Source Count | Update Time | Impact on 60 FPS |
|--------------|-------------|------------------|
| 10 sources   | 0.05ms      | Negligible       |
| 50 sources   | 0.2ms       | < 2%             |
| 100 sources  | 0.4ms       | < 3%             |

**Optimization Tips:**
- Disable `EnableSpatialAudio` for non-positional sounds (music, UI)
- Use larger `MinDistance` to reduce calculations in crowded areas
- Set `SpatialBlend = 0` for ambient sounds that don't need panning
- Cull or disable distant sources beyond hearing range

## Best Practices

### Do

- **Use spatial audio for diegetic sounds** - In-world sounds (enemies, pickups, effects)
- **Disable for non-diegetic sounds** - UI, music, narration
- **Match distances to game scale** - Larger worlds need larger distances
- **Test with headphones** - Stereo panning is clearest with headphones
- **Use appropriate falloff curves** - Linear for most cases, quadratic for dramatic effects
- **Set reasonable volume levels** - Spatial audio multiplies base volume

### Don't

- **Enable spatial audio globally** - Only for positioned sounds
- **Use tiny MinDistance values** - Causes abrupt volume changes
- **Use huge MaxDistance values** - Wastes CPU on inaudible sounds
- **Forget to set SpatialBlend** - Defaults to 0 (mono)
- **Overlap too many sources** - Can cause audio mud

### Distance Guidelines

```csharp
// Small game world (platformer, puzzle)
audioSource.MinDistance = 50f;
audioSource.MaxDistance = 300f;

// Medium game world (top-down adventure)
audioSource.MinDistance = 100f;
audioSource.MaxDistance = 600f;

// Large game world (open-world, RTS)
audioSource.MinDistance = 200f;
audioSource.MaxDistance = 1200f;
```

## Troubleshooting

### No Spatial Audio

**Problem:** Sounds don't fade or pan.

**Solutions:**

```csharp
// 1. Ensure AudioSystem is registered
builder.Services.ConfigureSystemPipelines(pipelines =>
{
    pipelines.AddSystem<AudioSystem>();
});

// 2. Enable spatial audio on source
audioSource.EnableSpatialAudio = true;

// 3. Set non-zero SpatialBlend for panning
audioSource.SpatialBlend = 1.0f;

// 4. Ensure listener exists and is enabled
var listener = player.AddComponent<AudioListenerComponent>();
listener.IsEnabled = true;
```

### Sounds Cut Off Abruptly

**Problem:** Audio stops suddenly instead of fading.

**Solution:** Increase MaxDistance:

```csharp
// Before (too small)
audioSource.MaxDistance = 100f;  // Abrupt cutoff

// After (smooth fade)
audioSource.MaxDistance = 400f;  // Gradual fade
```

### Sounds Too Quiet

**Problem:** All spatial audio is barely audible.

**Solution:** Check listener global volume:

```csharp
// Ensure listener volume is reasonable
listener.GlobalSpatialVolume = 1.0f;  // Full volume

// Or boost individual sources
audioSource.Volume = 0.8f;  // Louder base volume
```

### Panning Feels Wrong

**Problem:** Sounds pan opposite to expected direction.

**Solution:** Verify coordinate system:

```csharp
// Brine2D uses:
// X+ = Right, Y+ = Down

// Sound to the right of listener should pan right
if (sourcePos.X > listenerPos.X)
{
    // Expected: pan > 0 (right)
    Logger.LogInfo($"Pan: {audioSource.SpatialPan}");
}
```

### Too Many Audio Sources

**Problem:** Performance degrades with many sources.

**Solution:** Implement culling:

```csharp
// Disable sources beyond hearing range
if (distance > audioSource.MaxDistance * 1.2f)
{
    audioSource.IsEnabled = false;
}

// Or use priority system to limit concurrent sounds
LimitConcurrentSounds(maxCount: 32);
```

## See Also

- [Sound Effects](sound-effects.md) - Basic sound playback
- [Music Playback](music.md) - Background music
- [Audio System](../ecs/systems.md#audiosystem) - ECS audio processing
- [Components](../ecs/components.md#audiosourcecomponent) - Audio component reference

---

**Next Steps:**
- Add AudioListenerComponent to your player
- Create spatial audio sources for enemies and pickups
- Experiment with different falloff curves
- Test with headphones for best stereo effect