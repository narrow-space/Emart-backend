const cartDb = require("../../model/Carts/cartsModel")
const productDb = require("../../model/product/productModel")
////addtocart controler//


exports.AddtoCart = async (req, res) => {
    const { id } = req.params;

    try {
        const getproduct = await productDb.findOne({ _id: id });
        const cartItem = await cartDb.findOne({ userid: req.userId, productid: id });

        if (!getproduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (getproduct.quantity < 1) {
            return res.status(400).json({ error: "This product is out of stock" });
        }

        if (cartItem) {
            if (cartItem.quantity < 5) {
                // Increment quantity of existing cart item
                cartItem.quantity += 1;
                await cartItem.save();
                // Decrement Product Quantity
                getproduct.quantity -= 1;
                await getproduct.save();
                return res.status(200).json({ message: "Product quantity increased successfully" });
            } else {
                return res.status(400).json({ error: "You cannot add more than 5 units of this product to your cart" });
            }
        } else {
            if (getproduct.quantity >= 1) {
                // Create new cart item
                const addtoCart = new cartDb({
                    userid: req.userId,
                    productid: id,
                    quantity: 1
                });
                await addtoCart.save();
                // Decrement Product Quantity
                getproduct.quantity -= 1;
                await getproduct.save();
                return res.status(200).json({ message: "Product added to cart successfully" });
            } else {
                return res.status(400).json({ error: "This product is out of stock" });
            }
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};



////Getcart items controler//

exports.Getcart = async (req, res) => {
    try {
        const getcarts = await cartDb.aggregate([
            {
                $match: { userid: req.usermainid }
            },
            {
                $lookup: {
                    from: "productmodels",
                    localField: "productid",
                    foreignField: "_id",
                    as: "details"
                }
            },
            ///getting frist data from details array

            {
                $project: {
                    _id: 1,
                    userid: 1,
                    productid: 1,
                    quantity:1,
                    details:{$arrayElemAt:['$details',0]}////Extract frist ellement from array

                }
            }
        ]);


        res.status(200).json(getcarts);
    } catch (error) {
        res.status(400).json(error);
    }
};


////REmove Items From CaRts
exports.RemoveSingleItemFromCart = async (req, res) => {
    const { id } = req.params
    try {
        const getproduct = await productDb.findOne({ _id: id })
        const checkCart = await cartDb.findOne({ userid: req.userId, productid: getproduct._id })
        if (!checkCart) {
            res.status(400).json({ error: "cart items not forund" })


        }
        if (checkCart.quantity == 1) {

            const deletecartitem = await cartDb.findByIdAndDelete({ _id: checkCart._id })
            ///Increment Product Quantity
            getproduct.quantity = getproduct.quantity + 1
            await getproduct.save()
            res.status(200).json({ message: "Item Sucessfully Remove From Cart", deletecartitem })


        }
        else if (checkCart.quantity > 1) {
            checkCart.quantity = checkCart.quantity - 1
            await checkCart.save()
            ///Increment Product Quantity
            getproduct.quantity = getproduct.quantity + 1
            await getproduct.save()
            res.status(200).json({ message: "Item Sucessfully Decrement" })
        }
    }
    catch (error) {
        res.status(400).json(error)
    }
}
////Remove all Items form cart///
exports.Removeallitems = async (req, res) => {
    const { id } = req.params
    try {
        const getproduct = await productDb.findOne({ _id: id })
        const checkCart = await cartDb.findOne({ userid: req.userId, productid: getproduct._id })
        if (!checkCart) {
            res.status(400).json({ error: "cart items not forund" })
        }

        const deletecartItem = await cartDb.findByIdAndDelete({ _id: checkCart._id })
        getproduct.quantity = getproduct.quantity + checkCart.quantity
        await getproduct.save()
        res.status(200).json({ message: "Item Sucessfully Remove From Cart", deletecartItem })



    } catch (error) {
        res.status(400).json(error)
    }
}


////Delete items from cart when ordred done//
exports.Emptycart = async (req, res) => {
    try {
        const Deletecats = await cartDb.deleteMany({ userid: req.userId })
        res.status(200).json(Deletecats)
    } catch (error) {
        res.status(400).json(error)
    }
}