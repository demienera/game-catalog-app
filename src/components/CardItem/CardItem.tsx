import React from "react";
import { Link } from "react-router-dom";
import { Card, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  favoritesSelector,
  toggleFavorite,
} from "../../app/slices/favorites/slice";
import { DeleteButton } from "../DeleteButton";
import { LikeButton } from "../LikeButton";
import { CardFooter } from "../CardFooter";
import { useCardItemStyles } from "./styles";
import { Game } from "../../utils/types";
import { usePublicPath } from "../../hooks/usePublicPath";

const { Meta } = Card;
const { Text } = Typography;

type CardItemProps = {
  item: Game;
  onDelete: (id: number) => void;
};

export const CardItem = ({ item, onDelete }: CardItemProps) => {
  const dispatch = useAppDispatch();
  const styles = useCardItemStyles();
  const favorites = useAppSelector(favoritesSelector);
  const liked = favorites.includes(item.id);
  const placeholderImage = usePublicPath("placeholder.webp");

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(toggleFavorite(item.id));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(item.id);
  };

  return (
    <Link to={`/game/${item.id}`} style={{ textDecoration: "none" }}>
      <Card
        hoverable
        style={styles.card}
        cover={
          <img
            alt={item.name}
            src={item.background_image || placeholderImage}
            style={styles.cardImg}
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/placeholder.webp";
            }}
          />
        }
      >
        <DeleteButton onClick={handleDelete} style={styles.deleteIcon} />
        <LikeButton
          liked={liked}
          onClick={handleLikeToggle}
          style={styles.likeIcon(liked)}
        />

        <Meta
          title={
            <Text title={item.name} style={styles.cardTitle} ellipsis>
              {item.name}
            </Text>
          }
        />
        <CardFooter game={item} />
      </Card>
    </Link>
  );
};
