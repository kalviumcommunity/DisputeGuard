import AddToCartButton from './AddToCartButton';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '1rem',
        borderRadius: '8px',
      }}
    >
      <h2>{product.name}</h2>

      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        ${product.price}
      </p>

      <AddToCartButton
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
}