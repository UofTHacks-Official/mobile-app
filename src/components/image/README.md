# Animal Images Component

This module provides an easy way to use animal images throughout the app with TypeScript support.

## Usage Examples

### 1. Using the Animal Component (Recommended)

```tsx
import { Animal } from '@/src/components/image';

// Basic usage
<Animal name="lion" />

// With custom styling
<Animal 
  name="owl" 
  width={100} 
  height={100} 
  style={{ borderRadius: 10 }}
  resizeMode="cover"
/>
```

### 2. Using Image Sources Directly

```tsx
import { getAnimalImage, AnimalImages } from '@/src/components/image';
import { Image } from 'react-native';

// Get specific animal image
const lionImage = getAnimalImage('lion');

// Use with React Native Image
<Image source={lionImage} style={{ width: 50, height: 50 }} />

// Direct access to images object
<Image source={AnimalImages.bird} style={{ width: 50, height: 50 }} />
```

### 3. Random Animal Selection

```tsx
import { getRandomAnimalImage } from '@/src/components/image';

const { name, source } = getRandomAnimalImage();
console.log(`Selected animal: ${name}`);

<Image source={source} style={{ width: 50, height: 50 }} />
```

### 4. Get All Available Animals

```tsx
import { animalNames, AnimalName } from '@/src/components/image';

// List all available animals
console.log(animalNames); // ['mystery', 'bird', 'confusedOwl', 'deer', 'goat', 'lion', 'owl']

// Type-safe animal selection
const selectedAnimal: AnimalName = 'lion'; // TypeScript will autocomplete and validate
```

## Available Animals

- `mystery` - ???.svg
- `bird` - bird.svg  
- `confusedOwl` - confused_owl.png
- `deer` - deer.svg
- `goat` - goat.svg
- `lion` - lion.svg
- `owl` - owl.svg

## TypeScript Support

The module includes full TypeScript support with:
- `AnimalName` type for all available animal names
- Type-safe image selection
- Autocomplete in your IDE
- Compile-time validation

## Import Options

```tsx
// Named imports (recommended)
import { Animal, getAnimalImage, animalNames } from '@/src/components/image';

// Default import
import Animals from '@/src/components/image';
const { Animal, getAnimalImage } = Animals;

// Individual imports
import { Animal } from '@/src/components/image/animals';
```
