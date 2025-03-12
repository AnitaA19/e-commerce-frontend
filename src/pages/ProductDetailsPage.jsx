import { useEffect, useState } from 'react'; 
import { useParams } from 'react-router-dom'; 
import { useProductContext } from '../contexts/ProductContext'; 
import { useCartContext } from '../contexts/CartContext';
import styles from './ProductPage.module.css'; 
import { DESCRIPTIONCHARLIMIT } from "../constants";
import {toKebabCase} from "../utility/helperFunctions"

function ProductDetailsPage() { 
  const { products } = useProductContext(); 
  const { addToCart } = useCartContext();
  const { productId } = useParams();  
  const [product, setProduct] = useState(null); 
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [attributeError, setAttributeError] = useState(false);

  useEffect(() => { 
    if (products.length > 0) { 
      const foundProduct = products.find(p => p.id === productId); 
      setProduct(foundProduct);
      setSelectedAttributes({});
      setAttributeError(false);
    } 
  }, [products, productId]); 

  if (!product) return <p>Loading...</p>; 

  const nextImage = () => { 
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.gallery.length); 
  }; 

  const prevImage = () => { 
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.gallery.length) % product.gallery.length); 
  }; 

  const handleAttributeSelect = (attributeName, value) => {
    setSelectedAttributes({
      ...selectedAttributes,
      [attributeName]: value
    });
    setAttributeError(false);
  };

  const handleAddToCart = () => {
    const allAttributesSelected = product.attributes.every(attr => 
      selectedAttributes[attr.name] !== undefined
    );
    
    if (!product.inStock) return;

    if (!allAttributesSelected) {
      setAttributeError(true);
      return;
    }

    const added = addToCart(product, selectedAttributes);
    
    if (added) {
      setSelectedAttributes({});
      setAttributeError(false);
    }
  };

  const cleanDescription = product.description.replace(/<[^>]+>/g, '');
  const isLongDescription = cleanDescription.length > DESCRIPTIONCHARLIMIT;
  const shortDescription = isLongDescription 
    ? cleanDescription.substring(0, DESCRIPTIONCHARLIMIT) + '...' 
    : cleanDescription;
  const displayDescription = showFullDescription || !isLongDescription 
    ? cleanDescription 
    : shortDescription;

  const isOutOfStock = product.inStock === false;
  const productNameKebab = toKebabCase(product.name);

  return ( 
    <div data-testid={`product-${productNameKebab}`}> 
      <section className={styles.productSection}> 
        {isOutOfStock && <div className={styles.outOfStockMessage}>Out of Stock</div>}

        <ul className={styles.productImages} data-testid="product-gallery"> 
          {product.gallery.map((image, index) => ( 
            <li key={index} className={styles.imagesContainer} onClick={() => setCurrentImageIndex(index)}> 
              <img className={`${styles.images} ${isOutOfStock ? styles.outOfStock : ''}`} src={image} alt={product.name} /> 
            </li> 
          ))} 
        </ul> 

        <div className={styles.productSlider}> 
          <button className={styles.navButton} onClick={prevImage}>‹</button> 
          <img className={`${styles.productImage} ${isOutOfStock ? styles.outOfStock : ''}`} src={product.gallery[currentImageIndex]} alt={product.name} /> 
          <button className={styles.navButton} onClick={nextImage}>›</button> 
        </div> 

        <div className={styles.productInfo}> 
          <h2 className={styles.productName}>{product.name}</h2> 

          {attributeError && (
            <div className={styles.attributeError}>
              Please select all attributes before adding to cart:
            </div>
          )}

          {product.attributes && product.attributes.length > 0 && ( 
            <div className={styles.productAttributes}> 
              {product.attributes.map(attribute => {
                const attributeKebab = toKebabCase(attribute.name);
                
                return (
                  <div 
                    key={attribute.id} 
                    className={styles.attribute}
                    data-testid={`product-attribute-${attributeKebab}`}
                  > 
                    <p className={styles.productDetail}>{attribute.name}:</p> 
                    <ul> 
                      {attribute.items.map(item => ( 
                        <li  
                          key={item.id}  
                          className={`${styles.attributeItem} 
                                    ${attribute.name.toLowerCase().includes('color') ? styles.colorItem : ''} 
                                    ${selectedAttributes[attribute.name] === item.value ? styles.selectedAttribute : ''}`}
                          style={attribute.name.toLowerCase().includes('color') ? { backgroundColor: item.value } : {}} 
                          onClick={() => handleAttributeSelect(attribute.name, item.value)}
                        > 
                          {attribute.name.toLowerCase().includes('color') ? "" : item.value} 
                        </li> 
                      ))} 
                    </ul> 
                  </div>
                );
              })} 
            </div> 
          )} 

          <span>
            <p className={styles.productDetail}>Price:</p> 
            <p className={styles.price}> 
              {product.prices[0].amount} {product.prices[0].currency.symbol} 
            </p> 
          </span>

          <button 
            className={`${styles.addToCartBtn} ${isOutOfStock ? styles.outOfStock : ''}`} 
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            data-testid="add-to-cart"
          >
            ADD TO CART
          </button> 

          <div className={styles.descriptionContainer}>
            <p className={styles.productDescription} data-testid="product-description">
              {displayDescription}
            </p>
            {isLongDescription && (
              <button 
                className={styles.readMoreBtn} 
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        </div> 
      </section> 
    </div> 
  ); 
} 

export default ProductDetailsPage;