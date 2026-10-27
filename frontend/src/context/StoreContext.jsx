import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { food_list as catalog } from "../assets/assets";

export const StoreContext = createContext(null)

// Indian rupees, no decimals (e.g. ₹1,250)
export const formatINR = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`

// The cart is kept in the browser so a page refresh doesn't empty it
const CART_KEY = "meditrack-cart"
const loadCart = () => {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || {}
    } catch {
        return {}
    }
}

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState(loadCart)
    // Live prices (INR) and stock from the hospital inventory, keyed by product id
    const [inventory, setInventory] = useState({})
    const [deliveryFee, setDeliveryFee] = useState(0)

    const refreshInventory = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/v1/medicines")
            setInventory(Object.fromEntries(data.medicines.map((m) => [m.code, m])))
            setDeliveryFee(data.deliveryFee)
        } catch {
            // Keep the last known inventory; the store shows items as unavailable
        }
    }, [])

    useEffect(() => {
        refreshInventory()
    }, [refreshInventory])

    useEffect(() => {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cartItems))
        } catch {
            // Storage unavailable (private mode): the cart still works for this visit
        }
    }, [cartItems])

    // Product images/descriptions come from the website; price and stock from the server
    const food_list = useMemo(
        () => catalog
            .filter((item) => inventory[item._id])
            .map((item) => ({
                ...item,
                price: inventory[item._id].price,
                stock: inventory[item._id].stock,
            })),
        [inventory]
    )

    const stockOf = (itemId) => inventory[itemId]?.stock ?? 0

    const addToCart = (itemId) => {
        setCartItems((prev) => {
            const quantity = prev[itemId] || 0
            if (quantity >= stockOf(itemId)) return prev
            return { ...prev, [itemId]: quantity + 1 }
        })
    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => {
            const quantity = (prev[itemId] || 0) - 1
            const next = { ...prev }
            if (quantity > 0) next[itemId] = quantity
            else delete next[itemId]
            return next
        })
    }

    const removeItem = (itemId) => {
        setCartItems((prev) => {
            const next = { ...prev }
            delete next[itemId]
            return next
        })
    }

    const getTotalCartAmount = () =>
        Object.entries(cartItems).reduce(
            (sum, [itemId, quantity]) => sum + (inventory[itemId]?.price || 0) * Math.max(quantity, 0),
            0
        )

    const getCartItemCount = () =>
        Object.values(cartItems).reduce((sum, quantity) => sum + Math.max(quantity, 0), 0)

    const clearCart = () => setCartItems({})

    const contextValue ={
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        removeItem,
        stockOf,
        getTotalCartAmount,
        getCartItemCount,
        clearCart,
        deliveryFee,
        refreshInventory
    }
    return(
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider
