import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material';

const ProductCard = ({ product, onSelect, onBuy, onAddToCart, onDelete, currentUser }) => (
  <Card sx={{ width: 280, cursor: 'pointer' }} onClick={() => onSelect(product)}>
    <CardMedia
      component="img"
      height="180"
      image={`${API_URL}/api/uploads/${product.image_path}`}
      alt={product.name}
    />
    <CardContent>
      <Typography variant="h6">{product.name}</Typography>
      <Typography variant="body2" noWrap>{product.description}</Typography>
      <Typography variant="subtitle1">KES {product.price.toFixed(2)}</Typography>
    </CardContent>
    <CardActions>
      <Button size="small" onClick={(e) => { e.stopPropagation(); onBuy(product); }}>Buy Now</Button>
      <Button size="small" onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>Add to Cart</Button>
      {currentUser && (currentUser.is_admin || product.user_id === currentUser.id) && (
        <Button size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}>
          Delete
        </Button>
      )}
    </CardActions>
  </Card>
);
export default ProductCard;
