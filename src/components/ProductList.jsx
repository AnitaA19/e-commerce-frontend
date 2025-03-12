import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductContext } from '../contexts/ProductContext';
import ProductCard from './ProductCard'; 
import styles from './ProductList.module.css';

function ProductList() {
    const { products, loading, error } = useProductContext();
    const { category } = useParams();
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (category) {
            if (category === "all") {
                setFilteredProducts(products);
            } else {
                const filtered = products.filter(product => product.category.name.toLowerCase() === category.toLowerCase());
                setFilteredProducts(filtered);
            }
        } else {
            setFilteredProducts(products);
        }
    }, [category, products]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error fetching products.</p>;

    const categoryName = category ? category : 'All Products';

    return (
        <section className={styles.section}>
            <h1 className={styles.categoryName}>{categoryName}</h1>
            <div className={styles.container}>
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} productId={product.id} /> 
                ))}
            </div>
        </section>
    );
}

export default ProductList;
