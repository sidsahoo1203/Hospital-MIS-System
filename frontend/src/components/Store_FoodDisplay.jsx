import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext'
import FoodItem from './Store_FoodItem';

const FoodDisplay = ({ category }) => {
    const { food_list = [] } = useContext(StoreContext);

    // Filter food items based on the selected category
    const filteredFoodItems = category === "All"
        ? food_list
        : food_list.filter(item => item.category === category);

    return (
        <div className='p-4 sm:p-4 sm:-mt-28 lg:p-32 lg:-mt-48 '>
            <h2 className='text-2xl sm:text-3xl font-bold mb-4 mt-8 sm:mt-16  text-gray-800'>
                Top Medicines For you
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-8'>
                {filteredFoodItems.map(item => (
                    <FoodItem
                        key={item._id} 
                        id={item._id}
                        name={item.name}
                        description={item.description}
                        price={item.price}
                        image={item.image}
                        stock={item.stock}
                    />
                ))}
            </div>
        </div>
    );
};

export default FoodDisplay;
