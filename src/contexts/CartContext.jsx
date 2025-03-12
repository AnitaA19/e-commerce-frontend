import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

const ACTIONS = {
  SET_CART: 'SET_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  UPDATE_ATTRIBUTES: 'UPDATE_ATTRIBUTES',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_MODAL: 'TOGGLE_MODAL'
};

const initialState = {
  cart: [],
  isModalOpen: false
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_CART:
      return {
        ...state,
        cart: action.payload
      };
      case ACTIONS.ADD_TO_CART: {
        const { product, selectedAttributes } = action.payload;
        const existingItemIndex = state.cart.findIndex(item => 
          item.id === product.id &&
          JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes)
        );
        
        if (existingItemIndex !== -1) {
          // Create a new array and explicitly set the quantity to the previous value + 1
          const updatedCart = state.cart.map((item, index) => {
            if (index === existingItemIndex) {
              // Force an increment of exactly 1
              return {
                ...item,
                quantity: item.quantity + 1
              };
            }
            return item;
          });
          
          return { ...state, cart: updatedCart };
        } else {
          // This part seems fine
          return { 
            ...state, 
            cart: [...state.cart, {
              ...product,
              selectedAttributes,
              quantity: 1
            }]
          };
        }
      }
    case ACTIONS.REMOVE_FROM_CART: {
      const newCart = [...state.cart];
      newCart.splice(action.payload, 1);
      return { ...state, cart: newCart };
    }
    case ACTIONS.UPDATE_QUANTITY: {
      const { index, newQuantity } = action.payload;
      
      if (newQuantity < 1) {
        const newCart = [...state.cart];
        newCart.splice(index, 1);
        return { ...state, cart: newCart };
      }
      
      const updatedCart = [...state.cart];
      updatedCart[index].quantity = newQuantity;
      return { ...state, cart: updatedCart };
    }
    case ACTIONS.UPDATE_ATTRIBUTES: {
      const { index, attributeName, attributeValue } = action.payload;
      
      if (index < 0 || index >= state.cart.length) return state;
      
      const updatedCart = [...state.cart];
      const item = updatedCart[index];
      
      const attribute = item.attributes.find(attr => attr.name === attributeName);
      if (!attribute) return state;
      
      const validValue = attribute.items.some(attrItem => attrItem.value === attributeValue);
      if (!validValue) return state;
      
      updatedCart[index] = {
        ...item,
        selectedAttributes: {
          ...item.selectedAttributes,
          [attributeName]: attributeValue
        }
      };
      
      return { ...state, cart: updatedCart };
    }
    case ACTIONS.CLEAR_CART:
      return { ...state, cart: [] };
    case ACTIONS.TOGGLE_MODAL:
      return { ...state, isModalOpen: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    const savedCart = localStorage.getItem('cart');
    return {
      cart: savedCart ? JSON.parse(savedCart) : [],
      isModalOpen: false
    };
  });
  
  const { cart, isModalOpen } = state;
  
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  const addToCart = (product, selectedAttributes = {}) => {
    const allAttributesSelected = product.attributes.every(attr => 
      selectedAttributes[attr.name] !== undefined
    );
    
    if (!allAttributesSelected) {
      console.warn("Cannot add to cart: Not all attributes selected");
      return false;
    }
    
    dispatch({ 
      type: ACTIONS.ADD_TO_CART, 
      payload: { product, selectedAttributes } 
    });
    
    return true;
  };
  
  const removeFromCart = (index) => {
    dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: index });
  };
  
  const updateQuantity = (index, newQuantity) => {
    dispatch({ 
      type: ACTIONS.UPDATE_QUANTITY, 
      payload: { index, newQuantity } 
    });
  };
  
  const updateItemAttributes = (index, attributeName, attributeValue) => {
    dispatch({
      type: ACTIONS.UPDATE_ATTRIBUTES,
      payload: { index, attributeName, attributeValue }
    });
  };
  
  const setIsModalOpen = (isOpen) => {
    dispatch({ type: ACTIONS.TOGGLE_MODAL, payload: isOpen });
  };
  
  const clearCart = () => {
    dispatch({ type: ACTIONS.CLEAR_CART });
  };
  
  const allItemsHaveRequiredAttributes = () => {
    return cart.every(item => 
      item.attributes.every(attr => 
        item.selectedAttributes[attr.name] !== undefined
      )
    );
  };
  
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  
  const getTotalPrice = () => {
    return cart.reduce((total, item) => 
      total + (item.prices[0].amount * item.quantity), 0
    ).toFixed(2);
  };
  
  return (
    <CartContext.Provider
      value={{
        cart,
        isModalOpen,
        setIsModalOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemAttributes,
        allItemsHaveRequiredAttributes,
        getTotalItems,
        getTotalPrice,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext was used outside the CartProvider");
  }
  return context;
};