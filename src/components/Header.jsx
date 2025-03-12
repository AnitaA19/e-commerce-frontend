import Logo from "./Logo";
import styles from "./Header.module.css";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import Cart from "./Cart";

function Header() {
    return (
        <header className={styles.header}>
               <Navigation/>
                <Link to = "/"><Logo /></Link>
             <Cart/>
        </header>
    );
}

export default Header;