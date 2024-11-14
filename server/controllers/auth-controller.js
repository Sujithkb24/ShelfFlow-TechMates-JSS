const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Products = require('../models/product.model');
const supplierModel = require('../models/supplier.model');
const Cart = require("../models/cart-model")

const updateProduct = async (req, res) => {
  const productid = new mongoose.Types.ObjectId("672f70f4114bc486efd1af20");
  const data = { quantity: 8, price: 12, total_sold: 32, productthreshold: 5, supplierName: 'Malli' };
  const updateProduct = await Products.updateOne({ _id: productid }, { $set: data });
  return res.json(updateProduct);
}

const updateStock = async (req, res) => {
    console.log(req.body, "req");
    const { cartItems } = req.body;
    const shopid = "SHOP001";
    const errorItems = [];

    console.log("cartItems", cartItems);

    cartItems.sort((a, b) => a.quantity - b.quantity);
    console.log(" sorted cartitems", cartItems)

    // Using a for...of loop to handle async operations sequentially
    for (const element of cartItems) {
        const product = await Products.findOne({ shopid: shopid, productname: element.productname });
        
        if (!product) {
            // Product not found, add to errorItems or handle accordingly
            errorItems.push({ productname: element.productname, message: "Product not found" });
            continue;
        }

        console.log(product, "product");

        if (product.quantity < element.quantity) {
            // Not enough stock, add to errorItems
            errorItems.push(product);
        } else {
            // Update the product quantity
            product.quantity -= element.quantity;
            product.total_sold += element.quantity
            product.revenue_generated += (product.price)*element.quantity
            // Save updated product quantity in the database
            await Products.updateOne({ _id: product._id }, { $set: { quantity: product.quantity, total_sold: product.total_sold, revenue_generated: product.revenue_generated } });

            const itemid = element._id
            console.log(itemid)
            // Remove item from the cart
            await Cart.deleteOne({ shopid: shopid, _id: itemid });
        }
    }

    console.log("errorItems", errorItems);

    // Send a response based on the presence of errorItems
    if (errorItems.length < 1) {
        return res.json({ success: true, message: "Stock updated successfully" });
    } else {
        return res.json({success: false, errorItems: errorItems, message: "Insufficient Stock" });
    }
};

const addToCart = async(req, res) => {
    const {productname, quantity} = req.body;
    const shopid = req.shopid || "SHOP001"
    console.log(productname, quantity, shopid)

    const addItemToCart = await Cart.create({productname, quantity, shopid})
    console.log(addItemToCart)

    const cartItems = await Cart.find({shopid: shopid});
    return res.json({cartItems: cartItems})
}

const insertProduct = async(req, res) => {
    console.log("Hii")
    const shopid = req.shopid || "HOP002"
    console.log("Hiii Baby")
    const productName = req.body.productName;
    console.log("productname", productName)
    const product = await Products.findOne({productname: productName, shopid: shopid})

    /////////////
    const {supplierName, supplierEmail, price} = req.body;
    console.log(supplierEmail, supplierName)
    
    ///////////

    if(product)
    {
        const imageName = product.imagename;
        console.log(imageName)
        return res.json({imagesource: imageName})
    }


    function convertTextToNumber(text) {
        let numericValue = 0;
        for (let i = 0; i < text.length; i++) {
            numericValue += text.charCodeAt(i);
        }

        return numericValue.toString().slice(0, 16);
    }

    const result = convertTextToNumber(productName);
    
    async function generateBarcode(result) {
        const apiUrl = `https://barcodeapi.org/api/${result}`;

        try {
            const response = await axios.get(apiUrl);
            
            const base64Data = response.data.base64;
            
            if (!base64Data) {
                console.error('No base64 data found in the response.');
                return;
            }

  const imageBuffer = Buffer.from(base64Data, "base64")
  const imagesDir = path.join(__dirname, "../../client/public/images");
  if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir);
  }
  
  const imagePath = path.join(imagesDir, `barcode${result}.png`);
  

  fs.writeFileSync(imagePath, imageBuffer);
  console.log('Barcode image saved successfully:', imagePath);

        } catch (error) {
            console.error('Error generating barcode:', error);
        }
    }

    // Example usage
    const barcodeId = (result + productName.slice(0,3)+ shopid.slice(0,3)).trim()
    const imageName = `barcode${barcodeId}.png`
    generateBarcode(barcodeId);

    const createProduct = await Products.create({barcodeid: barcodeId,imagename: imageName, productname: productName, quantity: 0, price: price, total_sold: 0, shopid: "SHOP001", productthreshold: 0, supplierName:supplierName} )//////
    const existingSupplier = await supplierModel.findOne({ supplierName, supplierEmail });
    if (existingSupplier) {
        existingSupplier.products.push(productName);
        console.log(existingSupplier)
        await existingSupplier.save();
    } else {
        const supEmail = await supplierModel.find({supplierEmail: supplierEmail})
        if(supEmail.length > 0)
        {
            return res.json({msg: "Supplier email already present. Check the username"})
        }
        const newSupplier = await supplierModel.create({ supplierName, supplierEmail, products: [productName] });
        console.log(newSupplier)
        await newSupplier.save();
    }
    ////////////////////////////////////////////////
    
    ////////////////////


    console.log(createProduct)
    return res.json({imagesource: imageName})
}

const deleteItem = async(req, res) => {
    console.log("Deleteing")
    const shopid = "SHOP001";
    const {itemId} = req.body;
    console.log(itemId)
    await Cart.deleteOne({_id: itemId, shopid: shopid})
    const cartItems = await Cart.find({shopid: shopid});
    return res.json({cartItems: cartItems})
}

const getCartItems = async(req, res) => {
    const shopid = req.shopid;
    const cartItems = await Cart.find({shopid: "SHOP001"});
    return res.json({cartItems: cartItems})
}

const scanProduct = async(req, res) => {
    const {data} = req.body;
    console.log("data", data)
    const fetchProduct = await Products.findOne({barcodeid: data})
    if(!fetchProduct)
    {
        return res.json({productname: "Scan Again"})
    }
    return res.json({productname: fetchProduct.productname})
}

module.exports = {updateStock, addToCart, insertProduct, updateProduct, deleteItem, getCartItems, scanProduct};
