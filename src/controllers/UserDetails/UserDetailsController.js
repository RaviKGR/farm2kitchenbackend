const {
  getUerDetailServieces,
  updateUserDetailServices,
  addNewUserByAdminService,
  getUserService,
  SearchUserDetailServices,
  getUserDetailServieces,
  getAllUserdetailsService,
  addAddressByUserIdService,
  getCustomerAddressByIdService,
  updateAllUserInfoService,
  updateUserAddressDefaultService,
} = require("../../services/UserDetails/UserDetailServieces");

const getUserDetailController = async (req, res) => {
  const userId = req.query.userId;
  try {
    if (!userId) {
      return res.status(400).send("Check the UserId");
    } else {
      await getUserDetailServieces(req.query, (err, data) => {
        if (err) {
          return res.status(500).send(err);
        } else {
          return res.status(200).send(data);
        }
      });
    }
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
};
const updateUserDetailController = async (req, res) => {
  try {
    const { name, password, userId } = req.body;

    // Validate required fields
    if (!name || !password || !userId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // Call the service to update user details
    const result = await updateUserDetailServices(req.body);
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in updateUserDetailController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllUserdetailsController = async (req, res) => {
  const { limit, offset, name, phoneNumber } = req.query;
  try {
    if (!limit || !offset) {
      return res.status(400).send("Required All Fields");
    } else {
      await getAllUserdetailsService(req.query, (err, data) => {
        if (err) {
          return res.status(500).send(err);
        } else {
          return res.status(200).send(data);
        }
      });
    }
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
};

const updateAllUserInfoController = async (req, res) => {
  const { Name, phoneNumber, email, city, userId, addressId } = req.body;

  try {
    if (!Name || !phoneNumber || !userId) {
      return res.status(400).send("Required All Fields");
    } else {
      const result = await updateAllUserInfoService(req.body);
      return res.status(result.status).json(result);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserAddressDefaultController = async (req, res) => {
  const { userId, addressId, isDefault } = req.body;  
  try {
    if(!userId || !addressId) {
      return res.status(400).send("Required All Fields");
    } else {
      const result = await updateUserAddressDefaultService(req.body);
      return res.status(result.status).json(result);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};
// ADMIN

const addNewUserByAdminController = async (req, res) => {
  const {
    userName,
    userEmail,
    phoneNumber,
    street,
    state,
    city,
    postalCode,
    isDefault,
  } = req.body;
  try {
    if (
      !userName ||
      !userEmail ||
      !phoneNumber ||
      !street ||
      !state ||
      !city ||
      !postalCode ||
      !isDefault
    ) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      await addNewUserByAdminService(req.body, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.status(201).send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};

const getUserController = async (req, res) => {
  const { limit, offset } = req.query;
  try {
    if (!limit || !offset) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      await getUserService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};
const SearchUserDetailController = async (req, res) => {
  const userName = req.query.customer;
  try {
    if (!userName) {
      return res.status(400).json({ error: "Check the UserName" });
    }
    const userDetails = await SearchUserDetailServices(userName);
    return res.status(200).json(userDetails);
  } catch (error) {
    if (error.error) {
      return res.status(404).json(error);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

const addAddressByUserIdController = async (req, res) => {
  const { userId, street, city, state, postalCode, country, isDefault } =
    req.body;
  try {
    if (
      !userId ||
      !street ||
      !city ||
      !state ||
      !postalCode ||
      !country ||
      isDefault === null ||
      isDefault === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    } else {
      const result = await addAddressByUserIdService(req.body);
      return res.status(result.success ? 201 : 400).json(result);
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCustomerAddressByIdController = async (req, res) => {
  const { userId } = req.query;  
  try {
    if (!userId) {
      return res.status(400).json({ message: "All fields are required" });
    } else {
      const result = await getCustomerAddressByIdService(userId);
      return res.status(200).json(result);
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getUserDetailController,
  updateUserDetailController,
  getAllUserdetailsController,
  addNewUserByAdminController,
  getUserController,
  SearchUserDetailController,
  addAddressByUserIdController,
  getCustomerAddressByIdController,
  updateAllUserInfoController,
  updateUserAddressDefaultController,
};
