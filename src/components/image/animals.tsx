import React from "react";
import { SvgProps } from "react-native-svg";
import BirdIcon from "../../../assets/images/animals/bird.svg";
import DeerIcon from "../../../assets/images/animals/deer.svg";
import GoatIcon from "../../../assets/images/animals/goat.svg";
import LionIcon from "../../../assets/images/animals/lion.svg";
import OwlIcon from "../../../assets/images/animals/owl.svg";
import PinkIcon from "../../../assets/images/animals/pink.svg";

const AnimalComponents = {
  pink: PinkIcon,
  bird: BirdIcon,
  deer: DeerIcon,
  goat: GoatIcon,
  lion: LionIcon,
  owl: OwlIcon,
} as const;

// Type for animal names
export type AnimalName = keyof typeof AnimalComponents;

export const animalNames: AnimalName[] = Object.keys(
  AnimalComponents
) as AnimalName[];

// Get animal SVG component by name
export const getAnimalComponent = (name: AnimalName) => {
  return AnimalComponents[name];
};

// Get random animal component
export const getRandomAnimalComponent = (): {
  name: AnimalName;
  component: React.FC<SvgProps>;
} => {
  const randomName =
    animalNames[Math.floor(Math.random() * animalNames.length)];
  return {
    name: randomName,
    component: getAnimalComponent(randomName),
  };
};

interface AnimalProps extends SvgProps {
  name: AnimalName;
  width?: number;
  height?: number;
}

// Reusable Animal SVG component
export const Animal: React.FC<AnimalProps> = ({
  name,
  width = 50,
  height = 50,
  ...svgProps
}) => {
  const AnimalSvg = getAnimalComponent(name);

  return <AnimalSvg width={width} height={height} {...svgProps} />;
};

export { AnimalComponents };
export default {
  AnimalComponents,
  animalNames,
  getAnimalComponent,
  getRandomAnimalComponent,
  Animal,
};
