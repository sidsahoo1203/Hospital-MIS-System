import React from 'react';
import { menu_list } from '../assets/assets';

const Menu = ({ category, setCategory }) => {

  const handleCategoryChange = (item) => {
    setCategory(prev => prev === item.menu_name ? "All" : item.menu_name);
  };

  return (
    <section className="flex flex-col gap-5 px-4 sm:px-8 md:px-16 lg:px-32 py-10" id="explore-menu">
      <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold">Explore Our Medications</h1>
      <p className="max-w-full sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] text-gray-800 text-base sm:text-lg -mt-2">
        Choose from a diverse menu featuring a delectable array of Medicines.
      </p>
      <div className="flex flex-wrap justify-center items-center text-center gap-6 my-5 overflow-y-hidden">
        {menu_list.map((item) => (
          <div 
            onClick={() => handleCategoryChange(item)}
            key={item.menu_name} 
            className="flex flex-col items-center cursor-pointer transition-transform duration-300 ease-in-out -mb-2 "
            role="button"
            tabIndex="0"
            aria-pressed={category === item.menu_name}
            onKeyDown={(e) => e.key === 'Enter' && handleCategoryChange(item)}
          >
            <img 
              className={`w-[20vw] h-20 sm:w-[15vw] md:w-[10vw] lg:w-[7.5vw] min-w-[80px] rounded-full transition-all duration-200 ${category === item.menu_name ? 'border-4 border-orange-500 p-0.5' : 'border-2 border-transparent'}`} 
              src={item.menu_image} 
              alt={`Image of ${item.menu_name}`}
              loading="lazy"
              aria-label={`Image of ${item.menu_name}`}
            />
            <p className="m-2 text-gray-500 text-sm sm:text-base">{item.menu_name}</p>
          </div>
        ))}
      </div>
      <hr className="mt-4 h-[2px] border-0 bg-gray-200 " />
    </section>
  );
}

export default React.memo(Menu);
