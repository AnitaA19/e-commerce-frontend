import { useCartContext } from '../contexts/CartContext';
import styles from './Cart.module.css';
import CartSVG from './CartSVG';

function Cart() {
    const { setIsModalOpen, getTotalItems } = useCartContext();
    const itemCount = getTotalItems();
    
    return (
        <div className={styles.cartContainer} onClick={() => setIsModalOpen(true)}>
          <CartSVG/>
            
            {itemCount > 0 && (
                <div className={styles.cartBadge}>
                    <span>{itemCount}</span>
                </div>
            )}
        </div>
    );
}

export default Cart;