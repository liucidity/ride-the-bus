import React from 'react';

type Props = {
  value: string;
  image: string;
};

export default function Card({ value, image }: Props) {
  return (
    <img
      alt={value}
      src={image}
      className="game-card"
    />
  );
}
