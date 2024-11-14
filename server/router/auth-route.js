const express = require("express")
const router = express.Router();
const { registerAdmin, loginAuth} = require("../controllers/adminAuth.controller");
const authControllers = require("../controllers/auth-controller");
const { getAllSupplier } = require("../controllers/supplier.controller");

router.route("/register").post(registerAdmin)
router.route("/login").post(loginAuth)
router.route("/insertproduct").post(authControllers.insertProduct);
router.route("/updateprodct").post(authControllers.updateProduct);
router.route("/deleteproduct").post(authControllers.deleteItem)
router.route("/getcartitems").get(authControllers.getCartItems)
router.route("/scanproduct").post(authControllers.scanProduct)
router.route("/addtocart").post( authControllers.addToCart)
router.route("/updatestock").post( authControllers.updateStock)
router.route("/deleteitemincart").post(authControllers.deleteItem)
router.route("/deleteproduct").post(authControllers.deleteItem);
router.route("/allSupplier").post(getAllSupplier)

module.exports = router