import { Link } from 'react-router-dom';
import { useProductContext } from '../contexts/ProductContext';
import { useCartContext } from '../contexts/CartContext';
import styles from './ProductList.module.css';
import { toKebabCase } from "../utility/helperFunctions";
import CartSVG from './CartSVG';

// eslint-disable-next-line react/prop-types
function ProductCard({ productId }) {
    const { products } = useProductContext();
    const { addToCart } = useCartContext();
    
    const product = products.find(p => p.id === productId);
    
    if (!product) return null;
    
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (product.inStock) {
            const defaultSelectedAttributes = {};
            if (product.attributes && product.attributes.length > 0) {
                product.attributes.forEach(attr => {
                    if (attr.items && attr.items.length > 0) {
                        defaultSelectedAttributes[attr.name] = attr.items[0].value;
                    }
                });
            }
             addToCart(product, defaultSelectedAttributes);

        }
    };
    
    return (
        <div
            className={`${styles.product} ${!product.inStock ? styles.outOfStock : ''}`}
            data-testid={`product-${toKebabCase(product.name)}`}
        >
            <Link to={`/product/${product.id}`} className={styles.productLink}>
                <div className={styles.imageContainer}>
                    <img className={styles.img} src={product.gallery[0]} alt={product.name} />
                    {!product.inStock && <div className={styles.outOfStockMessage}>Out of Stock</div>}
                    
                    {product.inStock && (
                        <div 
                            className={styles.cartIconOverlay}
                            onClick={handleAddToCart}
                        >
                            <CartSVG />
                        </div>
                    )}
                </div>
            </Link>
            <p className={styles.productName}>{product.name}</p>
            <span className={styles.price}>
                {product.prices[0].amount.toFixed(2)} {product.prices[0].currency.symbol}
            </span>
        </div>
    );
}

export default ProductCard;