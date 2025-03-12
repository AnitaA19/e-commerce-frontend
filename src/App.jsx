import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import MainPage from './pages/MainPage';
import ProductPage from './pages/ProductDetailsPage';
import client from "./services/apolloClient";
import { ApolloProvider } from "@apollo/client";
import { ProductProvider } from './contexts/ProductContext'; 
import { CartProvider } from "./contexts/CartContext";
import Layout from "./components/Layout";

function App() {
  return (
    <div>
      <ApolloProvider client={client}>
        <ProductProvider> 
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/all" />} />
                <Route element={<Layout />}>
                  <Route path="/:category" element={<MainPage />} />
                  <Route path="/product/:productId" element={<ProductPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </ProductProvider>
      </ApolloProvider>
    </div>
  );
}

export default App;