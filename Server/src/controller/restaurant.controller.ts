import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Restaurant, MenuItem,  } from '../models/restaurant.model';

// ==========================================
// Restaurant Information Controllers
// ==========================================

/**
 * Get restaurant details by ID
 */
export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    return res.status(200).json({ success: true, data: restaurant });
  } catch (error : any) {
    console.error('Error fetching restaurant:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Create a new restaurant
 */
export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantData = req.body;

    const restaurant = new Restaurant(restaurantData);
    await restaurant.validate();
    await restaurant.save();

    return res.status(201).json({ success: true, data: restaurant });
  } catch (error : any) {
    console.error('Error creating restaurant:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Update restaurant details
 */
export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    return res.status(200).json({ success: true, data: restaurant });
  } catch (error : any) {
    console.error('Error updating restaurant:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Check if restaurant is currently open
//  */
// export const checkRestaurantOpen = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
//     }

//     const restaurant = await Restaurant.findById(id);

//     if (!restaurant) {
//       return res.status(404).json({ success: false, message: 'Restaurant not found' });
//     }

//     const isOpen = restaurant.isOpen();

//     return res.status(200).json({
//       success: true,
//       data: {
//         isOpen,
//         currentDay: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
//         hours: restaurant.operatingHours
//       }
//     });
//   } catch (error) {
//     console.error('Error checking restaurant status:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// ==========================================
// Menu Management Controllers
// ==========================================

/**
 * Get restaurant's complete menu
 */
export const getRestaurantMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(id, 'name menu');

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        restaurantName: restaurant.name,
        menu: restaurant.menu
      }
    });
  } catch (error : any) {
    console.error('Error fetching menu:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Add a new menu category
 */
export const addMenuCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const categoryData = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' })
    }

    const restaurant = await Restaurant.findById(id)

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' })
    }

    const existingCategoryIndex = restaurant.menu.findIndex(c => c.id === categoryData.id)

    if (existingCategoryIndex !== -1) {
      // Category exists, append new items
      const existingCategory = restaurant.menu[existingCategoryIndex]
      const newItems = categoryData.items || []

      // Filter out items with duplicate IDs
      const existingItemIds = new Set(existingCategory.items.map(item => item.id))
      const uniqueNewItems = newItems.filter((item : any) => !existingItemIds.has(item.id))

      if (uniqueNewItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'All item IDs already exist in this category'
        })
      }

      // Append unique new items to the existing category
      restaurant.menu[existingCategoryIndex].items.push(...uniqueNewItems)

      await restaurant.save()
      return res.status(200).json({
        success: true,
        message: 'New items added to existing category',
        updatedCategory: restaurant.menu[existingCategoryIndex]
      })
    } else {
      // Category does not exist — create new category
      restaurant.menu.push(categoryData)
      await restaurant.save()

      return res.status(201).json({
        success: true,
        message: 'New menu category added successfully',
        newCategory: categoryData
      })
    }
  } catch (error: any) {
    console.error('Error adding or updating menu category:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
}


/**
 * Update an existing menu category
//  */
// export const updateMenuCategory = async (req: Request, res: Response) => {
//   try {
//     const { restaurantId, categoryId } = req.params;
//     const updateData = req.body;

//     if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
//       return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
//     }

//     const restaurant = await Restaurant.findById(restaurantId);

//     if (!restaurant) {
//       return res.status(404).json({ success: false, message: 'Restaurant not found' });
//     }

//     const categoryIndex = restaurant.menu.findIndex(c => c.id === categoryId);
//     if (categoryIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: `Category with ID ${categoryId} not found`
//       });
//     }

//     // Preserve items if not provided in update
//     if (!updateData.items) {
//       updateData.items = restaurant.menu[categoryIndex].items;
//     }
     
//     restaurant.menu[categoryIndex] = {
//       ...restaurant.menu[categoryIndex].toObject(),
//       ...updateData
//     };

//     await restaurant.save();

//     return res.status(200).json({
//       success: true,
//       data: restaurant.menu[categoryIndex],
//       message: 'Menu category updated successfully'
//     });
//   } catch (error : any) {
//     console.error('Error updating menu category:', error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ success: false, message: error.message });
//     }
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

/**
 * Delete a menu category
 */
export const deleteMenuCategory = async (req: Request, res: Response) => {
  try {
    const { restaurantId, categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const categoryIndex = restaurant.menu.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${categoryId} not found`
      });
    }

    restaurant.menu.splice(categoryIndex, 1);
    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: 'Menu category deleted successfully'
    });
  } catch (error : any) {
    console.error('Error deleting menu category:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Add a menu item to a category
 */
export const addMenuItem = async (req: Request, res: Response) => {
  try {
    const { restaurantId, categoryId } = req.params;
    const itemData = req.body;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const categoryIndex = restaurant.menu.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${categoryId} not found`
      });
    }

    // Check if item ID already exists in this category
    const existingItem = restaurant.menu[categoryIndex].items.find(i => i.id === itemData.id);
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: `Item with ID ${itemData.id} already exists in this category`
      });
    }

    restaurant.menu[categoryIndex].items.push(itemData);
    await restaurant.save();

    return res.status(201).json({
      success: true,
      data: itemData,
      message: 'Menu item added successfully'
    });
  } catch ( error: any) {
    console.error('Error adding menu item:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Update a menu item
//  */
// export const updateMenuItem = async (req: Request, res: Response) => {
//   try {
//     const { restaurantId, categoryId, itemId } = req.params;
//     const updateData = req.body;

//     if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
//       return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
//     }

//     const restaurant = await Restaurant.findById(restaurantId);

//     if (!restaurant) {
//       return res.status(404).json({ success: false, message: 'Restaurant not found' });
//     }

//     const categoryIndex = restaurant.menu.findIndex(c => c.id === categoryId);
//     if (categoryIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: `Category with ID ${categoryId} not found`
//       });
//     }

//     const itemIndex = restaurant.menu[categoryIndex].items.findIndex(i => i.id === itemId);
//     if (itemIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: `Item with ID ${itemId} not found in this category`
//       });
//     }

//     restaurant.menu[categoryIndex].items[itemIndex] = {
//       ...restaurant.menu[categoryIndex].items[itemIndex].toObject(),
//       ...updateData
//     };

//     await restaurant.save();

//     return res.status(200).json({
//       success: true,
//       data: restaurant.menu[categoryIndex].items[itemIndex],
//       message: 'Menu item updated successfully'
//     });
//   } catch (error : any) {
//     console.error('Error updating menu item:', error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ success: false, message: error.message });
//     }
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

/**
 * Delete a menu item
 */
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { restaurantId, categoryId, itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const categoryIndex = restaurant.menu.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${categoryId} not found`
      });
    }

    const itemIndex = restaurant.menu[categoryIndex].items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Item with ID ${itemId} not found in this category`
      });
    }

    restaurant.menu[categoryIndex].items.splice(itemIndex, 1);
    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error : any) {
    console.error('Error deleting menu item:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get popular menu items
//  */
// export const getPopularItems = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
//     }

//     const restaurant = await Restaurant.findById(id);

//     if (!restaurant) {
//       return res.status(404).json({ success: false, message: 'Restaurant not found' });
//     }

//     const popularItems = restaurant.getPopularItems();

//     return res.status(200).json({
//       success: true,
//       data: popularItems
//     });
//   } catch (error : any) {
//     console.error('Error fetching popular items:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// ==========================================
// Table Management Controllers
// ==========================================

/**
 * Get all tables for a restaurant
 */
export const getRestaurantTables = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(id, 'tables');

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    return res.status(200).json({
      success: true,
      data: restaurant.tables
    });
  } catch (error : any) {
    console.error('Error fetching tables:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Add a new table to the restaurant
 */
export const addRestaurantTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tableData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Check if table number already exists
    const existingTable = restaurant.tables.find(t => t.tableNumber === tableData.tableNumber);
    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: `Table with number ${tableData.tableNumber} already exists`
      });
    }

    restaurant.tables.push(tableData);
    await restaurant.save();

    return res.status(201).json({
      success: true,
      data: tableData,
      message: 'Table added successfully'
    });
  } catch (error : any) {
    console.error('Error adding table:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Update a table's information
 */
// export const updateRestaurantTable = async (req: Request, res: Response) => {
//   try {
//     const { restaurantId, tableNumber } = req.params;
//     const updateData = req.body;

//     if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
//       return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
//     }

//     const restaurant = await Restaurant.findById(restaurantId);

//     if (!restaurant) {
//       return res.status(404).json({ success: false, message: 'Restaurant not found' });
//     }

//     const tableIndex = restaurant.tables.findIndex(t => t.tableNumber === tableNumber);
//     if (tableIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: `Table with number ${tableNumber} not found`
//       });
//     }

//     // If tableNumber is being updated, ensure it doesn't conflict with existing tables
//     if (updateData.tableNumber && updateData.tableNumber !== tableNumber) {
//       const existingTable = restaurant.tables.find(t => t.tableNumber === updateData.tableNumber);
//       if (existingTable) {
//         return res.status(400).json({
//           success: false,
//           message: `Table with number ${updateData.tableNumber} already exists`
//         });
//       }
//     }

//     restaurant.tables[tableIndex] = {
//       ...restaurant.tables[tableIndex].toObject(),
//       ...updateData
//     };

//     await restaurant.save();

//     return res.status(200).json({
//       success: true,
//       data: restaurant.tables[tableIndex],
//       message: 'Table updated successfully'
//     });
//   } catch (error : any) {
//     console.error('Error updating table:', error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ success: false, message: error.message });
//     }
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

/**
 * Delete a table
 */
export const deleteRestaurantTable = async (req: Request, res: Response) => {
  try {
    const { restaurantId, tableNumber } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const tableIndex = restaurant.tables.findIndex(t => t.tableNumber === tableNumber);
    if (tableIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Table with number ${tableNumber} not found`
      });
    }

    // Check if table is in use
    if (restaurant.tables[tableIndex].status === 'occupied') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete table ${tableNumber} because it is currently occupied`
      });
    }

    restaurant.tables.splice(tableIndex, 1);
    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error : any) {
    console.error('Error deleting table:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get available tables
//  */
// export const getAvailableTables = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
//     }

//     const restaurant = await Restaurant.findById(id);

//     if (!restaurant) {
//       return res.status(404).json({ success: false, message: 'Restaurant not found' });
//     }

//     const availableTables = restaurant.getAvailableTables();

//     return res.status(200).json({
//       success: true,
//       data: availableTables
//     });
//   } catch (error : any) {
//     console.error('Error fetching available tables:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

/**
 * Update table status (available, occupied, reserved, maintenance)
 */
export const updateTableStatus = async (req: Request, res: Response) => {
  try {
    const { restaurantId, tableNumber } = req.params;
    const { status, orderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const tableIndex = restaurant.tables.findIndex(t => t.tableNumber === tableNumber);
    if (tableIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Table with number ${tableNumber} not found`
      });
    }

    restaurant.tables[tableIndex].status = status;
    
    // Update current order if provided
    if (status === 'occupied' && orderId) {
      restaurant.tables[tableIndex].currentOrder = orderId;
    } else if (status === 'available') {
      restaurant.tables[tableIndex].currentOrder = undefined;
    }

    await restaurant.save();

    return res.status(200).json({
      success: true,
      data: restaurant.tables[tableIndex],
      message: `Table status updated to ${status}`
    });
  } catch (error : any) {
    console.error('Error updating table status:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==========================================
// POS-Specific Controllers
// ==========================================

/**
 * Search menu items across all categories
 */
export const searchMenuItems = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { query } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const searchTerm = String(query).toLowerCase();
    const results: Array<{item: MenuItem, category: string}> = [];

    restaurant.menu.forEach(category => {
      const matchedItems = category.items.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        (item.description && item.description.toLowerCase().includes(searchTerm))
      );

      matchedItems.forEach(item => {
        results.push({
          item,
          category: category.name
        });
      });
    });

    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error : any) {
    console.error('Error searching menu items:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get quick stats for the restaurant dashboard
 */
// export const getRestaurantStats = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
//     }

//     const restaurant = await Restaurant.findById(id);

//     if (!restaurant) {
//       return res.status(404).json({ success: false, message: 'Restaurant not found' });
//     }

//     // Count tables by status
//     const tableStats = {
//       total: restaurant.tables.length,
//       available: restaurant.tables.filter(t => t.status === 'available').length,
//       occupied: restaurant.tables.filter(t => t.status === 'occupied').length,
//       reserved: restaurant.tables.filter(t => t.status === 'reserved').length,
//       maintenance: restaurant.tables.filter(t => t.status === 'maintenance').length
//     };

//     // Count menu items by category
//     const menuStats = restaurant.menu.map(category => ({
//       category: category.name,
//       itemCount: category.items.length
//     }));

//     // Calculate menu diversity
//     const totalItems = restaurant.menu.reduce((sum, category) => sum + category.items.length, 0);

//     return res.status(200).json({
//       success: true,
//       data: {
//         isOpen: restaurant.isOpen(),
//         tableStats,
//         menuStats,
//         totalItems,
//         totalCategories: restaurant.menu.length,
//         averageRating: restaurant.averageRating,
//         reviewCount: restaurant.reviewCount
//       }
//     });
//   } catch (error : any) {
//     console.error('Error fetching restaurant stats:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

/**
 * Export full menu data (for printing, PDF generation, etc.)
 */
export const exportMenuData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(id, 'name description priceRange menu');

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Process menu data for export
    const processedMenu = restaurant.menu.map(category => {
      const items = category.items.map(item => ({
        name: item.name,
        description: item.description || '',
        price: item.price,
        isVegetarian: item.isVegetarian || false,
        isVegan: item.isVegan || false,
        isGlutenFree: item.isGlutenFree || false,
        allergens: item.allergens || [],
        spicyLevel: item.spicyLevel || 0
      }));

      return {
        name: category.name,
        description: category.description || '',
        items
      };
    });

    const exportData = {
      restaurantName: restaurant.name,
      description: restaurant.description,
      priceRange: restaurant.priceRange,
      exportDate: new Date(),
      menu: processedMenu
    };

    return res.status(200).json({
      success: true,
      data: exportData
    });
  } catch (error : any) {
    console.error('Error exporting menu data:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get available menu items by category (optimized for POS ordering)
 */
export const getAvailableMenuByCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Filter menu to only include available items within each category
    const availableMenu = restaurant.menu.map(category => ({
      id: category.id,
      name: category.name,
      items: category.items.filter(item => item.available !== false)
    }));

    return res.status(200).json({
      success: true,
      data: availableMenu
    });
  } catch (error : any) {
    console.error('Error fetching available menu:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Batch update multiple menu items (e.g., mark items as unavailable)
 */