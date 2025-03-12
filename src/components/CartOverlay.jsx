import { useCartContext } from '../contexts/CartContext';
import styles from './CartModal.module.css';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useState } from 'react';
import {toKebabCase} from "../utility/helperFunctions"

const PLACE_ORDER_MUTATION = gql`
  mutation PlaceOrder($items: [OrderInput!]!) {
    placeOrder(items: $items) {
      id
      items {
        product_id
        quantity
        price
        attributes {
          attribute_set_id
          attribute_item_id
        }
      }
    }
  }
`;

function CartOverlay() {
    const { 
        isModalOpen, 
        setIsModalOpen, 
        cart, 
        removeFromCart, 
        updateQuantity, 
        getTotalPrice,
        clearCart,
    } = useCartContext();
    
    const [orderStatus, setOrderStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [placeOrder] = useMutation(PLACE_ORDER_MUTATION, {
        onCompleted: () => {
            setIsLoading(false);
            setOrderStatus({ 
                success: true, 
            });
            clearCart(); 
        },
        onError: (error) => {
            setIsLoading(false);
            setOrderStatus({ 
                success: false, 
                message: `Error placing order: ${error.message}` 
            });
        }
    });
    
    if (!isModalOpen) return null;
    
    // Get the currency symbol from the first item or default to $ if cart is empty
    const currencySymbol = cart.length > 0 && cart[0]?.prices[0]?.currency?.symbol 
        ? cart[0].prices[0].currency.symbol 
        : '$';
    
    // Format total price or return 0 if cart is empty
    const formattedTotal = cart.length > 0 ? getTotalPrice() : '0';
    
    const handlePlaceOrder = () => {
        if (cart.length === 0) return;
        
        const allAttributesSelected = cart.every(item => 
            item.attributes.every(attr => 
                item.selectedAttributes[attr.name] !== undefined
            )
        );
        
        if (!allAttributesSelected) {
            setOrderStatus({ 
                success: false, 
                message: "Please select all required attributes for all items" 
            });
            return;
        }
        
        setIsLoading(true);
        setOrderStatus(null);
        
        const orderItems = cart.map(item => {
            const attributes = Object.entries(item.selectedAttributes).map(([attrName, attrValue]) => {
                const attribute = item.attributes.find(attr => attr.name === attrName);
                if (!attribute) return null;
                const attributeItem = attribute.items.find(item => item.value === attrValue);
                if (!attributeItem) return null;
                
                return {
                    attribute_set_id: attribute.id,
                    attribute_item_id: attributeItem.id
                };
            }).filter(Boolean);
            
            return {
                productId: item.id,
                quantity: item.quantity,
                attributes: attributes
            };
        });
        
        if (orderItems.length > 0) {
            placeOrder({ 
                variables: { 
                    items: orderItems  
                } 
            });
        } else {
            setIsLoading(false);
            setOrderStatus({
                success: false,
                message: "Could not process order items"
            });
        }
    };
    
    return (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>My Bag, <span className={styles.itemCounter}>{cart.length} items</span></h2>
                    <button 
                        className={styles.closeButton} 
                        onClick={() => setIsModalOpen(false)}
                    >
                        ×
                    </button>
                </div>
                
                {cart.length === 0 ? (
                    <p className={styles.emptyCart}>Your cart is empty</p>
                ) : (
                    <div className={styles.cartItems}>
                        {cart.map((item, index) => {
                            const hasAllAttributes = item.attributes.every(
                                attr => item.selectedAttributes[attr.name] !== undefined
                            );
                            
                            return (
                                <div key={index} className={styles.cartItem}>
                                    <div className={styles.itemRow}>
                                        <div className={styles.itemDetails}>
                                            <p className={styles.itemName}>{item.name}</p>
                                            <p className={styles.itemPrice}>
                                            {item.prices?.[0] ? `${item.prices[0].currency.symbol}${item.prices[0].amount}` : 'Price unavailable'}
                                            </p>
                                            
                                            {!hasAllAttributes && (
                                                <p className={styles.attributeWarning}>
                                                    Please select all attributes
                                                </p>
                                            )}
                                            
                                            {item.attributes && item.attributes.length > 0 && (
                                                <div className={styles.itemAttributes}>
                                                    {item.attributes.map(attribute => {
                                                        const attributeKebab = toKebabCase(attribute.name);
                                                        
                                                        return (
                                                            <div 
                                                                key={attribute.id} 
                                                                className={styles.attributeGroup}
                                                                data-testid={`cart-item-attribute-${attributeKebab}`}
                                                            >
                                                                <span className={styles.attributeLabel}>{attribute.name}:</span>
                                                                
                                                                <div className={styles.attributeOptions}>
                                                                    {attribute.items.map(attrItem => {
                                                                        const isSelected = item.selectedAttributes[attribute.name] === attrItem.value;
                                                                        const isColor = attribute.name.toLowerCase().includes('color');
                                                                        const itemKebab = toKebabCase(attrItem.value);
                                                                        const testId = isSelected
                                                                            ? `cart-item-attribute-${attributeKebab}-${itemKebab}-selected`
                                                                            : `cart-item-attribute-${attributeKebab}-${itemKebab}`;
                                                                        
                                                                        return isColor ? (
                                                                            <div 
                                                                                key={attrItem.id}
                                                                                className={`${styles.colorBox} ${isSelected ? styles.selected : styles.disabled}`}
                                                                                style={{ backgroundColor: attrItem.value }}
                                                                                data-testid={testId}
                                                                                // No onClick handler - attributes are not clickable
                                                                            />
                                                                        ) : (
                                                                            <div 
                                                                                key={attrItem.id}
                                                                                className={`${styles.sizeBox} ${isSelected ? styles.selected : styles.disabled}`}
                                                                                data-testid={testId}
                                                                                // No onClick handler - attributes are not clickable
                                                                            >
                                                                                {attrItem.value}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className={styles.itemControls}>
                                            <div className={styles.quantityControls}>
                                                <button 
                                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                                    className={`${styles.quantityButton} ${styles.plus}`}
                                                    data-testid="cart-item-amount-increase"
                                                >
                                                    +
                                                </button>
                                                <span 
                                                    className={styles.quantity}
                                                    data-testid="cart-item-amount"
                                                >
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                                    className={`${styles.quantityButton} ${styles.minus}`}
                                                    data-testid="cart-item-amount-decrease"
                                                >
                                                    -
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.itemImage}>
                                            <img src={item.gallery[0]} alt={item.name} />
                                        </div>
                                    </div>
                                    
                                    <button 
                                        className={styles.removeButton}
                                        onClick={() => removeFromCart(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                <div className={styles.cartSummary}>
                    {orderStatus && (
                        <div className={`${styles.orderStatus} ${orderStatus.success ? styles.success : styles.error}`}>
                            {orderStatus.message}
                        </div>
                    )}
                    
                    <div className={styles.totalRow}>
                        <span>Total:</span>
                        <span 
                            className={styles.totalPrice}
                            data-testid="cart-total"
                        >
                            {`${currencySymbol}${formattedTotal}`}
                        </span>
                    </div>
                    
                    <div>
                        <button 
                            className={`${styles.actionButton} ${isLoading ? styles.loading : ''} ${cart.length === 0 ? styles.disabled : ''}`}
                            onClick={handlePlaceOrder}
                            disabled={isLoading || cart.length === 0}
                            data-testid="place-order-button"
                        >
                            {isLoading ? 'PROCESSING...' : 'PLACE ORDER'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartOverlay;